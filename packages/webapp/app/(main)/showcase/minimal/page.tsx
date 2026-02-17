/* AGENT CLAIMS
 * Agent: minimal-designer
 * Aesthetic: Brutally minimal (Stripe/Linear)
 * Display Font: Space Grotesk (substitute for Clash Display — not on Google Fonts)
 * Body Font: IBM Plex Sans
 * Accent: hsl(220, 80%, 55%)
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
});

// ---------------------------------------------------------------------------
// Animated SVG 1: Pulsing gradient orb (ambient background element)
// ---------------------------------------------------------------------------
function GradientOrb({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <radialGradient id="orb-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(220, 80%, 55%)" stopOpacity="0.4">
            <animate
              attributeName="stopOpacity"
              values="0.4;0.7;0.4"
              dur="4s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="hsl(220, 80%, 55%)" stopOpacity="0">
            <animate
              attributeName="stopOpacity"
              values="0;0.15;0"
              dur="4s"
              repeatCount="indefinite"
            />
          </stop>
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="180">
        <animate
          attributeName="r"
          values="160;200;160"
          dur="6s"
          repeatCount="indefinite"
        />
        <set attributeName="fill" to="url(#orb-grad)" />
      </circle>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Animated SVG 2: Morphing wave divider
// ---------------------------------------------------------------------------
function WaveDivider() {
  return (
    <svg
      viewBox="0 0 1440 80"
      className="w-full h-auto block"
      preserveAspectRatio="none"
      aria-hidden="true"
      role="presentation"
    >
      <path fill="hsl(220, 80%, 55%)" fillOpacity="0.06">
        <animate
          attributeName="d"
          dur="8s"
          repeatCount="indefinite"
          values="
            M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z;
            M0,40 C360,0 720,80 1080,40 C1260,20 1380,60 1440,40 L1440,80 L0,80 Z;
            M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z
          "
        />
      </path>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Intersection Observer hook for scroll reveals
// ---------------------------------------------------------------------------
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const PODCASTS = [
  {
    title: "Deep Focus",
    host: "Sarah Lin",
    img: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop",
    episodes: 142,
    category: "Technology",
  },
  {
    title: "The Quiet Hour",
    host: "James Obi",
    img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
    episodes: 87,
    category: "Culture",
  },
  {
    title: "Unfiltered",
    host: "Mia Torres",
    img: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop",
    episodes: 215,
    category: "Society",
  },
  {
    title: "Wavelength",
    host: "David Park",
    img: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop",
    episodes: 63,
    category: "Science",
  },
  {
    title: "Nocturn",
    host: "Aisha Bello",
    img: "https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=400&h=400&fit=crop",
    episodes: 108,
    category: "Music",
  },
  {
    title: "First Principles",
    host: "Kenji Tanaka",
    img: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=400&fit=crop",
    episodes: 54,
    category: "Business",
  },
];

const EPISODES = [
  {
    title: "The Architecture of Silence",
    podcast: "Deep Focus",
    duration: "42 min",
    date: "Feb 14, 2026",
  },
  {
    title: "Why We Listen",
    podcast: "The Quiet Hour",
    duration: "38 min",
    date: "Feb 13, 2026",
  },
  {
    title: "Decoding the Algorithm",
    podcast: "Unfiltered",
    duration: "55 min",
    date: "Feb 12, 2026",
  },
  {
    title: "Sound as Medicine",
    podcast: "Wavelength",
    duration: "47 min",
    date: "Feb 11, 2026",
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function MinimalShowcasePage() {
  const accentHSL = "220 80% 55%";

  return (
    <div
      className={`${display.variable} ${body.variable} min-h-screen bg-white text-neutral-900 selection:bg-[hsl(220,80%,55%)]/20`}
      style={
        {
          "--accent": accentHSL,
          fontFamily: "var(--font-body), system-ui, sans-serif",
        } as React.CSSProperties
      }
    >
      {/* ---------------------------------------------------------------- */}
      {/* HERO                                                             */}
      {/* ---------------------------------------------------------------- */}
      <header className="relative overflow-hidden">
        {/* Ambient orb */}
        <GradientOrb className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-60 pointer-events-none motion-reduce:hidden" />

        <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-6">
          <span
            className="text-xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            podverse
          </span>
          <div className="flex items-center gap-8">
            <Link
              href="/explore"
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200 hidden sm:inline"
            >
              Explore
            </Link>
            <Link
              href="/topics"
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200 hidden sm:inline"
            >
              Topics
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center h-10 px-5 text-sm font-medium text-white rounded-full transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(220,80%,55%)]"
              style={{ backgroundColor: `hsl(${accentHSL})` }}
            >
              Get Started
            </Link>
          </div>
        </nav>

        <div className="relative z-10 px-6 md:px-12 lg:px-20 pt-16 pb-24 md:pt-28 md:pb-36 max-w-5xl">
          <Reveal>
            <p
              className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-6"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Podcast Intelligence Platform
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.08] mb-8"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Listen smarter.
              <br />
              <span style={{ color: `hsl(${accentHSL})` }}>
                Understand deeper.
              </span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-lg md:text-xl text-neutral-500 max-w-xl leading-relaxed mb-10">
              AI-powered transcription, search, and conversation for every
              podcast episode. Your personal research assistant for the spoken
              word.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/"
                className="inline-flex items-center justify-center h-12 px-8 text-sm font-medium text-white rounded-full transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(220,80%,55%)]"
                style={{ backgroundColor: `hsl(${accentHSL})` }}
              >
                Start Listening
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center h-12 px-8 text-sm font-medium text-neutral-700 border border-neutral-200 rounded-full transition-all duration-200 hover:border-neutral-400 hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400"
              >
                Browse Library
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Thin accent line */}
        <div
          className="h-px w-full"
          style={{
            background: `linear-gradient(90deg, transparent, hsl(${accentHSL} / 0.3), transparent)`,
          }}
          aria-hidden="true"
        />
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* FEATURED PODCASTS                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section
        className="px-6 md:px-12 lg:px-20 py-20 md:py-28"
        aria-labelledby="featured-heading"
      >
        <Reveal>
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-3">
                Curated
              </p>
              <h2
                id="featured-heading"
                className="text-2xl md:text-3xl font-semibold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Featured Podcasts
              </h2>
            </div>
            <Link
              href="/explore"
              className="text-sm text-neutral-400 hover:text-neutral-900 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(220,80%,55%)]"
            >
              View all &rarr;
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {PODCASTS.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <article className="group cursor-pointer">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-neutral-100">
                  <Image
                    src={p.img}
                    alt={`${p.title} podcast cover art`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3
                      className="text-base font-medium tracking-tight group-hover:text-[hsl(220,80%,55%)] transition-colors duration-200"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {p.title}
                    </h3>
                    <p className="text-sm text-neutral-400 mt-0.5">{p.host}</p>
                  </div>
                  <span className="text-xs text-neutral-300 whitespace-nowrap mt-1">
                    {p.episodes} ep
                  </span>
                </div>
                <span
                  className="inline-block mt-2 text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full border"
                  style={{
                    color: `hsl(${accentHSL})`,
                    borderColor: `hsl(${accentHSL} / 0.2)`,
                  }}
                >
                  {p.category}
                </span>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Wave divider */}
      <WaveDivider />

      {/* ---------------------------------------------------------------- */}
      {/* EPISODE HIGHLIGHTS                                                */}
      {/* ---------------------------------------------------------------- */}
      <section
        className="px-6 md:px-12 lg:px-20 py-20 md:py-28"
        aria-labelledby="episodes-heading"
      >
        <Reveal>
          <div className="mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-3">
              Latest
            </p>
            <h2
              id="episodes-heading"
              className="text-2xl md:text-3xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Episode Highlights
            </h2>
          </div>
        </Reveal>

        <div className="space-y-0 divide-y divide-neutral-100">
          {EPISODES.map((ep, i) => (
            <Reveal key={ep.title} delay={i * 60}>
              <article className="group flex items-center justify-between py-6 cursor-pointer">
                <div className="flex items-center gap-6 min-w-0">
                  {/* Play icon */}
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 group-hover:bg-[hsl(220,80%,55%)] group-hover:text-white"
                    style={{
                      backgroundColor: `hsl(${accentHSL} / 0.08)`,
                      color: `hsl(${accentHSL})`,
                    }}
                    aria-hidden="true"
                  >
                    <svg
                      width="14"
                      height="16"
                      viewBox="0 0 14 16"
                      fill="currentColor"
                    >
                      <path d="M0 0 L14 8 L0 16 Z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-medium tracking-tight truncate group-hover:text-[hsl(220,80%,55%)] transition-colors duration-200">
                      {ep.title}
                    </h3>
                    <p className="text-sm text-neutral-400 mt-0.5">
                      {ep.podcast}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                  <span className="text-sm text-neutral-300 hidden sm:inline">
                    {ep.date}
                  </span>
                  <span className="text-sm text-neutral-400 tabular-nums">
                    {ep.duration}
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* STATS BAR                                                         */}
      {/* ---------------------------------------------------------------- */}
      <Reveal>
        <section
          className="px-6 md:px-12 lg:px-20 py-16 border-t border-neutral-100"
          aria-label="Platform statistics"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl">
            {[
              { value: "12K+", label: "Episodes" },
              { value: "850+", label: "Podcasts" },
              { value: "2.4M", label: "Minutes Transcribed" },
              { value: "99.2%", label: "Accuracy" },
            ].map((s) => (
              <div key={s.label}>
                <p
                  className="text-3xl md:text-4xl font-semibold tracking-tight"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: `hsl(${accentHSL})`,
                  }}
                >
                  {s.value}
                </p>
                <p className="text-sm text-neutral-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ---------------------------------------------------------------- */}
      {/* FOOTER                                                            */}
      {/* ---------------------------------------------------------------- */}
      <footer className="px-6 md:px-12 lg:px-20 py-12 border-t border-neutral-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              podverse
            </span>
            <p className="text-sm text-neutral-400 mt-1">
              AI-powered podcast intelligence.
            </p>
          </div>
          <nav aria-label="Footer navigation" className="flex gap-8">
            {["Explore", "Topics", "About", "Privacy"].map((link) => (
              <Link
                key={link}
                href={`/${link.toLowerCase()}`}
                className="text-sm text-neutral-400 hover:text-neutral-900 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(220,80%,55%)]"
              >
                {link}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-neutral-50">
          <p className="text-xs text-neutral-300">
            &copy; 2026 Podverse. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
