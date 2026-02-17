/* AGENT CLAIMS
 * Agent: luxury-designer
 * Aesthetic: Luxury/Refined
 * Display Font: Playfair Display
 * Body Font: Plus Jakarta Sans
 * Accent: hsl(45, 70%, 50%)
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

/* ─── Animated SVG: Gold Particle Ring ─── */
function GoldParticleRing({ className = "" }: { className?: string }) {
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    const rad = (angle * Math.PI) / 180;
    const cx = 50 + 38 * Math.cos(rad);
    const cy = 50 + 38 * Math.sin(rad);
    return { cx, cy, delay: i * 0.15 };
  });

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Decorative gold particle animation"
    >
      {particles.map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r="1.5" fill="hsl(45, 70%, 50%)">
          <animate
            attributeName="opacity"
            values="0.2;1;0.2"
            dur="2.4s"
            begin={`${p.delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values="1;2.5;1"
            dur="2.4s"
            begin={`${p.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="hsl(45, 70%, 50%)"
        strokeWidth="0.3"
        opacity="0.3"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 50 50"
          to="360 50 50"
          dur="20s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

/* ─── Animated SVG: Elegant Line Draw ─── */
function ElegantLineDraw({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 20"
      className={className}
      role="img"
      aria-label="Decorative gold line animation"
    >
      <line
        x1="0"
        y1="10"
        x2="200"
        y2="10"
        stroke="hsl(45, 70%, 50%)"
        strokeWidth="0.5"
        strokeDasharray="200"
        strokeDashoffset="200"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="200"
          to="0"
          dur="2s"
          fill="freeze"
        />
      </line>
      <circle cx="0" cy="10" r="2" fill="hsl(45, 70%, 50%)" opacity="0">
        <animate
          attributeName="opacity"
          from="0"
          to="1"
          dur="0.3s"
          begin="1.8s"
          fill="freeze"
        />
      </circle>
      <circle cx="100" cy="10" r="2" fill="hsl(45, 70%, 50%)" opacity="0">
        <animate
          attributeName="opacity"
          from="0"
          to="1"
          dur="0.3s"
          begin="1s"
          fill="freeze"
        />
      </circle>
      <circle cx="200" cy="10" r="2" fill="hsl(45, 70%, 50%)" opacity="0">
        <animate
          attributeName="opacity"
          from="0"
          to="1"
          dur="0.3s"
          begin="2s"
          fill="freeze"
        />
      </circle>
    </svg>
  );
}

/* ─── Animated SVG: Waveform ─── */
function GoldWaveform({ className = "" }: { className?: string }) {
  const bars = Array.from({ length: 24 }, (_, i) => ({
    x: 4 + i * 8,
    delay: i * 0.08,
    maxH: 10 + Math.sin(i * 0.7) * 20 + Math.random() * 10,
  }));

  return (
    <svg
      viewBox="0 0 200 50"
      className={className}
      role="img"
      aria-label="Decorative audio waveform animation"
    >
      {bars.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={25 - b.maxH / 2}
          width="3"
          height={b.maxH}
          rx="1.5"
          fill="hsl(45, 70%, 50%)"
          opacity="0.6"
        >
          <animate
            attributeName="height"
            values={`${b.maxH * 0.3};${b.maxH};${b.maxH * 0.3}`}
            dur="1.2s"
            begin={`${b.delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            values={`${25 - (b.maxH * 0.3) / 2};${25 - b.maxH / 2};${25 - (b.maxH * 0.3) / 2}`}
            dur="1.2s"
            begin={`${b.delay}s`}
            repeatCount="indefinite"
          />
        </rect>
      ))}
    </svg>
  );
}

/* ─── Intersection Observer Hook ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ─── Section Wrapper with Fade-In ─── */
function FadeSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Data ─── */
const PODCASTS = [
  {
    title: "The Art of Conversation",
    host: "Elena Moretti",
    image:
      "https://images.pexels.com/photos/3394659/pexels-photo-3394659.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "Culture",
  },
  {
    title: "Midnight Frequencies",
    host: "James Ashford",
    image:
      "https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "Music",
  },
  {
    title: "The Inner Circle",
    host: "Sophia Laurent",
    image:
      "https://images.pexels.com/photos/3783471/pexels-photo-3783471.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "Society",
  },
  {
    title: "Sound Architecture",
    host: "Marcus Webb",
    image:
      "https://images.pexels.com/photos/4488636/pexels-photo-4488636.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "Design",
  },
  {
    title: "Golden Hour",
    host: "Aria Chen",
    image:
      "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "Lifestyle",
  },
  {
    title: "Velvet Voices",
    host: "Daniel Okafor",
    image:
      "https://images.pexels.com/photos/4065876/pexels-photo-4065876.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "Storytelling",
  },
];

const EPISODES = [
  {
    title: "The Geometry of Sound",
    podcast: "Sound Architecture",
    duration: "47 min",
    date: "Feb 12, 2026",
  },
  {
    title: "Parisian Nights",
    podcast: "The Art of Conversation",
    duration: "38 min",
    date: "Feb 10, 2026",
  },
  {
    title: "Analog Dreams",
    podcast: "Midnight Frequencies",
    duration: "52 min",
    date: "Feb 8, 2026",
  },
  {
    title: "The Silk Road of Ideas",
    podcast: "The Inner Circle",
    duration: "44 min",
    date: "Feb 6, 2026",
  },
];

/* ─── Page Component ─── */
export default function LuxuryShowcase() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div
      className={`${playfair.variable} ${jakarta.variable} min-h-screen bg-[#0a0a0a] text-[#f5f0e8] selection:bg-[hsl(45,70%,50%)] selection:text-[#0a0a0a]`}
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-[hsl(45,70%,50%)] focus:px-4 focus:py-2 focus:text-[#0a0a0a] focus:outline-none"
      >
        Skip to main content
      </a>

      {/* ─── Navigation ─── */}
      <nav
        aria-label="Main navigation"
        className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <span
            className="font-[family-name:var(--font-playfair)] text-xl tracking-wide"
            style={{ color: "hsl(45, 70%, 50%)" }}
          >
            PODVERSE
          </span>
          <div className="hidden items-center gap-8 font-[family-name:var(--font-jakarta)] text-sm tracking-widest uppercase md:flex">
            {["Discover", "Collections", "About"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[#f5f0e8]/60 transition-colors duration-200 hover:text-[hsl(45,70%,50%)] focus:outline-none focus:ring-2 focus:ring-[hsl(45,70%,50%)] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] rounded"
              >
                {item}
              </a>
            ))}
          </div>
          <button
            aria-label="Open menu"
            className="flex h-11 w-11 items-center justify-center rounded md:hidden focus:outline-none focus:ring-2 focus:ring-[hsl(45,70%,50%)]"
          >
            <span className="block h-0.5 w-5 bg-[#f5f0e8] relative before:absolute before:-top-1.5 before:left-0 before:h-0.5 before:w-5 before:bg-[#f5f0e8] after:absolute after:top-1.5 after:left-0 after:h-0.5 after:w-5 after:bg-[#f5f0e8]" />
          </button>
        </div>
      </nav>

      <main id="main-content">
        {/* ─── Hero Section ─── */}
        <section
          aria-labelledby="hero-heading"
          className="relative flex min-h-screen items-center justify-center overflow-hidden px-6"
        >
          {/* Background grain overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
            aria-hidden="true"
          />

          {/* Gold gradient orb */}
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, hsl(45, 70%, 50%) 0%, transparent 70%)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-8 w-24" aria-hidden="true">
              {!prefersReducedMotion && <GoldParticleRing />}
            </div>

            <p
              className="mb-6 font-[family-name:var(--font-jakarta)] text-xs tracking-[0.3em] uppercase"
              style={{ color: "hsl(45, 70%, 50%)" }}
            >
              The Premier Listening Experience
            </p>

            <h1
              id="hero-heading"
              className="font-[family-name:var(--font-playfair)] text-5xl leading-[1.1] tracking-tight md:text-7xl lg:text-8xl"
            >
              Where Every
              <br />
              <span style={{ color: "hsl(45, 70%, 50%)" }}>Voice</span> Matters
            </h1>

            <div className="mx-auto my-10 w-48" aria-hidden="true">
              {!prefersReducedMotion && <ElegantLineDraw />}
            </div>

            <p className="mx-auto max-w-xl font-[family-name:var(--font-jakarta)] text-base leading-relaxed text-[#f5f0e8]/60 md:text-lg">
              Curated podcasts, refined listening, and intelligent discovery.
              Immerse yourself in the world&apos;s most compelling conversations.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#discover"
                className="inline-flex h-12 items-center rounded-none px-10 font-[family-name:var(--font-jakarta)] text-sm tracking-widest uppercase transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[hsl(45,70%,50%)] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
                style={{
                  backgroundColor: "hsl(45, 70%, 50%)",
                  color: "#0a0a0a",
                }}
              >
                Begin Listening
              </a>
              <a
                href="#collections"
                className="inline-flex h-12 items-center border border-[#f5f0e8]/20 rounded-none px-10 font-[family-name:var(--font-jakarta)] text-sm tracking-widest uppercase transition-all duration-200 hover:border-[hsl(45,70%,50%)] hover:text-[hsl(45,70%,50%)] focus:outline-none focus:ring-2 focus:ring-[hsl(45,70%,50%)] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
              >
                Explore
              </a>
            </div>
          </div>
        </section>

        {/* ─── Featured Podcasts Grid ─── */}
        <section
          id="discover"
          aria-labelledby="featured-heading"
          className="mx-auto max-w-7xl px-6 py-24 md:px-12 md:py-32"
        >
          <FadeSection className="mb-16 text-center">
            <p
              className="mb-4 font-[family-name:var(--font-jakarta)] text-xs tracking-[0.3em] uppercase"
              style={{ color: "hsl(45, 70%, 50%)" }}
            >
              Curated Selection
            </p>
            <h2
              id="featured-heading"
              className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl"
            >
              Featured Podcasts
            </h2>
          </FadeSection>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PODCASTS.map((podcast, i) => (
              <FadeSection key={podcast.title} delay={i * 0.1}>
                <article className="group relative overflow-hidden bg-white/[0.03] border border-white/5 transition-all duration-300 hover:border-[hsl(45,70%,50%)]/30 hover:bg-white/[0.05]">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={podcast.image}
                      alt={`${podcast.title} podcast cover`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <span
                      className="mb-3 inline-block font-[family-name:var(--font-jakarta)] text-[10px] tracking-[0.25em] uppercase"
                      style={{ color: "hsl(45, 70%, 50%)" }}
                    >
                      {podcast.category}
                    </span>
                    <h3 className="font-[family-name:var(--font-playfair)] text-xl mb-1">
                      {podcast.title}
                    </h3>
                    <p className="font-[family-name:var(--font-jakarta)] text-sm text-[#f5f0e8]/50">
                      by {podcast.host}
                    </p>
                  </div>
                </article>
              </FadeSection>
            ))}
          </div>
        </section>

        {/* ─── Waveform Divider ─── */}
        <div
          className="mx-auto max-w-md px-6"
          aria-hidden="true"
        >
          {!prefersReducedMotion && <GoldWaveform className="w-full opacity-40" />}
        </div>

        {/* ─── Episode Highlights ─── */}
        <section
          id="collections"
          aria-labelledby="episodes-heading"
          className="mx-auto max-w-7xl px-6 py-24 md:px-12 md:py-32"
        >
          <FadeSection className="mb-16">
            <p
              className="mb-4 font-[family-name:var(--font-jakarta)] text-xs tracking-[0.3em] uppercase"
              style={{ color: "hsl(45, 70%, 50%)" }}
            >
              Recently Added
            </p>
            <h2
              id="episodes-heading"
              className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl"
            >
              Episode Highlights
            </h2>
          </FadeSection>

          <div className="space-y-0">
            {EPISODES.map((ep, i) => (
              <FadeSection key={ep.title} delay={i * 0.08}>
                <article className="group flex flex-col gap-2 border-b border-white/5 py-8 transition-colors duration-200 hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-4">
                  <div className="flex-1">
                    <h3 className="font-[family-name:var(--font-playfair)] text-lg transition-colors duration-200 group-hover:text-[hsl(45,70%,50%)] md:text-xl">
                      {ep.title}
                    </h3>
                    <p className="mt-1 font-[family-name:var(--font-jakarta)] text-sm text-[#f5f0e8]/40">
                      {ep.podcast}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 font-[family-name:var(--font-jakarta)] text-sm text-[#f5f0e8]/40">
                    <span>{ep.duration}</span>
                    <span className="hidden sm:inline">{ep.date}</span>
                    <button
                      aria-label={`Play ${ep.title}`}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 transition-all duration-200 hover:border-[hsl(45,70%,50%)] hover:text-[hsl(45,70%,50%)] focus:outline-none focus:ring-2 focus:ring-[hsl(45,70%,50%)]"
                    >
                      <svg
                        width="14"
                        height="16"
                        viewBox="0 0 14 16"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M0 0L14 8L0 16V0Z" />
                      </svg>
                    </button>
                  </div>
                </article>
              </FadeSection>
            ))}
          </div>
        </section>

        {/* ─── CTA Section ─── */}
        <section
          aria-labelledby="cta-heading"
          className="relative overflow-hidden px-6 py-24 md:py-32"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              background:
                "radial-gradient(ellipse at center, hsl(45, 70%, 50%) 0%, transparent 60%)",
            }}
            aria-hidden="true"
          />
          <FadeSection className="relative z-10 mx-auto max-w-2xl text-center">
            <h2
              id="cta-heading"
              className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl mb-6"
            >
              Elevate Your Listening
            </h2>
            <p className="mx-auto mb-10 max-w-md font-[family-name:var(--font-jakarta)] text-base text-[#f5f0e8]/50 leading-relaxed">
              Join a community of discerning listeners who demand more from their
              audio experience.
            </p>
            <a
              href="#"
              className="inline-flex h-12 items-center rounded-none px-12 font-[family-name:var(--font-jakarta)] text-sm tracking-widest uppercase transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[hsl(45,70%,50%)] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
              style={{
                backgroundColor: "hsl(45, 70%, 50%)",
                color: "#0a0a0a",
              }}
            >
              Get Started
            </a>
          </FadeSection>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer
        className="border-t border-white/5 px-6 py-16 md:px-12"
        role="contentinfo"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-12 md:flex-row md:justify-between">
            <div>
              <span
                className="font-[family-name:var(--font-playfair)] text-xl tracking-wide"
                style={{ color: "hsl(45, 70%, 50%)" }}
              >
                PODVERSE
              </span>
              <p className="mt-3 max-w-xs font-[family-name:var(--font-jakarta)] text-sm text-[#f5f0e8]/40 leading-relaxed">
                The premier destination for curated podcast discovery and
                refined listening experiences.
              </p>
            </div>
            <nav aria-label="Footer navigation">
              <div className="grid grid-cols-2 gap-x-16 gap-y-8">
                <div>
                  <h3 className="mb-4 font-[family-name:var(--font-jakarta)] text-xs tracking-[0.2em] uppercase text-[#f5f0e8]/60">
                    Platform
                  </h3>
                  <ul className="space-y-3 font-[family-name:var(--font-jakarta)] text-sm text-[#f5f0e8]/40">
                    {["Discover", "Collections", "Trending"].map((item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="transition-colors duration-200 hover:text-[hsl(45,70%,50%)] focus:outline-none focus:ring-2 focus:ring-[hsl(45,70%,50%)] rounded"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-4 font-[family-name:var(--font-jakarta)] text-xs tracking-[0.2em] uppercase text-[#f5f0e8]/60">
                    Company
                  </h3>
                  <ul className="space-y-3 font-[family-name:var(--font-jakarta)] text-sm text-[#f5f0e8]/40">
                    {["About", "Blog", "Contact"].map((item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="transition-colors duration-200 hover:text-[hsl(45,70%,50%)] focus:outline-none focus:ring-2 focus:ring-[hsl(45,70%,50%)] rounded"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </nav>
          </div>
          <div className="mt-16 border-t border-white/5 pt-8">
            <p className="font-[family-name:var(--font-jakarta)] text-xs text-[#f5f0e8]/30">
              &copy; 2026 Podverse. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
