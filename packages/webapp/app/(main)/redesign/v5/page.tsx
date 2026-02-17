/* AGENT CLAIMS
 * Agent: designer-v5 (Layout Agent)
 * App Name: VOXFIELD
 * Aesthetic: Bold Minimal (Apple meets Arc Browser)
 * Display Font: Instrument Serif (dramatic, editorial)
 * Body Font: Inter (clean sans)
 * Accent Color: HSL(263, 70%, 58%) = Electric Indigo #6366f1
 * Colors: #ffffff, #000000, #6366f1 only
 * Layout: Asymmetric, edge-pushed, massive whitespace
 * Breakpoints: sm:640 md:768 lg:1024 xl:1280
 * Spacing scale: 4px base, sections 120-200px vertical padding
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Instrument_Serif, Inter } from 'next/font/google';
import Link from 'next/link';

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
});

/* ─── Animated SVG: Morphing Geometric Shape ─── */
function MorphingShape({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <path fill="none" stroke="#6366f1" strokeWidth="1.5">
        <animate
          attributeName="d"
          dur="8s"
          repeatCount="indefinite"
          values="
            M100,20 A80,80 0 1,1 99.99,20 Z;
            M30,30 Q100,10 170,30 Q190,100 170,170 Q100,190 30,170 Q10,100 30,30 Z;
            M100,20 A80,80 0 1,1 99.99,20 Z
          "
        />
      </path>
    </svg>
  );
}

/* ─── Animated SVG: Self-Drawing Line ─── */
function DrawingLine() {
  return (
    <svg
      viewBox="0 0 1200 2"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ height: '1px' }}
    >
      <line
        x1="0"
        y1="1"
        x2="1200"
        y2="1"
        stroke="#000000"
        strokeWidth="1"
        strokeDasharray="1200"
        strokeDashoffset="1200"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="1200"
          to="0"
          dur="2s"
          fill="freeze"
          begin="0.5s"
        />
      </line>
    </svg>
  );
}

