/* AGENT CLAIMS
 * Agent: editorial-designer
 * Aesthetic: Maximalist editorial
 * Display Font: Instrument Serif
 * Body Font: Source Serif Pro
 * Accent: hsl(15, 85%, 55%)
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { Instrument_Serif, Source_Serif_4 } from "next/font/google";
import { cn } from "@/lib/utils";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-body",
});

/* ─── Animated SVG: Editorial Line-Draw Flourish ─── */
function EditorialFlourish({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 60"
      fill="none"
      className={cn("w-full", className)}
      aria-hidden="true"
      role="presentation"
    >
      <path
        d="M0 30 Q100 0 200 30 T400 30"
        stroke="hsl(15, 85%, 55%)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="600"
          to="0"
          dur="3s"
          fill="freeze"
          begin="0.5s"
        />
        <set attributeName="stroke-dasharray" to="600" />
      </path>
      <path
        d="M0 35 Q100 60 200 35 T400 35"
        stroke="hsl(15, 85%, 35%)"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="600"
          to="0"
          dur="3s"
          fill="freeze"
          begin="1s"
        />
        <set attributeName="stroke-dasharray" to="600" />
      </path>
      {/* Decorative dots along the path */}
      {[50, 150, 250, 350].map((cx, i) => (
        <circle key={cx} cx={cx} cy={30} r="3" fill="hsl(15, 85%, 55%)">
          <animate
            attributeName="opacity"
            from="0"
            to="1"
            dur="0.4s"
            fill="freeze"
            begin={`${1.5 + i * 0.3}s`}
          />
          <animate
            attributeName="r"
            from="0"
            to="3"
            dur="0.4s"
            fill="freeze"
            begin={`${1.5 + i * 0.3}s`}
          />
        </circle>
      ))}
    </svg>
  );
}

