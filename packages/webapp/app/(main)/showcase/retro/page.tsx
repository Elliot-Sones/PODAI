/* AGENT CLAIMS
 * Agent: retro-designer
 * Aesthetic: Retro-Futuristic (Y2K revival)
 * Display Font: Space Grotesk
 * Body Font: Libre Franklin
 * Accent: hsl(280, 75%, 60%)
 */

"use client";

import { Space_Grotesk, Libre_Franklin } from "next/font/google";
import { useEffect, useRef, useState } from "react";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "700"],
});

const libreFranklin = Libre_Franklin({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

// ─── Animated SVG: Rotating Chrome Ring ──────────────────────────────────────
function ChromeRing({ size = 200, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <defs>
        <linearGradient id="chrome-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(280, 75%, 60%)">
            <animate attributeName="stop-color" values="hsl(280,75%,60%);hsl(200,80%,65%);hsl(320,70%,55%);hsl(280,75%,60%)" dur="4s" repeatCount="indefinite" />
          </stop>
          <stop offset="50%" stopColor="hsl(200, 80%, 70%)">
            <animate attributeName="stop-color" values="hsl(200,80%,70%);hsl(320,70%,60%);hsl(280,75%,65%);hsl(200,80%,70%)" dur="4s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="hsl(320, 70%, 55%)">
            <animate attributeName="stop-color" values="hsl(320,70%,55%);hsl(280,75%,60%);hsl(200,80%,70%);hsl(320,70%,55%)" dur="4s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="12s" repeatCount="indefinite" />
        {/* Outer ring */}
        <circle cx="100" cy="100" r="90" fill="none" stroke="url(#chrome-grad)" strokeWidth="3" opacity="0.6" />
        {/* Inner geometric octagon */}
        <polygon
          points="100,20 155,45 180,100 155,155 100,180 45,155 20,100 45,45"
          fill="none"
          stroke="url(#chrome-grad)"
          strokeWidth="2"
          opacity="0.4"
        />
        {/* Cross lines */}
        <line x1="100" y1="10" x2="100" y2="190" stroke="url(#chrome-grad)" strokeWidth="1" opacity="0.2" />
        <line x1="10" y1="100" x2="190" y2="100" stroke="url(#chrome-grad)" strokeWidth="1" opacity="0.2" />
      </g>
    </svg>
  );
}

// ─── Animated SVG: Pulsing Pixel Grid ────────────────────────────────────────
function PixelGrid({ className = "" }: { className?: string }) {
  const cells = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const delay = (row + col) * 0.3;
      cells.push(
        <rect
          key={`${row}-${col}`}
          x={col * 14 + 2}
          y={row * 14 + 2}
          width="10"
          height="10"
          rx="1"
          fill="hsl(280, 75%, 60%)"
          opacity="0.15"
        >
          <animate
            attributeName="opacity"
            values="0.15;0.7;0.15"
            dur="2.5s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </rect>
      );
    }
  }
  return (
    <svg width="86" height="86" viewBox="0 0 86 86" className={className} aria-hidden="true" role="img">
      {cells}
    </svg>
  );
}

