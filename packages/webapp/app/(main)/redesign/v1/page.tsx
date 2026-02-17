/* =============================================================================
 * AGENT CLAIMS
 * ---------------------------------------------------------------------------
 * Proposed App Name: Auralux
 * Aesthetic Direction: Dark Audio-Native (Spotify meets Linear)
 * Display Font: Space Grotesk (geometric, sharp, technical)
 * Body Font: Inter (clean, readable, neutral)
 * Accent HSL: hsl(258, 90%, 66%) — Electric Violet (#7C3AED)
 * Secondary Accent: hsl(199, 89%, 48%) — Cyan (#0EA5E9)
 * Background: #09090b (zinc-950)
 * Card Surface: rgba(255,255,255,0.03)
 * Layout Agent: Full-width hero, 1280px max content, 8px base spacing
 * Breakpoints: sm:640 md:768 lg:1024 xl:1280
 * =========================================================================== */

'use client';

import { Space_Grotesk, Inter } from 'next/font/google';
import Link from 'next/link';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

// ---------------------------------------------------------------------------
// Placeholder data
// ---------------------------------------------------------------------------

const FEATURED_PODCASTS = [
  { id: 1, title: 'The Cognitive Revolution', host: 'Nathan Labenz', category: 'AI & Tech', episodes: 184, color: '#7C3AED' },
  { id: 2, title: 'Huberman Lab', host: 'Andrew Huberman', category: 'Health & Science', episodes: 312, color: '#0EA5E9' },
  { id: 3, title: 'Acquired', host: 'Ben Gilbert & David Rosenthal', category: 'Business', episodes: 203, color: '#F59E0B' },
  { id: 4, title: 'Lex Fridman Podcast', host: 'Lex Fridman', category: 'Technology', episodes: 421, color: '#EC4899' },
  { id: 5, title: 'The Prof G Pod', host: 'Scott Galloway', category: 'Business', episodes: 278, color: '#10B981' },
  { id: 6, title: 'Darknet Diaries', host: 'Jack Rhysider', category: 'Technology', episodes: 156, color: '#EF4444' },
];

const CATEGORIES = [
  { name: 'Technology', slug: 'technology', episodes: 1247, icon: '01' },
  { name: 'Health & Science', slug: 'health', episodes: 893, icon: '02' },
  { name: 'Business', slug: 'business', episodes: 1102, icon: '03' },
  { name: 'Culture & Society', slug: 'culture', episodes: 674, icon: '04' },
];

const AI_FEATURES = [
  {
    title: 'Chat with any episode',
    description: 'Ask questions about the content and get answers with exact timestamps. Our AI reads every transcript so you don\'t have to.',
    icon: 'chat',
  },
  {
    title: 'Full transcripts',
    description: 'Speaker-identified transcripts for every episode. Search, read, and jump to any moment instantly.',
    icon: 'transcript',
  },
  {
    title: 'Topic extraction',
    description: 'AI identifies every topic discussed across all podcasts. Search once, discover moments across hundreds of episodes.',
    icon: 'topics',
  },
  {
    title: 'Smart summaries',
    description: 'Get the key takeaways in seconds. Each episode is distilled into structured summaries with the most important insights.',
    icon: 'summary',
  },
];

// ---------------------------------------------------------------------------
// Animated SVG components
// ---------------------------------------------------------------------------