/* ─── Animated SVG: Dot Grid ─── */
function DotGrid() {
  const dots: { cx: number; cy: number; delay: number }[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 16; col++) {
      dots.push({
        cx: col * 80 + 40,
        cy: row * 80 + 40,
        delay: (row * 0.3 + col * 0.15) % 4,
      });
    }
  }
  return (
    <svg
      viewBox="0 0 1280 640"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r="1.5" fill="#000000">
          <animate
            attributeName="opacity"
            values="0.04;0.12;0.04"
            dur="5s"
            begin={`${d.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

/* ─── Podcast Card ─── */
function PodcastCard({ title, index }: { title: string; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href="/explore"
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        <div
          className="flex h-full w-full items-center justify-center text-neutral-300 transition-colors duration-300 group-hover:text-indigo-500"
          style={{ fontSize: '4rem' }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-indigo-500 transition-all duration-500"
          style={{ width: hovered ? '100%' : '0%' }}
        />
      </div>
      <p
        className={`${body.className} mt-3 text-sm font-medium tracking-tight text-black transition-colors duration-300 group-hover:text-indigo-500`}
      >
        {title}
      </p>
    </Link>
  );
}

/* ─── Skip Link ─── */
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-black focus:px-4 focus:py-2 focus:text-white"
    >
      Skip to main content
    </a>
  );
}

/* ─── Page ─── */
export default function RedesignV5() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const podcasts = [
    'The Anthropic Review',
    'Deepmind Decoded',
    'Latent Space',
    'Practical AI',
    'Machine Learning Street Talk',
    'Gradient Dissent',
  ];

  return (
    <div
      className={`${display.variable} ${body.variable} min-h-screen bg-white text-black`}
      style={reducedMotion ? { ['--anim-play' as string]: 'paused' } : { ['--anim-play' as string]: 'running' }}
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          svg animate, svg animateTransform {
            animation-play-state: paused !important;
          }
          .motion-fade { opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <SkipLink />

      {/* ─── Hero ─── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[90vh] flex-col justify-end overflow-hidden px-6 pb-16 md:px-16 lg:px-24"
        aria-label="Hero"
      >
        {!reducedMotion && <DotGrid />}

        <div className="absolute right-8 top-8 h-40 w-40 md:right-16 md:top-16 md:h-64 md:w-64 lg:right-24 lg:h-80 lg:w-80">
          {!reducedMotion && <MorphingShape className="h-full w-full" />}
        </div>

        <div className="relative z-10 max-w-4xl">
          <p className={`${body.className} mb-4 text-xs font-medium uppercase tracking-[0.3em] text-neutral-400`}>
            AI-Powered Podcast Discovery
          </p>
          <h1
            className="text-6xl leading-[0.9] tracking-tight text-black md:text-8xl lg:text-9xl"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            Voxfield
          </h1>
          <p className={`${body.className} mt-8 max-w-md text-base leading-relaxed text-neutral-500`}>
            Every word, searchable. Every idea, connected.
          </p>
        </div>
      </section>

      {/* ─── Line Divider ─── */}
      <div className="px-6 md:px-16 lg:px-24">
        {!reducedMotion ? <DrawingLine /> : <hr className="border-black" />}
      </div>

      {/* ─── What We Do ─── */}
      <section
        id="main-content"
        className="px-6 py-32 md:px-16 md:py-40 lg:px-24"
        aria-label="Features"
      >
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-8">
          {[
            { word: 'Transcribe', desc: 'Full transcripts with speaker identification for every episode.' },
            { word: 'Discover', desc: 'AI extracts topics and connects ideas across thousands of podcasts.' },
            { word: 'Converse', desc: 'Ask questions about any episode. Get answers with timestamps.' },
          ].map((item) => (
            <div key={item.word}>
              <h2
                className="text-4xl tracking-tight md:text-5xl"
                style={{ fontFamily: 'var(--font-display), serif' }}
              >
                {item.word}
              </h2>
              <p className={`${body.className} mt-4 text-sm leading-relaxed text-neutral-500`}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Line Divider ─── */}
      <div className="px-6 md:px-16 lg:px-24">
        <hr className="border-neutral-200" />
      </div>

      {/* ─── Podcast Grid ─── */}
      <section className="px-6 py-32 md:px-16 md:py-40 lg:px-24" aria-label="Podcasts">
        <div className="mb-16 flex items-end justify-between">
          <h2
            className="text-3xl tracking-tight md:text-4xl"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            Recent
          </h2>
          <Link
            href="/explore"
            className={`${body.className} text-xs font-medium uppercase tracking-[0.2em] text-neutral-400 transition-colors duration-300 hover:text-indigo-500`}
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {podcasts.map((title, i) => (
            <PodcastCard key={title} title={title} index={i} />
          ))}
        </div>
      </section>

      {/* ─── Line Divider ─── */}
      <div className="px-6 md:px-16 lg:px-24">
        <hr className="border-neutral-200" />
      </div>

      {/* ─── Pull Quote ─── */}
      <section className="px-6 py-32 md:px-16 md:py-48 lg:px-24" aria-label="Testimonial">
        <blockquote className="max-w-3xl">
          <p
            className="text-3xl leading-snug tracking-tight text-black md:text-5xl"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            &ldquo;I found a connection between two episodes I never would have discovered on my own.&rdquo;
          </p>
          <footer className={`${body.className} mt-8 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400`}>
            Early Access User
          </footer>
        </blockquote>
      </section>

      {/* ─── Line Divider ─── */}
      <div className="px-6 md:px-16 lg:px-24">
        <hr className="border-neutral-200" />
      </div>

      {/* ─── CTA ─── */}
      <section className="px-6 py-32 md:px-16 md:py-48 lg:px-24" aria-label="Call to action">
        <div className="flex flex-col items-start gap-8">
          <h2
            className="text-4xl tracking-tight md:text-6xl"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            Start listening differently.
          </h2>
          <Link
            href="/explore"
            className={`${body.className} group inline-flex items-center gap-3 border border-black px-8 py-4 text-sm font-medium uppercase tracking-[0.15em] text-black transition-colors duration-300 hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
          >
            Explore Podcasts
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </div>
      </section>

      {/* Bottom spacing */}
      <div className="h-16" />
    </div>
  );
}
