# Sentry Monitoring Setup

This guide covers setting up Sentry for error tracking and performance monitoring in the Podverse production deployment.

## 1. Create a Sentry Project

1. Sign up or log in at [sentry.io](https://sentry.io)
2. Create a new project:
   - Platform: **Next.js**
   - Project name: `podverse` (or your preferred name)
3. Note the **DSN** from the project settings -- you will need this for configuration

## 2. Install Dependencies

From the repository root, add the Sentry Next.js SDK to the webapp package:

```bash
yarn workspace webapp add @sentry/nextjs
```

## 3. Initialize Sentry

Run the Sentry wizard to scaffold configuration files:

```bash
cd packages/webapp
npx @sentry/wizard@latest -i nextjs
```

This creates the following files:

- `sentry.client.config.ts` -- Client-side Sentry initialization
- `sentry.server.config.ts` -- Server-side Sentry initialization
- `sentry.edge.config.ts` -- Edge runtime Sentry initialization
- `next.config.mjs` updates -- Wraps the existing config with `withSentryConfig`

If you prefer manual setup, create each file as described below.

### sentry.client.config.ts

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
  ],
});
```

### sentry.server.config.ts

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

### sentry.edge.config.ts

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

### next.config.mjs Update

Wrap the existing Next.js config with `withSentryConfig`:

```javascript
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  // ... existing config
};

export default withSentryConfig(nextConfig, {
  org: 'your-sentry-org',
  project: 'podverse',
  silent: true, // Suppress source map upload logs during build
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
});
```

## 4. Environment Variables

Add the following to your Vercel project environment variables:

| Variable | Description | Scope |
|----------|-------------|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (Data Source Name) | All environments |
| `SENTRY_ORG` | Sentry organization slug | Build time |
| `SENTRY_PROJECT` | Sentry project slug | Build time |
| `SENTRY_AUTH_TOKEN` | Sentry auth token (for source map uploads) | Build time |

### Generate an Auth Token

1. Go to [sentry.io/settings/auth-tokens](https://sentry.io/settings/auth-tokens/)
2. Create a new token with the scopes: `project:releases`, `org:read`
3. Add it as `SENTRY_AUTH_TOKEN` in Vercel

For local development, add these to `packages/webapp/.env.local`:

```
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=podverse
SENTRY_AUTH_TOKEN=your-auth-token
```

## 5. Vercel Integration

Sentry has a first-party Vercel integration that simplifies setup:

1. Go to [vercel.com/integrations/sentry](https://vercel.com/integrations/sentry)
2. Click **Add Integration**
3. Select your Vercel team and the Podverse project
4. Authorize Sentry access
5. The integration automatically:
   - Sets `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN`
   - Uploads source maps on each deployment
   - Creates releases tagged with the Vercel deployment ID

## 6. Custom Error Reporting

### API Route Error Handling

For API routes (e.g., the chat route), wrap handlers to capture errors:

```typescript
import * as Sentry from '@sentry/nextjs';

export async function POST(req: Request) {
  try {
    // ... handler logic
  } catch (error) {
    Sentry.captureException(error, {
      extra: { route: '/api/chat' },
    });
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

### Inngest Function Monitoring

Inngest functions run in serverless contexts. Add Sentry to the processing pipeline to catch failures:

```typescript
import * as Sentry from '@sentry/nextjs';

// In inngest/functions.ts, within the catch block:
catch (error) {
  Sentry.captureException(error, {
    tags: { episodeId: String(episodeId) },
    extra: { event },
  });
  // ... existing error handling
}
```

### User Context

Set user context when Clerk authentication is available:

```typescript
import * as Sentry from '@sentry/nextjs';
import { auth } from '@clerk/nextjs/server';

const { userId } = auth();
if (userId) {
  Sentry.setUser({ id: userId });
}
```

## 7. Alert Configuration

Set up alerts in the Sentry dashboard for production issues:

### Recommended Alerts

1. **High Error Rate**
   - Condition: More than 10 errors in 5 minutes
   - Action: Email + Slack notification

2. **New Issue**
   - Condition: A new (previously unseen) error occurs
   - Action: Email notification

3. **Processing Pipeline Failure**
   - Condition: Error with tag `route:/api/inngest` or custom tag `inngest:true`
   - Action: Immediate notification

4. **Slow API Response**
   - Condition: Transaction duration > 10s for `/api/chat`
   - Action: Email notification

### Configure Alerts

1. Go to **Alerts** in Sentry dashboard
2. Click **Create Alert Rule**
3. Select the condition type (Issue, Metric, etc.)
4. Define the trigger conditions
5. Set the notification target (email, Slack, PagerDuty, etc.)

## 8. Performance Monitoring

Sentry captures transaction traces for performance monitoring. Key transactions to watch:

| Transaction | Description | Acceptable P95 |
|-------------|-------------|-----------------|
| `GET /` | Homepage load | < 2s |
| `GET /podcast/[slug]` | Podcast page | < 3s |
| `POST /api/chat` | Chat API response | < 15s |
| `POST /api/inngest` | Inngest function invocation | < 30s |

Adjust `tracesSampleRate` based on traffic volume:
- Low traffic (< 1000 req/day): `1.0` (100%)
- Medium traffic (1000-10000 req/day): `0.1` (10%)
- High traffic (> 10000 req/day): `0.01` (1%)

## 9. Source Maps

Source maps are uploaded automatically during Vercel builds when `SENTRY_AUTH_TOKEN` is configured. This provides readable stack traces in the Sentry dashboard instead of minified code.

To verify source maps are working:

1. Trigger a test error in production
2. Check the error in Sentry dashboard
3. Stack traces should show original TypeScript source with line numbers

If source maps are not resolving:
- Verify `SENTRY_AUTH_TOKEN` has the correct scopes
- Check the Vercel build logs for Sentry upload messages
- Ensure `hideSourceMaps: true` is set to prevent public access to source maps

## 10. Testing the Setup

After configuration, verify Sentry is working:

```typescript
// Add temporarily to any page or API route:
throw new Error('Sentry test error - safe to delete');
```

Or use the Sentry test button:

```bash
npx @sentry/wizard@latest -i nextjs --test
```

Check the Sentry dashboard -- the test error should appear within a few seconds.