/* ─── Animated SVG: Geometric Grid Pattern ─── */
function GeometricGrid({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn("w-full h-full", className)}
      aria-hidden="true"
      role="presentation"
    >
      {/* Rotating square frame */}
      <rect
        x="40"
        y="40"
        width="120"
        height="120"
        fill="none"
        stroke="hsl(15, 85%, 55%)"
        strokeWidth="1"
        opacity="0.6"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 100 100"
          to="360 100 100"
          dur="30s"
          repeatCount="indefinite"
        />
      </rect>
      {/* Counter-rotating diamond */}
      <rect
        x="55"
        y="55"
        width="90"
        height="90"
        fill="none"
        stroke="hsl(15, 85%, 55%)"
        strokeWidth="0.75"
        opacity="0.3"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="45 100 100"
          to="-315 100 100"
          dur="25s"
          repeatCount="indefinite"
        />
      </rect>
      {/* Pulsing center circle */}
      <circle cx="100" cy="100" r="15" fill="none" stroke="hsl(15, 85%, 55%)" strokeWidth="1">
        <animate
          attributeName="r"
          values="15;25;15"
          dur="4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.8;0.2;0.8"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>
      {/* Cross lines */}
      <line x1="100" y1="10" x2="100" y2="190" stroke="hsl(15, 85%, 55%)" strokeWidth="0.5" opacity="0.2" />
      <line x1="10" y1="100" x2="190" y2="100" stroke="hsl(15, 85%, 55%)" strokeWidth="0.5" opacity="0.2" />
      {/* Corner accents */}
      {[
        [20, 20],
        [180, 20],
        [20, 180],
        [180, 180],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="hsl(15, 85%, 55%)" opacity="0.4">
          <animate
            attributeName="opacity"
            values="0.4;0.8;0.4"
            dur={`${3 + i * 0.5}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

/* ─── Intersection Observer Hook ─── */
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

/* ─── Data ─── */
const FEATURED_PODCASTS = [
  {
    title: "The Daily Dispatch",
    host: "Sarah Chen",
    category: "NEWS",
    episodes: 847,
    image: "https://images.pexels.com/photos/3394666/pexels-photo-3394666.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Breaking down the stories that shape our world, delivered every morning.",
  },
  {
    title: "Code & Culture",
    host: "Marcus Rivera",
    category: "TECHNOLOGY",
    episodes: 312,
    image: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Where software meets society. Deep dives into tech that matters.",
  },
  {
    title: "Sound Histories",
    host: "Dr. Amelia Frost",
    category: "HISTORY",
    episodes: 156,
    image: "https://images.pexels.com/photos/159376/turntable-top-view-audio-702702-159376.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Uncovering forgotten voices and untold narratives from the past.",
  },
  {
    title: "The Creative Hour",
    host: "Yuki Tanaka",
    category: "ARTS",
    episodes: 203,
    image: "https://images.pexels.com/photos/3784221/pexels-photo-3784221.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Conversations with artists, makers, and dreamers on the creative process.",
  },
  {
    title: "Market Pulse",
    host: "David Okoye",
    category: "BUSINESS",
    episodes: 589,
    image: "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Sharp analysis of global markets and the forces driving them.",
  },
  {
    title: "Mindful Mornings",
    host: "Lena Bjork",
    category: "WELLNESS",
    episodes: 410,
    image: "https://images.pexels.com/photos/3560044/pexels-photo-3560044.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Start your day with intention. Meditation, movement, and meaning.",
  },
];

const EPISODE_HIGHLIGHTS = [
  {
    podcast: "The Daily Dispatch",
    title: "The AI Election: How Language Models Changed Campaigning",
    duration: "42 min",
    date: "Feb 14, 2026",
    number: "#847",
  },
  {
    podcast: "Code & Culture",
    title: "Rust in Production: A Two-Year Retrospective",
    duration: "58 min",
    date: "Feb 13, 2026",
    number: "#312",
  },
  {
    podcast: "Sound Histories",
    title: "The Lost Recordings of 1920s Harlem",
    duration: "37 min",
    date: "Feb 12, 2026",
    number: "#156",
  },
  {
    podcast: "Market Pulse",
    title: "Emerging Markets in 2026: Where to Look",
    duration: "51 min",
    date: "Feb 11, 2026",
    number: "#589",
  },
];

const STATS = [
  { label: "Active Shows", value: "12,400+" },
  { label: "Episodes Indexed", value: "2.1M" },
  { label: "Hours Transcribed", value: "890K" },
  { label: "Topics Mapped", value: "47,000" },
];

/* ─── Components ─── */

function StatTicker() {
  const { ref, inView } = useInView(0.3);
  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[hsl(15,85%,55%)] border border-[hsl(15,85%,55%)]">
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className={cn(
            "bg-[hsl(20,8%,8%)] px-6 py-8 text-center transition-all duration-700",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: `${i * 100}ms` }}
        >
          <div
            className="text-3xl md:text-4xl font-bold text-[hsl(15,85%,55%)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {stat.value}
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-400 mt-2">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function PodcastCard({
  podcast,
  index,
  inView,
}: {
  podcast: (typeof FEATURED_PODCASTS)[number];
  index: number;
  inView: boolean;
}) {
  const isLarge = index === 0 || index === 3;
  return (
    <article
      className={cn(
        "group relative overflow-hidden bg-[hsl(20,8%,10%)] border border-neutral-800 transition-all duration-500",
        "hover:border-[hsl(15,85%,55%)] focus-within:border-[hsl(15,85%,55%)]",
        isLarge ? "md:col-span-2 md:row-span-2" : "",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className={cn("relative overflow-hidden", isLarge ? "h-64 md:h-80" : "h-48")}>
        <img
          src={podcast.image}
          alt={`Cover art for ${podcast.title}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(20,8%,8%)] via-transparent to-transparent" />
        <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-[0.25em] bg-[hsl(15,85%,55%)] text-white px-3 py-1">
          {podcast.category}
        </span>
      </div>
      <div className="p-5">
        <h3
          className={cn(
            "text-xl md:text-2xl text-white leading-tight",
            isLarge && "md:text-3xl"
          )}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {podcast.title}
        </h3>
        <p className="text-neutral-400 text-sm mt-1">by {podcast.host}</p>
        <p className="text-neutral-500 text-sm mt-3 leading-relaxed line-clamp-2">
          {podcast.description}
        </p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-800">
          <span className="text-xs text-neutral-500 uppercase tracking-wider">
            {podcast.episodes} episodes
          </span>
          <button
            className="text-xs font-semibold uppercase tracking-wider text-[hsl(15,85%,55%)] hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(15,85%,55%)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(20,8%,10%)] rounded px-2 py-1"
            aria-label={`Explore ${podcast.title}`}
          >
            Explore &rarr;
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─── Page ─── */
export default function EditorialShowcase() {
  const heroRef = useInView(0.1);
  const gridRef = useInView(0.1);
  const episodesRef = useInView(0.1);
  const ctaRef = useInView(0.2);

  return (
    <div
      className={cn(
        instrumentSerif.variable,
        sourceSerif.variable,
        "min-h-screen bg-[hsl(20,8%,6%)] text-neutral-200"
      )}
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* ═══ HERO ═══ */}
      <header className="relative overflow-hidden">
        {/* Geometric grid background */}
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 opacity-20">
          <GeometricGrid />
        </div>
        <div className="absolute bottom-0 left-0 w-48 h-48 md:w-72 md:h-72 opacity-10">
          <GeometricGrid />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 md:pt-36 md:pb-24">
          {/* Overline */}
          <div
            ref={heroRef.ref}
            className={cn(
              "transition-all duration-700",
              heroRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-[hsl(15,85%,55%)] font-semibold">
              The Podcast Intelligence Platform
            </span>
          </div>

          {/* Main headline */}
          <h1
            className={cn(
              "mt-6 text-5xl md:text-7xl lg:text-8xl text-white leading-[0.95] max-w-5xl transition-all duration-700 delay-100",
              heroRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
            style={{ fontFamily: "var(--font-display)" }}
          >
            Every Word.
            <br />
            <span className="text-[hsl(15,85%,55%)]">Every Insight.</span>
            <br />
            Indexed.
          </h1>

          {/* Subhead */}
          <p
            className={cn(
              "mt-8 text-lg md:text-xl text-neutral-400 max-w-2xl leading-relaxed transition-all duration-700 delay-200",
              heroRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            Search across millions of podcast episodes by topic, speaker, or idea.
            AI-powered transcription meets deep semantic search.
          </p>

          {/* CTA row */}
          <div
            className={cn(
              "mt-10 flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-300",
              heroRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            <button className="inline-flex items-center justify-center h-12 px-8 bg-[hsl(15,85%,55%)] text-white font-semibold text-sm uppercase tracking-wider hover:bg-[hsl(15,85%,45%)] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(15,85%,55%)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(20,8%,6%)]">
              Start Exploring
            </button>
            <button className="inline-flex items-center justify-center h-12 px-8 border border-neutral-600 text-neutral-300 font-semibold text-sm uppercase tracking-wider hover:border-[hsl(15,85%,55%)] hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(15,85%,55%)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(20,8%,6%)]">
              How It Works
            </button>
          </div>

          {/* Flourish divider */}
          <div className="mt-16 max-w-xl">
            <EditorialFlourish />
          </div>
        </div>
      </header>

      {/* ═══ STATS BAR ═══ */}
      <section aria-label="Platform statistics" className="max-w-7xl mx-auto px-6 -mt-2">
        <StatTicker />
      </section>

      {/* ═══ FEATURED PODCASTS GRID ═══ */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28" aria-labelledby="featured-heading">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[hsl(15,85%,55%)] font-semibold">
              Curated Selection
            </span>
            <h2
              id="featured-heading"
              className="mt-2 text-3xl md:text-5xl text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Featured Shows
            </h2>
          </div>
          <button className="hidden md:inline-flex text-xs uppercase tracking-wider text-neutral-400 hover:text-[hsl(15,85%,55%)] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(15,85%,55%)] rounded px-2 py-1">
            View All &rarr;
          </button>
        </div>

        <div
          ref={gridRef.ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {FEATURED_PODCASTS.map((p, i) => (
            <PodcastCard key={p.title} podcast={p} index={i} inView={gridRef.inView} />
          ))}
        </div>
      </section>

      {/* ═══ EDITORIAL DIVIDER ═══ */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-t border-neutral-800" />
      </div>

      {/* ═══ EPISODE HIGHLIGHTS ═══ */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28" aria-labelledby="episodes-heading">
        <div className="grid md:grid-cols-12 gap-10">
          {/* Left column: heading + geometric */}
          <div className="md:col-span-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[hsl(15,85%,55%)] font-semibold">
              Latest Episodes
            </span>
            <h2
              id="episodes-heading"
              className="mt-2 text-3xl md:text-4xl text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              This Week&apos;s
              <br />
              Highlights
            </h2>
            <p className="mt-4 text-neutral-500 text-sm leading-relaxed">
              Hand-picked episodes from across the platform.
              Transcribed, indexed, and ready to explore.
            </p>
            <div className="mt-8 w-32 h-32">
              <GeometricGrid />
            </div>
          </div>

          {/* Right column: episode list */}
          <div ref={episodesRef.ref} className="md:col-span-8">
            <div className="divide-y divide-neutral-800">
              {EPISODE_HIGHLIGHTS.map((ep, i) => (
                <article
                  key={ep.title}
                  className={cn(
                    "group py-6 flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-500 cursor-pointer",
                    "hover:bg-[hsl(20,8%,10%)] hover:px-4 hover:-mx-4",
                    episodesRef.inView
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-8"
                  )}
                  style={{ transitionDelay: `${i * 100}ms` }}
                  tabIndex={0}
                  role="link"
                  aria-label={`${ep.title} from ${ep.podcast}`}
                >
                  <span className="text-3xl font-bold text-neutral-800 group-hover:text-[hsl(15,85%,55%)] transition-colors duration-200 shrink-0 w-16" style={{ fontFamily: "var(--font-display)" }}>
                    {ep.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[hsl(15,85%,55%)]">
                      {ep.podcast}
                    </p>
                    <h3
                      className="text-lg text-white mt-1 group-hover:text-[hsl(15,85%,55%)] transition-colors duration-200 truncate"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {ep.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-500 shrink-0">
                    <span>{ep.duration}</span>
                    <span className="hidden sm:inline">{ep.date}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section
        ref={ctaRef.ref}
        className="relative overflow-hidden bg-[hsl(15,85%,55%)]"
        aria-labelledby="cta-heading"
      >
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" aria-hidden="true">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div
          className={cn(
            "relative max-w-7xl mx-auto px-6 py-20 md:py-28 text-center transition-all duration-700",
            ctaRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
        >
          <h2
            id="cta-heading"
            className="text-3xl md:text-5xl lg:text-6xl text-white leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            The World&apos;s Podcasts,
            <br />
            Searchable.
          </h2>
          <p className="mt-6 text-white/80 max-w-xl mx-auto text-lg">
            Join thousands of listeners, researchers, and creators who use Podverse
            to discover what matters.
          </p>
          <button className="mt-10 inline-flex items-center justify-center h-14 px-10 bg-[hsl(20,8%,8%)] text-white font-semibold text-sm uppercase tracking-wider hover:bg-[hsl(20,8%,15%)] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(15,85%,55%)]">
            Get Started Free
          </button>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-neutral-800 bg-[hsl(20,8%,5%)]" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div className="col-span-2 md:col-span-1">
              <h3
                className="text-2xl text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Podverse
              </h3>
              <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
                AI-powered podcast intelligence. Search, discover, and explore
                the spoken word.
              </p>
            </div>
            {[
              {
                heading: "Product",
                links: ["Search", "Topics", "Explore", "API"],
              },
              {
                heading: "Company",
                links: ["About", "Blog", "Careers", "Press"],
              },
              {
                heading: "Legal",
                links: ["Privacy", "Terms", "Cookies"],
              },
            ].map((col) => (
              <nav key={col.heading} aria-label={col.heading}>
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  {col.heading}
                </h4>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-neutral-500 hover:text-[hsl(15,85%,55%)] transition-colors duration-200 focus:outline-none focus-visible:underline"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-neutral-600">
              &copy; 2026 Podverse. All rights reserved.
            </p>
            <div className="flex items-center gap-1">
              <EditorialFlourish className="w-24" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