// ─── Animated SVG: Waveform Bars ─────────────────────────────────────────────
function WaveformBars({ className = "" }: { className?: string }) {
  const bars = Array.from({ length: 16 }, (_, i) => {
    const baseHeight = 8 + Math.sin(i * 0.8) * 15 + 15;
    const maxHeight = baseHeight + 10;
    return (
      <rect
        key={i}
        x={i * 7 + 1}
        y={50 - baseHeight / 2}
        width="4"
        height={baseHeight}
        rx="2"
        fill="hsl(280, 75%, 60%)"
        opacity="0.6"
      >
        <animate
          attributeName="height"
          values={`${baseHeight};${maxHeight};${baseHeight}`}
          dur={`${0.8 + Math.random() * 0.6}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="y"
          values={`${50 - baseHeight / 2};${50 - maxHeight / 2};${50 - baseHeight / 2}`}
          dur={`${0.8 + Math.random() * 0.6}s`}
          repeatCount="indefinite"
        />
      </rect>
    );
  });
  return (
    <svg width="114" height="50" viewBox="0 0 114 50" className={className} aria-hidden="true" role="img">
      {bars}
    </svg>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────
const FEATURED_PODCASTS = [
  {
    title: "Neon Frequencies",
    host: "DJ Chromatic",
    desc: "Electronic music meets deep conversation in a Y2K aesthetic wonderland.",
    img: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop",
    episodes: 142,
    category: "Music",
  },
  {
    title: "Pixel Philosophy",
    host: "Ada Circuit",
    desc: "Where retro computing culture and modern philosophy collide.",
    img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop",
    episodes: 89,
    category: "Technology",
  },
  {
    title: "Chrome Dreams",
    host: "Max Voltage",
    desc: "Futurism, sci-fi, and the aesthetics of tomorrow, today.",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    episodes: 214,
    category: "Culture",
  },
  {
    title: "Digital Nostalgia",
    host: "Retro Rewind Crew",
    desc: "Revisiting the sounds, tech, and vibes of the early internet era.",
    img: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop",
    episodes: 67,
    category: "History",
  },
  {
    title: "Synth & Soul",
    host: "Lena Wave",
    desc: "Analog synths, digital hearts, and stories that resonate.",
    img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop",
    episodes: 183,
    category: "Music",
  },
  {
    title: "The Glitch Report",
    host: "Zero Cool",
    desc: "Cybersecurity, hacking culture, and the underground digital world.",
    img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop",
    episodes: 56,
    category: "Tech",
  },
];

const EPISODE_HIGHLIGHTS = [
  {
    podcast: "Neon Frequencies",
    title: "The Lost Art of Mixtapes",
    duration: "42 min",
    date: "Feb 12, 2026",
  },
  {
    podcast: "Chrome Dreams",
    title: "Y2K: The Bug That Changed Everything",
    duration: "58 min",
    date: "Feb 10, 2026",
  },
  {
    podcast: "Pixel Philosophy",
    title: "Are We Living in a Simulation? (Again)",
    duration: "36 min",
    date: "Feb 8, 2026",
  },
  {
    podcast: "The Glitch Report",
    title: "Inside the Matrix: Real Hackers Speak",
    duration: "51 min",
    date: "Feb 5, 2026",
  },
];

const STATS = [
  { label: "Podcasts", value: "2,400+" },
  { label: "Episodes", value: "180K+" },
  { label: "Listeners", value: "1.2M" },
  { label: "Hours Played", value: "9.8M" },
];

// ─── Intersection Observer Hook ──────────────────────────────────────────────
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

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function RetroShowcasePage() {
  const podcastsSection = useInView();
  const episodesSection = useInView();
  const statsSection = useInView();

  return (
    <div
      className={`${spaceGrotesk.variable} ${libreFranklin.variable} min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden`}
      style={{ fontFamily: "var(--font-body), sans-serif" }}
    >
      {/* ─── Pixel Grid Background ─── */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(hsl(280, 75%, 60%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(280, 75%, 60%) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      {/* ─── Skip Link ─── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[hsl(280,75%,60%)] focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* ─── Navigation ─── */}
      <nav className="relative z-10 border-b border-white/10" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PixelGrid className="w-8 h-8" />
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              PODVERSE
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#podcasts" className="hover:text-[hsl(280,75%,60%)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[hsl(280,75%,60%)] focus:ring-offset-2 focus:ring-offset-[#0a0a0f] rounded px-1">
              Discover
            </a>
            <a href="#episodes" className="hover:text-[hsl(280,75%,60%)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[hsl(280,75%,60%)] focus:ring-offset-2 focus:ring-offset-[#0a0a0f] rounded px-1">
              Episodes
            </a>
            <a href="#stats" className="hover:text-[hsl(280,75%,60%)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[hsl(280,75%,60%)] focus:ring-offset-2 focus:ring-offset-[#0a0a0f] rounded px-1">
              Stats
            </a>
          </div>
          <button
            className="px-5 py-2.5 text-sm font-semibold rounded-full border border-[hsl(280,75%,60%)] text-[hsl(280,75%,60%)] hover:bg-[hsl(280,75%,60%)] hover:text-white transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[hsl(280,75%,60%)] focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Launch App
          </button>
        </div>
      </nav>

      <main id="main-content">
        {/* ─── Hero Section ─── */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-10 right-10 md:top-20 md:right-20 opacity-30" aria-hidden="true">
            <ChromeRing size={300} className="hidden md:block" />
            <ChromeRing size={160} className="md:hidden" />
          </div>
          <div className="absolute bottom-20 left-10 opacity-20" aria-hidden="true">
            <ChromeRing size={120} />
          </div>

          {/* Chrome gradient accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            aria-hidden="true"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(280,75%,60%), hsl(200,80%,65%), hsl(320,70%,55%), transparent)",
            }}
          />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Tag */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-[hsl(280,75%,60%)]/30 bg-[hsl(280,75%,60%)]/5 text-[hsl(280,75%,60%)] text-xs font-medium tracking-widest uppercase animate-fade-in"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              <span className="w-2 h-2 rounded-full bg-[hsl(280,75%,60%)] animate-pulse" aria-hidden="true" />
              Now Streaming
            </div>

            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight mb-6 animate-slide-up"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              <span className="block">Listen to the</span>
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, hsl(280,75%,60%), hsl(200,80%,70%), hsl(320,70%,55%))",
                }}
              >
                Future
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 animate-slide-up-delay leading-relaxed">
              Discover, stream, and explore thousands of podcasts powered by AI.
              Your next favorite show is one click away.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delay-2">
              <button
                className="px-8 py-4 text-base font-semibold rounded-full text-white transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[hsl(280,75%,60%)] focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  background: "linear-gradient(135deg, hsl(280,75%,60%), hsl(320,70%,55%))",
                }}
              >
                Start Listening
              </button>
              <button
                className="px-8 py-4 text-base font-semibold rounded-full border border-white/20 text-white/80 hover:border-white/40 hover:text-white transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                Browse Catalog
              </button>
            </div>

            {/* Waveform decoration */}
            <div className="mt-16 flex justify-center opacity-40" aria-hidden="true">
              <WaveformBars />
            </div>
          </div>
        </section>

        {/* ─── Stats Bar ─── */}
        <section
          id="stats"
          ref={statsSection.ref}
          className="relative border-y border-white/10 bg-white/[0.02]"
          aria-label="Platform statistics"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`text-center transition-all duration-500 ${
                    statsSection.inView
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div
                    className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent"
                    style={{
                      fontFamily: "var(--font-display), sans-serif",
                      backgroundImage: "linear-gradient(135deg, hsl(280,75%,60%), hsl(200,80%,70%))",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/50 mt-1 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Featured Podcasts ─── */}
        <section
          id="podcasts"
          ref={podcastsSection.ref}
          className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8"
          aria-labelledby="podcasts-heading"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2
                  id="podcasts-heading"
                  className="text-3xl sm:text-4xl font-bold tracking-tight"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  Featured Podcasts
                </h2>
                <p className="text-white/50 mt-2 text-base">Curated picks from the future of audio.</p>
              </div>
              <PixelGrid className="hidden sm:block opacity-40" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURED_PODCASTS.map((podcast, i) => (
                <article
                  key={podcast.title}
                  className={`group relative rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-[hsl(280,75%,60%)]/40 transition-all duration-300 hover:translate-y-[-2px] focus-within:ring-2 focus-within:ring-[hsl(280,75%,60%)] ${
                    podcastsSection.inView
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                  }`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <a href="#" className="block focus:outline-none" aria-label={`${podcast.title} by ${podcast.host}`}>
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={podcast.img}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Chrome overlay on hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-300"
                        aria-hidden="true"
                        style={{
                          background: "linear-gradient(135deg, hsl(280,75%,60%,0.3), transparent 60%)",
                        }}
                      />
                      {/* Category badge */}
                      <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white/80">
                        {podcast.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3
                        className="text-lg font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-display), sans-serif" }}
                      >
                        {podcast.title}
                      </h3>
                      <p className="text-sm text-[hsl(280,75%,60%)] font-medium mt-0.5">{podcast.host}</p>
                      <p className="text-sm text-white/50 mt-2 line-clamp-2 leading-relaxed">{podcast.desc}</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-white/40">
                        <span>{podcast.episodes} episodes</span>
                        <span className="text-[hsl(280,75%,60%)] font-medium group-hover:translate-x-1 transition-transform duration-200">
                          Listen →
                        </span>
                      </div>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Episode Highlights ─── */}
        <section
          id="episodes"
          ref={episodesSection.ref}
          className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white/[0.02] border-y border-white/10"
          aria-labelledby="episodes-heading"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <WaveformBars className="opacity-50" />
              <h2
                id="episodes-heading"
                className="text-3xl sm:text-4xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                Latest Episodes
              </h2>
            </div>

            <div className="space-y-4">
              {EPISODE_HIGHLIGHTS.map((ep, i) => (
                <article
                  key={ep.title}
                  className={`group flex items-center gap-5 p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-[hsl(280,75%,60%)]/30 hover:bg-white/[0.04] transition-all duration-300 focus-within:ring-2 focus-within:ring-[hsl(280,75%,60%)] ${
                    episodesSection.inView
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-6"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {/* Play button */}
                  <button
                    className="flex-shrink-0 w-12 h-12 rounded-full border border-[hsl(280,75%,60%)]/40 flex items-center justify-center text-[hsl(280,75%,60%)] hover:bg-[hsl(280,75%,60%)] hover:text-white transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[hsl(280,75%,60%)] focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
                    aria-label={`Play ${ep.title}`}
                  >
                    <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor" aria-hidden="true">
                      <path d="M0 0L16 9L0 18V0Z" />
                    </svg>
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[hsl(280,75%,60%)] font-medium">{ep.podcast}</p>
                    <h3
                      className="text-base font-bold tracking-tight truncate mt-0.5"
                      style={{ fontFamily: "var(--font-display), sans-serif" }}
                    >
                      {ep.title}
                    </h3>
                  </div>

                  <div className="hidden sm:flex items-center gap-4 text-xs text-white/40 flex-shrink-0">
                    <span>{ep.duration}</span>
                    <span>{ep.date}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="relative border-t border-white/10 py-16 px-4 sm:px-6 lg:px-8" role="contentinfo">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <PixelGrid className="w-7 h-7" />
                <span
                  className="text-lg font-bold tracking-tight"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  PODVERSE
                </span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed">
                The future of podcast discovery, powered by AI and built for curious minds.
              </p>
            </div>
            {[
              { title: "Product", links: ["Discover", "Categories", "Topics", "Chat"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Licenses"] },
            ].map((col) => (
              <div key={col.title}>
                <h3
                  className="text-sm font-semibold text-white/70 mb-4 tracking-wide uppercase"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-white/40 hover:text-[hsl(280,75%,60%)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[hsl(280,75%,60%)] rounded px-1"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/30">
              &copy; 2026 Podverse. All rights reserved.
            </p>
            <div
              className="h-[1px] w-20"
              aria-hidden="true"
              style={{
                background: "linear-gradient(90deg, transparent, hsl(280,75%,60%), transparent)",
              }}
            />
          </div>
        </div>
      </footer>

      {/* ─── CSS Animations ─── */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out both;
        }
        .animate-slide-up {
          animation: slide-up 0.7s ease-out both;
          animation-delay: 0.1s;
        }
        .animate-slide-up-delay {
          animation: slide-up 0.7s ease-out both;
          animation-delay: 0.25s;
        }
        .animate-slide-up-delay-2 {
          animation: slide-up 0.7s ease-out both;
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}
