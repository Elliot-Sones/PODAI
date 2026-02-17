/* AGENT CLAIMS
 * Agent: ui-component-agent (designer-v3)
 * Aesthetic: Organic/natural — Warm & Human (Notion meets Airbnb)
 * Display Font: Nunito
 * Body Font: Source Serif 4
 * Accent: hsl(20, 60%, 50%) — Terracotta #c2703e
 * App Name Proposal: "Hearthcast"
 *
 * Animated SVGs:
 *   1. Morphing blob background shapes (path d attribute)
 *   2. Hand-drawn animated underline (stroke-dashoffset)
 *   3. Floating decorative dots with gentle drift
 */

'use client';

import { Nunito, Source_Serif_4 } from 'next/font/google';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
  weight: ['400', '500'],
});

// ── Animated SVG Components ──────────────────────────────────────────

function MorphingBlob({ className = '', color = '#c2703e' }: { className?: string; color?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <path
        fill={color}
        fillOpacity="0.12"
      >
        <animate
          attributeName="d"
          dur="8s"
          repeatCount="indefinite"
          values="
            M44.7,-58.2C57.3,-50.9,66.5,-36.5,71.2,-20.6C75.9,-4.7,76.2,12.7,69.3,27.1C62.4,41.5,48.4,52.9,33.2,60.1C18,67.3,1.6,70.3,-15.5,68.1C-32.6,65.9,-50.4,58.5,-60.5,45.3C-70.6,32.1,-73,13.1,-70.5,-4.6C-68,-22.3,-60.6,-38.7,-48.5,-46.2C-36.4,-53.7,-19.6,-52.3,-1.6,-50.3C16.4,-48.3,32.1,-65.5,44.7,-58.2Z;
            M39.9,-51.5C52.1,-44.6,62.7,-32.3,67.8,-17.7C72.9,-3.1,72.5,13.8,65.5,27.6C58.5,41.4,45,52.1,30.1,58.7C15.2,65.3,-1.1,67.8,-17.8,64.8C-34.5,61.8,-51.6,53.3,-61.1,39.7C-70.6,26.1,-72.5,7.4,-68.7,-9.1C-64.9,-25.6,-55.4,-39.9,-42.8,-46.8C-30.2,-53.7,-14.5,-53.2,0.4,-53.7C15.3,-54.2,27.7,-58.4,39.9,-51.5Z;
            M47.5,-62.1C59.7,-53.2,66.5,-36.2,70.1,-19C73.7,-1.8,74.1,15.6,67.1,29.8C60.1,44,45.7,55,29.8,61.5C13.9,68,-3.5,70,-19.3,65.4C-35.1,60.8,-49.3,49.6,-58.5,35.2C-67.7,20.8,-71.9,3.2,-68.8,-12.5C-65.7,-28.2,-55.3,-42,-42.4,-50.7C-29.5,-59.4,-14.1,-63,2.3,-66C18.7,-69,35.3,-71,47.5,-62.1Z;
            M44.7,-58.2C57.3,-50.9,66.5,-36.5,71.2,-20.6C75.9,-4.7,76.2,12.7,69.3,27.1C62.4,41.5,48.4,52.9,33.2,60.1C18,67.3,1.6,70.3,-15.5,68.1C-32.6,65.9,-50.4,58.5,-60.5,45.3C-70.6,32.1,-73,13.1,-70.5,-4.6C-68,-22.3,-60.6,-38.7,-48.5,-46.2C-36.4,-53.7,-19.6,-52.3,-1.6,-50.3C16.4,-48.3,32.1,-65.5,44.7,-58.2Z
          "
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
        />
      </path>
    </svg>
  );
}

