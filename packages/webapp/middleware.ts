import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

// --- In-memory rate limiter ---
// Works on single-instance deployments and Vercel serverless (per-isolate).
// For multi-region production, replace with Redis-based rate limiting.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up stale entries periodically to prevent memory leaks
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

function isRateLimited(
  key: string,
  maxRequests: number,
  windowMs: number
): { limited: boolean; remaining: number; resetAt: number } {
  cleanupStaleEntries();

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { limited: true, remaining: 0, resetAt: entry.resetAt };
  }

  return { limited: false, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// Rate limit configs per route pattern
const RATE_LIMITS: { pattern: RegExp; maxRequests: number; windowMs: number }[] = [
  // Chat API: 30 requests per minute per IP
  { pattern: /^\/api\/chat/, maxRequests: 30, windowMs: 60_000 },
  // Webhook endpoints: 120 requests per minute per IP
  { pattern: /^\/api\/stripe-webhooks/, maxRequests: 120, windowMs: 60_000 },
  { pattern: /^\/api\/inngest/, maxRequests: 120, windowMs: 60_000 },
];

function checkRateLimit(request: NextRequest): NextResponse | null {
  const pathname = new URL(request.url).pathname;
  const ip = getClientIp(request);

  for (const { pattern, maxRequests, windowMs } of RATE_LIMITS) {
    if (pattern.test(pathname)) {
      const key = `${ip}:${pathname}`;
      const { limited, remaining, resetAt } = isRateLimited(key, maxRequests, windowMs);

      if (limited) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
              'X-RateLimit-Limit': String(maxRequests),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
            },
          }
        );
      }

      // Attach rate limit headers to successful responses downstream
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', String(maxRequests));
      response.headers.set('X-RateLimit-Remaining', String(remaining));
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));
      return response;
    }
  }

  return null;
}

export default clerkMiddleware((auth, request) => {
  // Check rate limits first
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse && rateLimitResponse.status === 429) {
    return rateLimitResponse;
  }

  if (isProtectedRoute(request)) {
    auth().protect();
  }

  return rateLimitResponse || NextResponse.next();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