function AudioWaveform() {
  const bars = [
    { height: 32, delay: '0s', dur: '1.2s' },
    { height: 48, delay: '0.15s', dur: '0.9s' },
    { height: 24, delay: '0.3s', dur: '1.4s' },
    { height: 56, delay: '0.1s', dur: '1.0s' },
    { height: 40, delay: '0.25s', dur: '1.3s' },
    { height: 20, delay: '0.05s', dur: '1.1s' },
    { height: 52, delay: '0.2s', dur: '0.8s' },
    { height: 36, delay: '0.35s', dur: '1.2s' },
    { height: 44, delay: '0.12s', dur: '1.0s' },
    { height: 28, delay: '0.28s', dur: '1.3s' },
    { height: 60, delay: '0.08s', dur: '0.9s' },
    { height: 32, delay: '0.22s', dur: '1.1s' },
    { height: 48, delay: '0.18s', dur: '1.4s' },
    { height: 20, delay: '0.32s', dur: '1.0s' },
    { height: 44, delay: '0.05s', dur: '1.2s' },
    { height: 36, delay: '0.15s', dur: '0.85s' },
    { height: 56, delay: '0.28s', dur: '1.1s' },
    { height: 24, delay: '0.1s', dur: '1.3s' },
    { height: 40, delay: '0.22s', dur: '0.95s' },
    { height: 52, delay: '0.35s', dur: '1.0s' },
  ];

  return (
    <svg
      viewBox="0 0 200 64"
      className="h-16 w-full max-w-md"
      aria-hidden="true"
      role="img"
    >
      <title>Audio waveform animation</title>
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={i * 10 + 2}
          y={32 - bar.height / 2}
          width="6"
          height={bar.height}
          rx="3"
          fill="url(#waveGrad)"
          opacity="0.8"
        >
          <animate
            attributeName="height"
            values={`${bar.height};${bar.height * 0.3};${bar.height};${bar.height * 0.6};${bar.height}`}
            dur={bar.dur}
            begin={bar.delay}
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            values={`${32 - bar.height / 2};${32 - (bar.height * 0.3) / 2};${32 - bar.height / 2};${32 - (bar.height * 0.6) / 2};${32 - bar.height / 2}`}
            dur={bar.dur}
            begin={bar.delay}
            repeatCount="indefinite"
          />
        </rect>
      ))}
      <defs>
        <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function GradientOrb() {
  return (
    <svg
      viewBox="0 0 600 600"
      className="pointer-events-none absolute -top-48 left-1/2 h-[600px] w-[600px] -translate-x-1/2 opacity-30"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="orbGrad1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.6">
            <animate
              attributeName="stop-color"
              values="#7C3AED;#0EA5E9;#EC4899;#7C3AED"
              dur="12s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="orbGrad2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.4">
            <animate
              attributeName="stop-color"
              values="#0EA5E9;#EC4899;#7C3AED;#0EA5E9"
              dur="15s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="orbBlur">
          <feGaussianBlur stdDeviation="40" />
        </filter>
      </defs>
      <circle cx="260" cy="300" r="200" fill="url(#orbGrad1)" filter="url(#orbBlur)">
        <animate
          attributeName="cx"
          values="260;340;260"
          dur="10s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="340" cy="300" r="180" fill="url(#orbGrad2)" filter="url(#orbBlur)">
        <animate
          attributeName="cx"
          values="340;260;340"
          dur="13s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="cy"
          values="300;260;300"
          dur="9s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

function WaveDivider({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 80"
      preserveAspectRatio="none"
      className={`w-full ${className}`}
      aria-hidden="true"
    >
      <path fill="none" stroke="url(#dividerGrad)" strokeWidth="1.5" opacity="0.4">
        <animate
          attributeName="d"
          values="M0,40 C200,10 400,70 600,40 C800,10 1000,70 1200,40;M0,40 C200,70 400,10 600,40 C800,70 1000,10 1200,40;M0,40 C200,10 400,70 600,40 C800,10 1000,70 1200,40"
          dur="6s"
          repeatCount="indefinite"
        />
      </path>
      <path fill="none" stroke="url(#dividerGrad)" strokeWidth="1" opacity="0.2">
        <animate
          attributeName="d"
          values="M0,40 C200,65 400,15 600,40 C800,65 1000,15 1200,40;M0,40 C200,15 400,65 600,40 C800,15 1000,65 1200,40;M0,40 C200,65 400,15 600,40 C800,65 1000,15 1200,40"
          dur="8s"
          repeatCount="indefinite"
        />
      </path>
      <defs>
        <linearGradient id="dividerGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="20%" stopColor="#7C3AED" />
          <stop offset="80%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function FeatureIcon({ type }: { type: string }) {
  switch (type) {
    case 'chat':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      );
    case 'transcript':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    case 'topics':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
      );
    case 'summary':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RedesignV1Page() {
  return (
    <div
      className={`${spaceGrotesk.variable} ${inter.variable} min-h-screen bg-[#09090b] text-white`}
      style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
    >
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-violet-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      {/* Reduced motion styles */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          svg animate, svg animateTransform {
            animation: none !important;
          }
          svg animate {
            repeatCount: 0 !important;
          }
          .motion-safe\\:animate-pulse {
            animation: none !important;
          }
        }
      `}</style>

      <main id="main-content">
        {/* ================================================================
         * HERO SECTION
         * ================================================================ */}
        <section className="relative overflow-hidden px-4 pb-24 pt-32" aria-label="Hero">
          <GradientOrb />
          <div className="relative z-10 mx-auto max-w-5xl text-center">
            {/* Brand */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-400 backdrop-blur-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-violet-500 motion-safe:animate-pulse" />
              AI-powered podcast intelligence
            </div>

            <h1
              className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span className="block">Listen deeper with</span>
              <span className="bg-gradient-to-r from-violet-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
                Auralux
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
              Search across thousands of podcast episodes by topic, chat with any episode using AI, and discover the exact moments that matter to you.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/explore"
                className="group relative inline-flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-3.5 font-semibold text-white transition-all hover:bg-violet-500 hover:shadow-[0_0_32px_rgba(124,58,237,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
              >
                Start exploring
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/topics"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 font-semibold text-zinc-300 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
              >
                Browse topics
              </Link>
            </div>

            {/* Waveform */}
            <div className="mt-16 flex justify-center">
              <AudioWaveform />
            </div>
          </div>
        </section>

        <WaveDivider className="h-12 -mt-4" />

        {/* ================================================================
         * FEATURED PODCASTS
         * ================================================================ */}
        <section className="px-4 py-20" aria-labelledby="featured-heading">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2
                  id="featured-heading"
                  className="text-3xl font-bold tracking-tight sm:text-4xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Featured podcasts
                </h2>
                <p className="mt-2 text-zinc-500">Curated shows with full AI-powered analysis</p>
              </div>
              <Link
                href="/explore"
                className="hidden items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-violet-400 sm:inline-flex"
              >
                View all
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURED_PODCASTS.map((podcast) => (
                <Link
                  key={podcast.id}
                  href="/explore"
                  className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                >
                  {/* Accent line */}
                  <div
                    className="absolute left-0 top-0 h-full w-0.5 transition-all duration-300 group-hover:w-1"
                    style={{ backgroundColor: podcast.color }}
                  />

                  <div className="flex items-start gap-4">
                    {/* Placeholder artwork */}
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white/80 transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundColor: `${podcast.color}20`, color: podcast.color }}
                    >
                      {podcast.title.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-white transition-colors group-hover:text-violet-300" style={{ fontFamily: 'var(--font-display)' }}>
                        {podcast.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-zinc-500">{podcast.host}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-zinc-600">
                        <span className="rounded-full border border-white/5 bg-white/5 px-2 py-0.5">{podcast.category}</span>
                        <span>{podcast.episodes} episodes</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <WaveDivider className="h-10" />

        {/* ================================================================
         * CATEGORIES
         * ================================================================ */}
        <section className="px-4 py-20" aria-labelledby="categories-heading">
          <div className="mx-auto max-w-6xl">
            <h2
              id="categories-heading"
              className="text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Browse by category
            </h2>
            <p className="mt-2 text-zinc-500">Find podcasts across every domain</p>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/20 hover:bg-white/[0.04] hover:shadow-[0_8px_32px_rgba(124,58,237,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                >
                  {/* Large faded number */}
                  <span className="absolute -right-2 -top-4 text-7xl font-bold text-white/[0.03] transition-colors group-hover:text-violet-500/[0.06]" style={{ fontFamily: 'var(--font-display)' }}>
                    {cat.icon}
                  </span>

                  <h3 className="relative text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                    {cat.name}
                  </h3>
                  <p className="relative mt-2 text-sm text-zinc-500">
                    {cat.episodes.toLocaleString()} episodes
                  </p>
                  <div className="relative mt-4 inline-flex items-center gap-1 text-xs text-zinc-600 transition-colors group-hover:text-violet-400">
                    Explore
                    <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <WaveDivider className="h-10" />

        {/* ================================================================
         * AI FEATURES
         * ================================================================ */}
        <section className="px-4 py-20" aria-labelledby="features-heading">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2
                id="features-heading"
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Powered by AI
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-zinc-500">
                Every episode is analyzed by AI to give you transcripts, topics, summaries, and a chat interface that actually understands the content.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {AI_FEATURES.map((feature) => (
                <div
                  key={feature.icon}
                  className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
                >
                  <div className="mb-4 inline-flex rounded-xl border border-violet-500/20 bg-violet-500/10 p-3 text-violet-400 transition-colors group-hover:border-violet-500/30 group-hover:bg-violet-500/15">
                    <FeatureIcon type={feature.icon} />
                  </div>
                  <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <WaveDivider className="h-10" />

        {/* ================================================================
         * CTA FOOTER
         * ================================================================ */}
        <section className="relative overflow-hidden px-4 py-24" aria-label="Call to action">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-violet-950/20" aria-hidden="true" />
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h2
              className="text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Your podcast, understood.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-400">
              Add any podcast by name or link. We handle transcription, analysis, and AI indexing automatically.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/request"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-3.5 font-semibold text-white transition-all hover:bg-violet-500 hover:shadow-[0_0_32px_rgba(124,58,237,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
              >
                Add a podcast
              </Link>
              <Link
                href="/explore"
                className="text-sm text-zinc-400 transition-colors hover:text-violet-400"
              >
                or explore what's already here
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
