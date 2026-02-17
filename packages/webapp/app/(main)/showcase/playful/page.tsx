/* AGENT CLAIMS
 * Agent: playful-designer
 * Aesthetic: Playful/Toy-like (Figma/Notion style)
 * Display Font: DM Sans
 * Body Font: Work Sans
 * Accent: hsl(160, 70%, 45%)
 */

"use client";

import React, { useEffect, useState } from "react";
import { DM_Sans, Work_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-display",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

// ─── Animated SVG: Bouncing Blob ─────────────────────────────────────────────
function BouncingBlob({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <defs>
        <linearGradient id="blob-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(160, 70%, 45%)" />
          <stop offset="100%" stopColor="hsl(200, 80%, 55%)" />
        </linearGradient>
      </defs>
      <path fill="url(#blob-grad)">
        <animate
          attributeName="d"
          dur="6s"
          repeatCount="indefinite"
          values="
            M44.5,-55.3C56.1,-47.5,63.1,-32.5,67.3,-16.5C71.5,-0.5,72.9,16.5,66.3,30.1C59.7,43.7,45.1,53.9,29.5,60.5C13.9,67.1,-2.7,70.1,-19.3,67.1C-35.9,64.1,-52.5,55.1,-61.9,41.3C-71.3,27.5,-73.5,8.9,-70.1,-8.1C-66.7,-25.1,-57.7,-40.5,-45.1,-48.3C-32.5,-56.1,-16.3,-56.3,0.5,-56.9C17.3,-57.5,34.5,-58.5,44.5,-55.3Z;
            M39.9,-49.7C51.3,-40.7,59.7,-27.7,63.3,-13.1C66.9,1.5,65.7,17.7,58.7,31.3C51.7,44.9,38.9,55.9,24.3,60.9C9.7,65.9,-6.7,64.9,-21.9,59.3C-37.1,53.7,-51.1,43.5,-59.5,29.5C-67.9,15.5,-70.7,-2.3,-66.3,-18.1C-61.9,-33.9,-50.3,-47.7,-36.7,-56.1C-23.1,-64.5,-7.5,-67.5,4.3,-72.7C16.1,-77.9,28.5,-58.7,39.9,-49.7Z;
            M44.5,-55.3C56.1,-47.5,63.1,-32.5,67.3,-16.5C71.5,-0.5,72.9,16.5,66.3,30.1C59.7,43.7,45.1,53.9,29.5,60.5C13.9,67.1,-2.7,70.1,-19.3,67.1C-35.9,64.1,-52.5,55.1,-61.9,41.3C-71.3,27.5,-73.5,8.9,-70.1,-8.1C-66.7,-25.1,-57.7,-40.5,-45.1,-48.3C-32.5,-56.1,-16.3,-56.3,0.5,-56.9C17.3,-57.5,34.5,-58.5,44.5,-55.3Z
          "
        />
      </path>
    </svg>
  );
}

// ─── Animated SVG: Floating Dots ─────────────────────────────────────────────
function FloatingDots({ className = "" }: { className?: string }) {
  const dots = [
    { cx: 30, cy: 40, r: 8, color: "hsl(160, 70%, 45%)", dur: "3s", dy: -15 },
    { cx: 80, cy: 60, r: 6, color: "hsl(280, 60%, 60%)", dur: "4s", dy: -20 },
    { cx: 140, cy: 35, r: 10, color: "hsl(40, 90%, 60%)", dur: "3.5s", dy: -12 },
    { cx: 180, cy: 70, r: 5, color: "hsl(340, 70%, 60%)", dur: "2.8s", dy: -18 },
    { cx: 60, cy: 80, r: 7, color: "hsl(200, 80%, 55%)", dur: "3.2s", dy: -14 },
    { cx: 120, cy: 55, r: 9, color: "hsl(100, 60%, 50%)", dur: "3.8s", dy: -16 },
  ];
  return (
    <svg viewBox="0 0 200 100" className={className} aria-hidden="true">
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.color} opacity="0.7">
          <animate
            attributeName="cy"
            values={`${d.cy};${d.cy + d.dy};${d.cy}`}
            dur={d.dur}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.7;1;0.7"
            dur={d.dur}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

// ─── Animated SVG: Spinning Rings (bonus) ────────────────────────────────────
function SpinningRings({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle
        cx="50" cy="50" r="35"
        fill="none" stroke="hsl(160, 70%, 45%)" strokeWidth="3"
        strokeDasharray="60 160" opacity="0.5"
      >
        <animateTransform
          attributeName="transform" type="rotate"
          from="0 50 50" to="360 50 50" dur="8s" repeatCount="indefinite"
        />
      </circle>
      <circle
        cx="50" cy="50" r="25"
        fill="none" stroke="hsl(40, 90%, 60%)" strokeWidth="2"
        strokeDasharray="40 120" opacity="0.4"
      >
        <animateTransform
          attributeName="transform" type="rotate"
          from="360 50 50" to="0 50 50" dur="6s" repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────
const podcasts = [
  { title: "The Creative Hour", host: "Maya Lin", category: "Creativity", img: "https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400&h=400&fit=crop", color: "bg-teal-100" },
  { title: "Deep Dive Tech", host: "Alex Rivera", category: "Technology", img: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop", color: "bg-amber-100" },
  { title: "Mindful Mornings", host: "Sara Chen", category: "Wellness", img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop", color: "bg-purple-100" },
  { title: "Story Architects", host: "James Obi", category: "Storytelling", img: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop", color: "bg-rose-100" },
  { title: "Sound Lab", host: "Kim Tanaka", category: "Music", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop", color: "bg-sky-100" },
  { title: "Future Forward", host: "Leo Marquez", category: "Science", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", color: "bg-emerald-100" },
];

const episodes = [
  { title: "Why Creativity Needs Constraints", podcast: "The Creative Hour", duration: "32 min", date: "Feb 14" },
  { title: "AI in Your Pocket", podcast: "Deep Dive Tech", duration: "45 min", date: "Feb 13" },
  { title: "Morning Routines That Stick", podcast: "Mindful Mornings", duration: "28 min", date: "Feb 12" },
  { title: "Building Worlds with Words", podcast: "Story Architects", duration: "51 min", date: "Feb 11" },
];

const stats = [
  { label: "Podcasts", value: "2,400+" },
  { label: "Episodes", value: "180K+" },
  { label: "Listeners", value: "1.2M" },
  { label: "Hours of Audio", value: "500K+" },
];

// ─── Page ────────────────────────────────────────────────────────────────────
export default function PlayfulShowcase() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className={`${dmSans.variable} ${workSans.variable} min-h-screen overflow-x-hidden`}
      style={{
        fontFamily: "var(--font-body), sans-serif",
        background: "linear-gradient(135deg, #f0fdf9 0%, #fef9ec 50%, #fdf2f8 100%)",
      }}
    >
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-2xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* ─── Nav ─────────────────────────────────────────────────────── */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5" aria-label="Main navigation">
        <div className="flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
          <span
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-white text-lg font-extrabold"
            style={{ background: "hsl(160, 70%, 45%)" }}
            aria-hidden="true"
          >
            P
          </span>
          <span className="text-xl font-extrabold text-gray-900">Podverse</span>
        </div>
        <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
          <a href="#featured" className="transition-colors hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:rounded">Discover</a>
          <a href="#episodes" className="transition-colors hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:rounded">Episodes</a>
          <a href="#stats" className="transition-colors hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:rounded">About</a>
          <button
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            style={{ background: "hsl(160, 70%, 45%)" }}
          >
            Get Started
          </button>
        </div>
      </nav>

      <main id="main-content">
        {/* ─── Hero ────────────────────────────────────────────────── */}
        <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-12 md:pt-20">
          {/* Background decorations */}
          <BouncingBlob className="pointer-events-none absolute -right-20 -top-10 w-72 opacity-20 md:w-96" />
          <FloatingDots className="pointer-events-none absolute bottom-10 left-0 w-64 opacity-30" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Pill badge */}
            <span
              className={`mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-teal-700 backdrop-blur transition-all ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDuration: "600ms" }}
            >
              <span className="inline-block h-2 w-2 rounded-full bg-teal-400 animate-pulse" aria-hidden="true" />
              Now with AI-powered search
            </span>

            <h1
              className={`max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-7xl transition-all ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{ fontFamily: "var(--font-display)", transitionDuration: "700ms", transitionDelay: "100ms" }}
            >
              Your podcasts,{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, hsl(160,70%,45%), hsl(200,80%,55%))" }}
              >
                supercharged
              </span>
            </h1>

            <p
              className={`mt-6 max-w-2xl text-lg text-gray-500 md:text-xl transition-all ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{ transitionDuration: "700ms", transitionDelay: "250ms" }}
            >
              Discover, transcribe, and chat with any podcast. Powered by AI that actually understands what was said.
            </p>

            <div
              className={`mt-10 flex flex-col gap-4 sm:flex-row transition-all ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{ transitionDuration: "700ms", transitionDelay: "400ms" }}
            >
              <button
                className="rounded-2xl px-8 py-4 text-base font-bold text-white shadow-lg shadow-teal-500/25 transition-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                style={{ background: "hsl(160, 70%, 45%)" }}
              >
                Start Listening Free
              </button>
              <button className="rounded-2xl border-2 border-gray-200 bg-white px-8 py-4 text-base font-bold text-gray-700 transition-all hover:border-gray-300 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
                See How It Works
              </button>
            </div>
          </div>

          {/* Hero illustration card */}
          <div
            className={`relative mx-auto mt-16 max-w-3xl transition-all ${mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            style={{ transitionDuration: "800ms", transitionDelay: "550ms" }}
          >
            <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white/70 p-3 shadow-2xl shadow-gray-900/5 backdrop-blur">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 to-sky-50 p-6 md:p-10">
                <SpinningRings className="absolute right-4 top-4 w-16 opacity-40" />
                <div className="flex items-start gap-5">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl shadow-md">
                    <img
                      src="https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=128&h=128&fit=crop"
                      alt="Podcast cover art showing a microphone in a studio setting"
                      className="h-full w-full object-cover"
                      width={64}
                      height={64}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">Now Playing</p>
                    <h3 className="mt-1 text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
                      Why Creativity Needs Constraints
                    </h3>
                    <p className="text-sm text-gray-500">The Creative Hour &middot; Episode 42</p>
                    {/* Fake waveform */}
                    <div className="mt-4 flex items-end gap-[3px]" aria-hidden="true">
                      {Array.from({ length: 40 }, (_, i) => {
                        const h = 8 + Math.sin(i * 0.6) * 16 + Math.random() * 10;
                        return (
                          <div
                            key={i}
                            className="w-1 rounded-full"
                            style={{
                              height: `${h}px`,
                              background: i < 18 ? "hsl(160, 70%, 45%)" : "#d1d5db",
                              opacity: i < 18 ? 1 : 0.5,
                            }}
                          />
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-gray-400">12:34 / 32:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Stats ────────────────────────────────────────────────── */}
        <section id="stats" className="mx-auto max-w-5xl px-6 py-16" aria-label="Platform statistics">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="rounded-3xl bg-white/60 p-6 text-center shadow-sm backdrop-blur transition-transform hover:scale-105"
              >
                <p className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
                  {s.value}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Featured Podcasts ──────────────────────────────────── */}
        <section id="featured" className="mx-auto max-w-7xl px-6 py-16" aria-labelledby="featured-heading">
          <div className="mb-12 text-center">
            <h2
              id="featured-heading"
              className="text-3xl font-extrabold text-gray-900 md:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Discover something{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, hsl(280,60%,60%), hsl(340,70%,60%))" }}>
                wonderful
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-gray-500">
              Hand-picked podcasts across every genre. Your next obsession starts here.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {podcasts.map((p) => (
              <article
                key={p.title}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-white/70 p-4 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-lg focus-within:ring-2 focus-within:ring-teal-500"
              >
                <div className={`relative overflow-hidden rounded-2xl ${p.color}`}>
                  <img
                    src={p.img}
                    alt={`Cover art for ${p.title} podcast`}
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    width={400}
                    height={400}
                    loading="lazy"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 backdrop-blur">
                    {p.category}
                  </span>
                </div>
                <div className="mt-4 px-1">
                  <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
                    <a href="#" className="focus:outline-none">
                      {p.title}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">Hosted by {p.host}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ─── Episode Highlights ─────────────────────────────────── */}
        <section id="episodes" className="mx-auto max-w-4xl px-6 py-16" aria-labelledby="episodes-heading">
          <div className="mb-10 text-center">
            <h2
              id="episodes-heading"
              className="text-3xl font-extrabold text-gray-900 md:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Trending this week
            </h2>
            <p className="mx-auto mt-3 max-w-md text-gray-500">
              The episodes everyone is talking about right now.
            </p>
          </div>

          <div className="space-y-4">
            {episodes.map((ep, i) => (
              <article
                key={ep.title}
                className="group flex items-center gap-5 rounded-2xl border border-gray-100 bg-white/70 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold text-white"
                  style={{
                    background: ["hsl(160,70%,45%)", "hsl(280,60%,60%)", "hsl(40,90%,55%)", "hsl(200,80%,55%)"][i],
                  }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
                    {ep.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {ep.podcast} &middot; {ep.duration}
                  </p>
                </div>
                <span className="hidden shrink-0 text-sm text-gray-400 sm:block">{ep.date}</span>
                <button
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-all hover:border-teal-300 hover:text-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  aria-label={`Play ${ep.title}`}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M4 2.5v11l9-5.5z" />
                  </svg>
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* ─── CTA ────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <div
            className="relative overflow-hidden rounded-[2rem] p-10 text-center md:p-16"
            style={{ background: "linear-gradient(135deg, hsl(160,70%,45%), hsl(200,80%,55%))" }}
          >
            <FloatingDots className="pointer-events-none absolute inset-0 w-full opacity-20" />
            <div className="relative z-10">
              <h2
                className="text-3xl font-extrabold text-white md:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ready to transform how you listen?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-teal-50">
                Join thousands of listeners who use AI to get more from every episode.
              </p>
              <button className="mt-8 rounded-2xl bg-white px-8 py-4 text-base font-bold text-teal-700 shadow-lg transition-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-teal-500">
                Get Started for Free
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200/60 bg-white/40 backdrop-blur" role="contentinfo">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-white text-sm font-extrabold"
                  style={{ background: "hsl(160, 70%, 45%)" }}
                  aria-hidden="true"
                >
                  P
                </span>
                <span className="text-lg font-extrabold text-gray-900">Podverse</span>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                AI-powered podcast discovery and transcription.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Product</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-gray-900 focus:outline-none focus-visible:underline">Features</a></li>
                <li><a href="#" className="hover:text-gray-900 focus:outline-none focus-visible:underline">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900 focus:outline-none focus-visible:underline">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Company</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-gray-900 focus:outline-none focus-visible:underline">About</a></li>
                <li><a href="#" className="hover:text-gray-900 focus:outline-none focus-visible:underline">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900 focus:outline-none focus-visible:underline">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Legal</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-gray-900 focus:outline-none focus-visible:underline">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-900 focus:outline-none focus-visible:underline">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-200/60 pt-6 text-center text-sm text-gray-400">
            &copy; 2026 Podverse. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