function HandDrawnUnderline({ className = '', width = 200 }: { className?: string; width?: number }) {
  return (
    <svg
      width={width}
      height="12"
      viewBox={`0 0 ${width} 12`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <path
        d={`M2 8 C${width * 0.15} 3, ${width * 0.35} 10, ${width * 0.5} 6 S${width * 0.8} 2, ${width - 2} 7`}
        stroke="#c2703e"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="300"
        strokeDashoffset="300"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="300"
          to="0"
          dur="1.2s"
          begin="0.5s"
          fill="freeze"
          calcMode="spline"
          keySplines="0.4 0 0.2 1"
          keyTimes="0;1"
        />
      </path>
    </svg>
  );
}

function FloatingDots({ className = '' }: { className?: string }) {
  const dots = [
    { cx: 20, cy: 30, r: 4, delay: '0s', dur: '6s', dy: -15 },
    { cx: 60, cy: 70, r: 3, delay: '1s', dur: '7s', dy: -12 },
    { cx: 100, cy: 20, r: 5, delay: '0.5s', dur: '8s', dy: -18 },
    { cx: 140, cy: 50, r: 3.5, delay: '2s', dur: '6.5s', dy: -10 },
    { cx: 180, cy: 80, r: 4.5, delay: '1.5s', dur: '7.5s', dy: -14 },
    { cx: 50, cy: 90, r: 3, delay: '3s', dur: '9s', dy: -16 },
    { cx: 160, cy: 15, r: 2.5, delay: '0.8s', dur: '5.5s', dy: -11 },
  ];

  return (
    <svg
      viewBox="0 0 200 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      {dots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill="#c2703e"
          fillOpacity={0.15 + (i % 3) * 0.08}
        >
          <animate
            attributeName="cy"
            values={`${dot.cy};${dot.cy + dot.dy};${dot.cy}`}
            dur={dot.dur}
            begin={dot.delay}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
          />
          <animate
            attributeName="opacity"
            values="0.2;0.5;0.2"
            dur={dot.dur}
            begin={dot.delay}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

// ── Intersection Observer hook ───────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ── Reduced motion hook ──────────────────────────────────────────────

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

// ── Data ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Technology', description: 'AI, startups, software engineering', icon: '🔧', gradient: 'from-amber-50 to-orange-50', border: 'border-amber-200/60' },
  { name: 'Health & Wellness', description: 'Mindfulness, fitness, nutrition', icon: '🌿', gradient: 'from-emerald-50 to-green-50', border: 'border-emerald-200/60' },
  { name: 'Business', description: 'Strategy, leadership, economics', icon: '📊', gradient: 'from-yellow-50 to-amber-50', border: 'border-yellow-200/60' },
  { name: 'Science', description: 'Research, nature, the universe', icon: '🔬', gradient: 'from-sky-50 to-blue-50', border: 'border-sky-200/60' },
  { name: 'Culture', description: 'History, art, society, ideas', icon: '🎭', gradient: 'from-rose-50 to-pink-50', border: 'border-rose-200/60' },
  { name: 'True Crime', description: 'Mysteries, investigations, justice', icon: '🔍', gradient: 'from-stone-50 to-gray-100', border: 'border-stone-200/60' },
];

const STEPS = [
  { num: '01', title: 'Discover', body: 'Browse curated categories or let AI suggest podcasts tailored to your curiosity.', icon: (
    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
      <circle cx="24" cy="24" r="22" stroke="#c2703e" strokeWidth="2" strokeDasharray="4 3" />
      <circle cx="24" cy="24" r="8" fill="#c2703e" fillOpacity="0.2" />
      <circle cx="24" cy="24" r="3" fill="#c2703e" />
    </svg>
  )},
  { num: '02', title: 'Listen', body: 'Full transcripts, speaker identification, and one-click seek to the moments that matter.', icon: (
    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
      <rect x="4" y="16" width="8" height="16" rx="2" fill="#c2703e" fillOpacity="0.25" />
      <rect x="16" y="8" width="8" height="32" rx="2" fill="#c2703e" fillOpacity="0.4" />
      <rect x="28" y="12" width="8" height="24" rx="2" fill="#c2703e" fillOpacity="0.55" />
      <rect x="40" y="18" width="4" height="12" rx="2" fill="#c2703e" fillOpacity="0.3" />
    </svg>
  )},
  { num: '03', title: 'Explore with AI', body: 'Ask questions, find connections across episodes, and dive deeper with AI-powered chat.', icon: (
    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
      <path d="M8 36V16a4 4 0 014-4h24a4 4 0 014 4v14a4 4 0 01-4 4H16l-8 6z" stroke="#c2703e" strokeWidth="2" fill="#c2703e" fillOpacity="0.12" />
      <circle cx="18" cy="23" r="2" fill="#c2703e" fillOpacity="0.5" />
      <circle cx="26" cy="23" r="2" fill="#c2703e" fillOpacity="0.5" />
      <circle cx="34" cy="23" r="2" fill="#c2703e" fillOpacity="0.5" />
    </svg>
  )},
];

const TESTIMONIALS = [
  { quote: 'I found an episode about urban farming that changed how I think about food systems. Never would have discovered it without the topic search.', name: 'Priya K.', role: 'Curious listener' },
  { quote: 'The transcripts with speaker labels are incredible. I use them to take notes during long interview episodes.', name: 'Marcus T.', role: 'Graduate student' },
  { quote: 'Being able to ask AI about what was discussed across multiple episodes saves me hours every week.', name: 'Lena S.', role: 'Journalist' },
];

// ── Page ─────────────────────────────────────────────────────────────

export default function RedesignV3Page() {
  const reducedMotion = useReducedMotion();
  const hero = useInView(0.1);
  const curated = useInView(0.1);
  const categories = useInView(0.1);
  const howItWorks = useInView(0.1);
  const social = useInView(0.1);
  const cta = useInView(0.1);

  const fadeUp = (visible: boolean) =>
    reducedMotion
      ? 'opacity-100'
      : `transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`;

  return (
    <div className={`${nunito.variable} ${sourceSerif.variable} min-h-screen`}>
      {/* ── Custom styles ─────────────────────────────────────── */}
      <style>{`
        .v3-bg { background-color: #fffbf5; color: #3d3028; }
        .v3-display { font-family: var(--font-nunito), sans-serif; }
        .v3-body { font-family: var(--font-source-serif), Georgia, serif; }
        .v3-accent { color: #c2703e; }
        .v3-shadow { box-shadow: 0 4px 24px rgba(160, 100, 50, 0.08); }
        .v3-shadow-hover { box-shadow: 0 8px 32px rgba(160, 100, 50, 0.14); }
        .v3-card {
          background: white;
          border: 1px solid rgba(194, 112, 62, 0.12);
          border-radius: 20px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .v3-card:hover { transform: translateY(-3px); }
        @media (prefers-reduced-motion: reduce) {
          .v3-card:hover { transform: none; }
          svg animate, svg animateTransform { animation: none !important; }
        }
      `}</style>

      <div className="v3-bg">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section ref={hero.ref} className="relative overflow-hidden px-4 pb-20 pt-16 md:pb-28 md:pt-24">
          {/* Decorative blobs */}
          {!reducedMotion && (
            <>
              <MorphingBlob className="absolute -left-24 -top-24 h-[420px] w-[420px] opacity-60" />
              <MorphingBlob className="absolute -bottom-32 -right-20 h-[360px] w-[360px] opacity-40" color="#d4956a" />
              <FloatingDots className="absolute right-8 top-16 h-40 w-48 opacity-50" />
              <FloatingDots className="absolute bottom-12 left-12 h-32 w-40 opacity-40" />
            </>
          )}

          <div className={`relative mx-auto max-w-3xl text-center ${fadeUp(hero.inView)}`}>
            <p className="v3-display mb-4 text-sm font-semibold uppercase tracking-widest" style={{ color: '#c2703e' }}>
              Welcome to
            </p>
            <h1 className="v3-display text-5xl font-extrabold leading-tight tracking-tight md:text-7xl" style={{ color: '#2c1e10' }}>
              Hearthcast
            </h1>
            <div className="mx-auto mt-1 flex justify-center">
              <HandDrawnUnderline width={240} />
            </div>
            <p className="v3-body mx-auto mt-6 max-w-xl text-lg leading-relaxed md:text-xl" style={{ color: '#5c4a3a' }}>
              Your cozy corner of the podcast world. Discover stories, explore ideas across episodes, and let AI
              guide you to the moments that resonate.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/explore"
                className="v3-display inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-bold text-white transition-all hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: '#c2703e', focusRingColor: '#c2703e' } as React.CSSProperties}
                aria-label="Start exploring podcasts"
              >
                Start Exploring
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3 9h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link
                href="/topics"
                className="v3-display inline-flex items-center rounded-full border-2 px-8 py-3.5 text-base font-bold transition-all hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ borderColor: '#c2703e', color: '#c2703e' }}
                aria-label="Search topics across podcasts"
              >
                Search Topics
              </Link>
            </div>
          </div>
        </section>

        {/* ── Curated For You ─────────────────────────────────── */}
        <section ref={curated.ref} className="px-4 pb-20 md:pb-28">
          <div className={`mx-auto max-w-5xl ${fadeUp(curated.inView)}`}>
            <h2 className="v3-display text-center text-3xl font-bold md:text-4xl" style={{ color: '#2c1e10' }}>
              Curated for You
            </h2>
            <p className="v3-body mx-auto mt-3 max-w-lg text-center text-base" style={{ color: '#7a6552' }}>
              Handpicked podcasts across genres, refreshed with every visit.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
              {[
                { title: 'The Daily Discovery', tag: 'Technology', color: '#e8d5c0' },
                { title: 'Mindful Mornings', tag: 'Wellness', color: '#d4e4d0' },
                { title: 'Startup Stories', tag: 'Business', color: '#e4ddd0' },
                { title: 'Deep Cosmos', tag: 'Science', color: '#d0d8e4' },
                { title: 'Untold Histories', tag: 'Culture', color: '#e4d0d4' },
                { title: 'Sound & Fury', tag: 'True Crime', color: '#d8d4cc' },
              ].map((pod, i) => (
                <div
                  key={i}
                  className="v3-card v3-shadow group cursor-pointer p-4 md:p-5"
                  style={{ transitionDelay: reducedMotion ? '0ms' : `${i * 60}ms` }}
                >
                  <div
                    className="mb-3 flex aspect-square items-center justify-center rounded-2xl text-3xl"
                    style={{ backgroundColor: pod.color }}
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 40 40" className="h-10 w-10 opacity-40" aria-hidden="true">
                      <circle cx="20" cy="20" r="14" fill="#c2703e" fillOpacity="0.3" />
                      <circle cx="20" cy="20" r="6" fill="#c2703e" fillOpacity="0.5" />
                    </svg>
                  </div>
                  <p className="v3-display text-sm font-bold" style={{ color: '#2c1e10' }}>{pod.title}</p>
                  <span className="v3-body mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs" style={{ backgroundColor: '#c2703e15', color: '#c2703e' }}>
                    {pod.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Categories ──────────────────────────────────────── */}
        <section ref={categories.ref} className="px-4 pb-20 md:pb-28" style={{ backgroundColor: '#fff7ee' }}>
          <div className={`mx-auto max-w-5xl pt-16 md:pt-20 ${fadeUp(categories.inView)}`}>
            <h2 className="v3-display text-center text-3xl font-bold md:text-4xl" style={{ color: '#2c1e10' }}>
              Browse by Category
            </h2>
            <p className="v3-body mx-auto mt-3 max-w-md text-center text-base" style={{ color: '#7a6552' }}>
              Find your niche or explore something new.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((cat, i) => (
                <Link
                  key={cat.name}
                  href={`/category/${cat.name.toLowerCase().replace(/\s.*/, '')}`}
                  className={`group flex items-start gap-4 rounded-2xl border bg-gradient-to-br p-5 transition-all hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${cat.gradient} ${cat.border}`}
                  style={{ transitionDelay: reducedMotion ? '0ms' : `${i * 50}ms` }}
                >
                  <span className="flex-shrink-0 text-2xl" aria-hidden="true">{cat.icon}</span>
                  <div>
                    <h3 className="v3-display text-base font-bold" style={{ color: '#2c1e10' }}>{cat.name}</h3>
                    <p className="v3-body mt-0.5 text-sm" style={{ color: '#7a6552' }}>{cat.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ────────────────────────────────────── */}
        <section ref={howItWorks.ref} className="px-4 pb-20 pt-16 md:pb-28 md:pt-20">
          <div className={`mx-auto max-w-4xl ${fadeUp(howItWorks.inView)}`}>
            <h2 className="v3-display text-center text-3xl font-bold md:text-4xl" style={{ color: '#2c1e10' }}>
              How It Works
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center" style={{ transitionDelay: `${i * 120}ms` }}>
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: '#c2703e12' }}>
                    {step.icon}
                  </div>
                  <span className="v3-display text-xs font-bold uppercase tracking-widest" style={{ color: '#c2703e' }}>
                    Step {step.num}
                  </span>
                  <h3 className="v3-display mt-1 text-xl font-bold" style={{ color: '#2c1e10' }}>{step.title}</h3>
                  <p className="v3-body mt-2 text-sm leading-relaxed" style={{ color: '#7a6552' }}>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Social Proof ────────────────────────────────────── */}
        <section ref={social.ref} className="px-4 pb-20 md:pb-28" style={{ backgroundColor: '#fff7ee' }}>
          <div className={`mx-auto max-w-5xl pt-16 md:pt-20 ${fadeUp(social.inView)}`}>
            <h2 className="v3-display text-center text-3xl font-bold md:text-4xl" style={{ color: '#2c1e10' }}>
              Loved by Listeners
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <blockquote
                  key={i}
                  className="v3-card v3-shadow flex flex-col justify-between p-6"
                >
                  <p className="v3-body text-sm leading-relaxed" style={{ color: '#5c4a3a' }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-4 flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: '#c2703e' }}
                      aria-hidden="true"
                    >
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="v3-display text-sm font-bold" style={{ color: '#2c1e10' }}>{t.name}</p>
                      <p className="v3-body text-xs" style={{ color: '#9a8675' }}>{t.role}</p>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* ── Warm CTA ────────────────────────────────────────── */}
        <section ref={cta.ref} className="relative overflow-hidden px-4 pb-24 pt-16 md:pb-32 md:pt-20">
          {!reducedMotion && (
            <MorphingBlob className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 opacity-30" color="#d4956a" />
          )}
          <div className={`relative mx-auto max-w-2xl text-center ${fadeUp(cta.inView)}`}>
            <h2 className="v3-display text-3xl font-bold md:text-4xl" style={{ color: '#2c1e10' }}>
              Your next favorite episode is waiting.
            </h2>
            <p className="v3-body mx-auto mt-4 max-w-md text-base leading-relaxed" style={{ color: '#7a6552' }}>
              Join a growing community of curious listeners. It only takes a moment to start.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/explore"
                className="v3-display inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-bold text-white transition-all hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: '#c2703e' }}
                aria-label="Browse all podcasts"
              >
                Browse Podcasts
              </Link>
              <Link
                href="/request"
                className="v3-display inline-flex items-center rounded-full border-2 px-8 py-3.5 text-base font-bold transition-all hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ borderColor: '#c2703e', color: '#c2703e' }}
                aria-label="Add a new podcast to the platform"
              >
                Add a Podcast
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
