/* AGENT CLAIMS
 * App Name: "The Dial" — editorial podcast journal
 * Display Font: Instrument Serif (Google Fonts)
 * Body Font: Inter (Google Fonts)
 * Accent Color: HSL(8, 76%, 54%) — vermillion/deep coral (#D94F3B)
 * Agent: designer-v2 (component agent, editorial magazine direction)
 */

'use client';

import { Instrument_Serif, Inter } from 'next/font/google';
import { useEffect, useRef, useState } from 'react';

const displayFont = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const bodyFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

/* ------------------------------------------------------------------ */
/*  Animated SVG: Editorial line-draw flourish                        */
/* ------------------------------------------------------------------ */
function EditorialFlourish({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <path
        d="M0 20 Q50 5 100 20 T200 20 T300 20 T400 20"
        stroke="#D94F3B"
        strokeWidth="1.5"
        strokeDasharray="420"
        strokeDashoffset="420"
        strokeLinecap="round"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="420"
          to="0"
          dur="2s"
          fill="freeze"
          begin="0.3s"
        />
      </path>
      <circle cx="200" cy="20" r="3" fill="#D94F3B" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.4s" fill="freeze" begin="2.3s" />
        <animate attributeName="r" from="0" to="3" dur="0.4s" fill="freeze" begin="2.3s" />
      </circle>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated SVG: Pull-quote brackets                                 */
/* ------------------------------------------------------------------ */
function AnimatedQuoteBrackets({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto max-w-2xl px-12 py-8">
      {/* Left bracket */}
      <svg
        className="absolute left-0 top-0 h-full w-8"
        viewBox="0 0 30 120"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M25 5 L5 5 L5 115 L25 115"
          stroke="#D94F3B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="240"
          strokeDashoffset="240"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="240"
            to="0"
            dur="1.2s"
            fill="freeze"
            begin="0.5s"
          />
        </path>
      </svg>
      {/* Right bracket */}
      <svg
        className="absolute right-0 top-0 h-full w-8"
        viewBox="0 0 30 120"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 5 L25 5 L25 115 L5 115"
          stroke="#D94F3B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="240"
          strokeDashoffset="240"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="240"
            to="0"
            dur="1.2s"
            fill="freeze"
            begin="0.7s"
          />
        </path>
      </svg>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated SVG: Decorative divider with animated dots               */
/* ------------------------------------------------------------------ */
function AnimatedDivider({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full ${className}`}
      aria-hidden="true"
    >
      {/* Center line */}
      <line
        x1="100"
        y1="10"
        x2="500"
        y2="10"
        stroke="#2a2825"
        strokeWidth="0.5"
        strokeDasharray="400"
        strokeDashoffset="400"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="400"
          to="0"
          dur="1s"
          fill="freeze"
        />
      </line>
      {/* Animated dots */}
      {[150, 250, 300, 350, 450].map((cx, i) => (
        <circle key={cx} cx={cx} cy="10" r="2.5" fill="#D94F3B" opacity="0">
          <animate
            attributeName="opacity"
            from="0"
            to="1"
            dur="0.3s"
            fill="freeze"
            begin={`${1 + i * 0.15}s`}
          />
          <animateTransform
            attributeName="transform"
            type="scale"
            from="0"
            to="1"
            dur="0.3s"
            fill="freeze"
            begin={`${1 + i * 0.15}s`}
            additive="sum"
          />
        </circle>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Scroll-triggered fade-in hook                                     */
/* ------------------------------------------------------------------ */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function RevealSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */
const EDITORS_PICKS = [
  {
    id: 1,
    title: 'The Algorithmic Mind',
    subtitle: 'How neural networks mirror human cognition',
    category: 'Technology',
    duration: '47 min',
    featured: true,
  },
  {
    id: 2,
    title: 'Market Signals',
    subtitle: 'Reading between the lines of Fed policy',
    category: 'Business',
    duration: '32 min',
    featured: false,
  },
  {
    id: 3,
    title: 'Body Electric',
    subtitle: 'The science of circadian rhythm disruption',
    category: 'Health',
    duration: '55 min',
    featured: false,
  },
  {
    id: 4,
    title: 'Proof of Work',
    subtitle: 'Infrastructure lessons from the crypto winter',
    category: 'Technology',
    duration: '41 min',
    featured: false,
  },
];

const CATEGORIES = [
  { name: 'Technology', count: 128, description: 'AI, software, hardware, and digital culture' },
  { name: 'Health', count: 94, description: 'Medicine, wellness, neuroscience, and longevity' },
  { name: 'Business', count: 76, description: 'Markets, leadership, startups, and economics' },
];

const AI_FEATURES = [
  {
    title: 'Conversational Intelligence',
    description:
      'Ask questions about any episode. Our AI reads the full transcript and responds with cited, timestamped answers you can verify.',
  },
  {
    title: 'Semantic Topic Search',
    description:
      'Search by meaning, not keywords. Find moments across thousands of episodes where a specific idea is discussed.',
  },
  {
    title: 'Speaker-Attributed Transcripts',
    description:
      'Every word, identified by speaker. Jump to any moment with a click. Read episodes like articles.',
  },
];

/* ------------------------------------------------------------------ */
/*  Styles (embedded to keep self-contained)                          */
/* ------------------------------------------------------------------ */
const styles = `
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  .editorial-underline {
    background-image: linear-gradient(#D94F3B, #D94F3B);
    background-size: 0% 2px;
    background-position: left bottom;
    background-repeat: no-repeat;
    transition: background-size 0.4s ease;
  }
  .editorial-underline:hover,
  .editorial-underline:focus-visible {
    background-size: 100% 2px;
  }

  .card-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .card-lift:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
  }

  .masthead-rule {
    border-top: 3px double #2a2825;
    border-bottom: 1px solid #2a2825;
    padding: 4px 0;
  }
`;

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default function RedesignV2Page() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className={`${displayFont.variable} ${bodyFont.variable} min-h-screen`}
      style={{
        fontFamily: 'var(--font-body), ui-sans-serif, system-ui, sans-serif',
        backgroundColor: '#faf9f6',
        color: '#2a2825',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
        style={{ color: '#D94F3B' }}
      >
        Skip to main content
      </a>

      {/* ============================================================ */}
      {/*  MASTHEAD                                                     */}
      {/* ============================================================ */}
      <header className="border-b px-4 pb-4 pt-6" style={{ borderColor: '#2a2825' }}>
        <div className="mx-auto max-w-6xl">
          {/* Top bar: date + tagline */}
          <div className="flex items-center justify-between text-xs tracking-widest uppercase opacity-60">
            <span>{today}</span>
            <span>A Podcast Journal</span>
          </div>

          {/* Masthead rule */}
          <div className="masthead-rule my-3" />

          {/* Title */}
          <h1
            className="text-center leading-none tracking-tight"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(3rem, 8vw, 6rem)',
            }}
          >
            The Dial
          </h1>

          <EditorialFlourish className="mx-auto mt-2 max-w-xs" />

          {/* Nav */}
          <nav aria-label="Main navigation" className="mt-4 flex justify-center gap-8 text-sm tracking-wide">
            {['Front Page', 'Explore', 'Topics', 'The AI Desk'].map((item) => (
              <a
                key={item}
                href="#"
                className="editorial-underline pb-0.5 transition-colors hover:text-[#D94F3B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94F3B]"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* ============================================================ */}
      {/*  MAIN CONTENT                                                 */}
      {/* ============================================================ */}
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-12">
        {/* ------ EDITOR'S PICKS ------ */}
        <RevealSection>
          <section aria-labelledby="editors-picks-heading">
            <div className="mb-8 flex items-baseline gap-4">
              <h2
                id="editors-picks-heading"
                className="text-xs font-semibold tracking-[0.3em] uppercase"
              >
                Editor&apos;s Picks
              </h2>
              <div className="h-px flex-1" style={{ backgroundColor: '#2a2825', opacity: 0.2 }} />
            </div>

            {/* Asymmetric grid: featured large left, stack right */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
              {/* Featured card — spans 3 cols */}
              {EDITORS_PICKS.filter((p) => p.featured).map((ep) => (
                <article
                  key={ep.id}
                  className="card-lift group cursor-pointer border-b-2 pb-6 md:col-span-3 md:border-b-0 md:border-r md:pr-6"
                  style={{ borderColor: 'rgba(42,40,37,0.15)' }}
                >
                  {/* Placeholder image area */}
                  <div
                    className="mb-4 flex aspect-[16/9] items-end rounded-sm p-6"
                    style={{ backgroundColor: '#2a2825' }}
                  >
                    <span
                      className="text-xs font-semibold tracking-[0.2em] uppercase"
                      style={{ color: '#D94F3B' }}
                    >
                      {ep.category}
                    </span>
                  </div>
                  <h3
                    className="editorial-underline inline text-3xl leading-snug md:text-4xl"
                    style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
                  >
                    {ep.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed opacity-70">{ep.subtitle}</p>
                  <p className="mt-4 text-xs tracking-wider uppercase opacity-50">{ep.duration}</p>
                </article>
              ))}

              {/* Side stack — spans 2 cols */}
              <div className="flex flex-col gap-6 md:col-span-2">
                {EDITORS_PICKS.filter((p) => !p.featured).map((ep, i) => (
                  <article
                    key={ep.id}
                    className={`card-lift group cursor-pointer pb-5 ${
                      i < 2 ? 'border-b' : ''
                    }`}
                    style={{ borderColor: 'rgba(42,40,37,0.12)' }}
                  >
                    <span
                      className="text-[10px] font-semibold tracking-[0.25em] uppercase"
                      style={{ color: '#D94F3B' }}
                    >
                      {ep.category}
                    </span>
                    <h3
                      className="editorial-underline mt-1 inline text-xl leading-snug"
                      style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
                    >
                      {ep.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed opacity-60">{ep.subtitle}</p>
                    <p className="mt-2 text-xs tracking-wider uppercase opacity-40">{ep.duration}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ------ DIVIDER ------ */}
        <div className="my-16">
          <AnimatedDivider />
        </div>

        {/* ------ PULL QUOTE ------ */}
        <RevealSection>
          <AnimatedQuoteBrackets>
            <blockquote className="text-center">
              <p
                className="text-2xl leading-relaxed italic md:text-3xl"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Every conversation holds a moment worth finding. We built the tools to find it.
              </p>
              <cite className="mt-4 block text-xs not-italic tracking-[0.2em] uppercase opacity-50">
                The Editors
              </cite>
            </blockquote>
          </AnimatedQuoteBrackets>
        </RevealSection>

        {/* ------ DIVIDER ------ */}
        <div className="my-16">
          <AnimatedDivider />
        </div>

        {/* ------ CATEGORY COLUMNS ------ */}
        <RevealSection>
          <section aria-labelledby="sections-heading">
            <div className="mb-8 flex items-baseline gap-4">
              <h2
                id="sections-heading"
                className="text-xs font-semibold tracking-[0.3em] uppercase"
              >
                Sections
              </h2>
              <div className="h-px flex-1" style={{ backgroundColor: '#2a2825', opacity: 0.2 }} />
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {CATEGORIES.map((cat, i) => (
                <article
                  key={cat.name}
                  className={`card-lift group cursor-pointer pb-6 ${
                    i < 2 ? 'md:border-r md:pr-8' : ''
                  }`}
                  style={{ borderColor: 'rgba(42,40,37,0.12)' }}
                >
                  <h3
                    className="editorial-underline inline text-2xl"
                    style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
                  >
                    {cat.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed opacity-60">{cat.description}</p>
                  <p className="mt-4 text-xs tracking-wider uppercase opacity-40">
                    {cat.count} episodes
                  </p>
                </article>
              ))}
            </div>
          </section>
        </RevealSection>

        {/* ------ DIVIDER ------ */}
        <div className="my-16">
          <AnimatedDivider />
        </div>

        {/* ------ THE AI DESK ------ */}
        <RevealSection>
          <section aria-labelledby="ai-desk-heading">
            <div className="mb-8 flex items-baseline gap-4">
              <h2
                id="ai-desk-heading"
                className="text-xs font-semibold tracking-[0.3em] uppercase"
              >
                The AI Desk
              </h2>
              <div className="h-px flex-1" style={{ backgroundColor: '#2a2825', opacity: 0.2 }} />
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {AI_FEATURES.map((feature, i) => (
                <article
                  key={feature.title}
                  className={`card-lift pb-6 ${i < 2 ? 'md:border-r md:pr-8' : ''}`}
                  style={{ borderColor: 'rgba(42,40,37,0.12)' }}
                >
                  <span
                    className="mb-3 block text-3xl font-light"
                    style={{
                      fontFamily: 'var(--font-display), Georgia, serif',
                      color: '#D94F3B',
                    }}
                  >
                    0{i + 1}
                  </span>
                  <h3
                    className="text-lg font-medium"
                    style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
                  >
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed opacity-60">{feature.description}</p>
                </article>
              ))}
            </div>
          </section>
        </RevealSection>

        {/* ------ DIVIDER ------ */}
        <div className="my-16">
          <AnimatedDivider />
        </div>

        {/* ------ NEWSLETTER CTA ------ */}
        <RevealSection>
          <section
            aria-labelledby="subscribe-heading"
            className="mx-auto max-w-2xl border-y py-16 text-center"
            style={{ borderColor: '#2a2825' }}
          >
            <h2
              id="subscribe-heading"
              className="text-3xl md:text-4xl"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              Stay on the frequency
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed opacity-60">
              A weekly digest of the most compelling conversations, curated by our editorial team
              and surfaced by AI.
            </p>
            <div className="mx-auto mt-8 flex max-w-sm gap-3">
              <label htmlFor="email-input" className="sr-only">
                Email address
              </label>
              <input
                id="email-input"
                type="email"
                placeholder="your@email.com"
                className="flex-1 border-b-2 bg-transparent px-2 py-2 text-sm outline-none transition-colors focus:border-[#D94F3B]"
                style={{ borderColor: 'rgba(42,40,37,0.3)' }}
                aria-label="Email address"
              />
              <button
                type="button"
                className="px-6 py-2 text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94F3B]"
                style={{ backgroundColor: '#D94F3B' }}
              >
                Subscribe
              </button>
            </div>
          </section>
        </RevealSection>
      </main>

      {/* ============================================================ */}
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer className="border-t px-4 py-8" style={{ borderColor: 'rgba(42,40,37,0.15)' }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-xs tracking-wider uppercase opacity-40 md:flex-row md:justify-between">
          <span
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            className="text-sm normal-case tracking-normal"
          >
            The Dial
          </span>
          <span>An AI-powered podcast journal</span>
        </div>
      </footer>
    </div>
  );
}
