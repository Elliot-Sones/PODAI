/* =============================================================
   OMNISCIENT — AI That Understands Every Word
   Proposed app name: "Omniscient"
   ============================================================= */

/* AGENT CLAIMS
   Font pairing: Space Grotesk (display) + JetBrains Mono (mono accents)
   HSL accent primary: 187 94% 43% (electric cyan #06b6d4)
   HSL accent secondary: 263 70% 66% (violet #8b5cf6)
   Background: 240 67% 3% (#050510)
   Animated SVGs: neural-network, data-stream, grid-mesh
   Motion agent: designer-v4
*/

'use client';

import { useEffect, useRef, useState } from 'react';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-jb',
  weight: ['400', '500'],
});

// ---------------------------------------------------------------------------
// Animated SVG: Neural Network Graph
// ---------------------------------------------------------------------------
function NeuralNetworkSVG({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 600"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <radialGradient id="nn-glow-cyan" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nn-glow-violet" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
        <filter id="nn-blur">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* Connection lines with pulse animation */}
      {[
        { x1: 120, y1: 150, x2: 320, y2: 100, dur: '3s', delay: '0s' },
        { x1: 120, y1: 150, x2: 320, y2: 250, dur: '3.5s', delay: '0.2s' },
        { x1: 120, y1: 150, x2: 320, y2: 400, dur: '4s', delay: '0.4s' },
        { x1: 120, y1: 350, x2: 320, y2: 250, dur: '3.2s', delay: '0.6s' },
        { x1: 120, y1: 350, x2: 320, y2: 400, dur: '3.8s', delay: '0.3s' },
        { x1: 120, y1: 350, x2: 320, y2: 100, dur: '4.2s', delay: '0.8s' },
        { x1: 320, y1: 100, x2: 540, y2: 180, dur: '3.3s', delay: '0.1s' },
        { x1: 320, y1: 250, x2: 540, y2: 180, dur: '3.6s', delay: '0.5s' },
        { x1: 320, y1: 250, x2: 540, y2: 380, dur: '4.1s', delay: '0.7s' },
        { x1: 320, y1: 400, x2: 540, y2: 380, dur: '3.4s', delay: '0.9s' },
        { x1: 540, y1: 180, x2: 700, y2: 280, dur: '3.7s', delay: '0.2s' },
        { x1: 540, y1: 380, x2: 700, y2: 280, dur: '4.3s', delay: '0.6s' },
      ].map((line, i) => (
        <line
          key={`line-${i}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#06b6d4"
          strokeWidth="1"
          opacity="0.15"
        >
          <animate
            attributeName="opacity"
            values="0.08;0.35;0.08"
            dur={line.dur}
            begin={line.delay}
            repeatCount="indefinite"
          />
        </line>
      ))}

      {/* Traveling pulses along connections */}
      {[
        { x1: 120, y1: 150, x2: 320, y2: 100, dur: '2.5s', delay: '0s' },
        { x1: 120, y1: 350, x2: 320, y2: 250, dur: '3s', delay: '1s' },
        { x1: 320, y1: 250, x2: 540, y2: 180, dur: '2.8s', delay: '0.5s' },
        { x1: 540, y1: 180, x2: 700, y2: 280, dur: '2.2s', delay: '1.5s' },
        { x1: 320, y1: 400, x2: 540, y2: 380, dur: '3.2s', delay: '2s' },
      ].map((pulse, i) => (
        <circle key={`pulse-${i}`} r="3" fill="#06b6d4" opacity="0" filter="url(#nn-blur)">
          <animate
            attributeName="cx"
            values={`${pulse.x1};${pulse.x2}`}
            dur={pulse.dur}
            begin={pulse.delay}
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values={`${pulse.y1};${pulse.y2}`}
            dur={pulse.dur}
            begin={pulse.delay}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0.8;0"
            dur={pulse.dur}
            begin={pulse.delay}
            repeatCount="indefinite"
          />
        </circle>
      ))}

      {/* Nodes — input layer */}
      {[
        { cx: 120, cy: 150, color: 'cyan' },
        { cx: 120, cy: 350, color: 'cyan' },
      ].map((node, i) => (
        <g key={`input-${i}`}>
          <circle cx={node.cx} cy={node.cy} r="18" fill="url(#nn-glow-cyan)" opacity="0.3">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="4s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={node.cx} cy={node.cy} r="6" fill="#06b6d4">
            <animate attributeName="r" values="5;7;5" dur="3s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      {/* Nodes — hidden layer */}
      {[
        { cx: 320, cy: 100 },
        { cx: 320, cy: 250 },
        { cx: 320, cy: 400 },
      ].map((node, i) => (
        <g key={`hidden1-${i}`}>
          <circle cx={node.cx} cy={node.cy} r="22" fill="url(#nn-glow-violet)" opacity="0.25">
            <animate attributeName="opacity" values="0.15;0.45;0.15" dur="5s" begin={`${i * 0.7}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={node.cx} cy={node.cy} r="7" fill="#8b5cf6">
            <animate attributeName="r" values="6;8;6" dur="4s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      {/* Nodes — hidden layer 2 */}
      {[
        { cx: 540, cy: 180 },
        { cx: 540, cy: 380 },
      ].map((node, i) => (
        <g key={`hidden2-${i}`}>
          <circle cx={node.cx} cy={node.cy} r="20" fill="url(#nn-glow-cyan)" opacity="0.25">
            <animate attributeName="opacity" values="0.15;0.4;0.15" dur="4.5s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={node.cx} cy={node.cy} r="6" fill="#06b6d4">
            <animate attributeName="r" values="5;7;5" dur="3.5s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      {/* Output node */}
      <circle cx={700} cy={280} r="28" fill="url(#nn-glow-violet)" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.55;0.2" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx={700} cy={280} r="9" fill="#8b5cf6">
        <animate attributeName="r" values="8;11;8" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Animated SVG: Data Stream (flowing dots along curved paths)
// ---------------------------------------------------------------------------
function DataStreamSVG({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <path id="stream-path-1" d="M0,100 C100,30 200,170 300,100 C400,30 500,170 600,100" fill="none" />
        <path id="stream-path-2" d="M0,120 C120,50 220,190 340,100 C440,20 520,150 600,80" fill="none" />
        <path id="stream-path-3" d="M0,80 C80,150 180,10 280,100 C380,180 480,40 600,120" fill="none" />
      </defs>

      {/* Faint path lines */}
      <use href="#stream-path-1" stroke="#06b6d4" strokeWidth="0.5" opacity="0.1" />
      <use href="#stream-path-2" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.08" />
      <use href="#stream-path-3" stroke="#06b6d4" strokeWidth="0.5" opacity="0.06" />

      {/* Flowing dots on path 1 */}
      {[0, 1.2, 2.4, 3.6, 4.8].map((delay, i) => (
        <circle key={`s1-${i}`} r="3" fill="#06b6d4" opacity="0">
          <animateMotion dur="6s" begin={`${delay}s`} repeatCount="indefinite">
            <mpath href="#stream-path-1" />
          </animateMotion>
          <animate attributeName="opacity" values="0;0.8;0.8;0" dur="6s" begin={`${delay}s`} repeatCount="indefinite" />
          <animate attributeName="r" values="2;3.5;2" dur="6s" begin={`${delay}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* Flowing dots on path 2 */}
      {[0.3, 1.8, 3.3].map((delay, i) => (
        <circle key={`s2-${i}`} r="2.5" fill="#8b5cf6" opacity="0">
          <animateMotion dur="7s" begin={`${delay}s`} repeatCount="indefinite">
            <mpath href="#stream-path-2" />
          </animateMotion>
          <animate attributeName="opacity" values="0;0.7;0.7;0" dur="7s" begin={`${delay}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* Flowing dots on path 3 */}
      {[0.6, 2.1, 4.1].map((delay, i) => (
        <circle key={`s3-${i}`} r="2" fill="#06b6d4" opacity="0">
          <animateMotion dur="8s" begin={`${delay}s`} repeatCount="indefinite">
            <mpath href="#stream-path-3" />
          </animateMotion>
          <animate attributeName="opacity" values="0;0.5;0.5;0" dur="8s" begin={`${delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Animated SVG: Grid Mesh Background
// ---------------------------------------------------------------------------
function GridMeshSVG({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 800"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="presentation"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="grid-fade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.06" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines */}
      {Array.from({ length: 17 }, (_, i) => (
        <line
          key={`h-${i}`}
          x1="0"
          y1={i * 50}
          x2="1200"
          y2={i * 50}
          stroke="url(#grid-fade)"
          strokeWidth="0.5"
        >
          <animate
            attributeName="opacity"
            values="0.3;0.6;0.3"
            dur={`${8 + i * 0.3}s`}
            repeatCount="indefinite"
          />
        </line>
      ))}

      {/* Vertical grid lines */}
      {Array.from({ length: 25 }, (_, i) => (
        <line
          key={`v-${i}`}
          x1={i * 50}
          y1="0"
          x2={i * 50}
          y2="800"
          stroke="url(#grid-fade)"
          strokeWidth="0.5"
        >
          <animate
            attributeName="opacity"
            values="0.2;0.5;0.2"
            dur={`${9 + i * 0.2}s`}
            repeatCount="indefinite"
          />
        </line>
      ))}

      {/* Intersection glow points */}
      {[
        { cx: 200, cy: 150, dur: '5s', delay: '0s' },
        { cx: 500, cy: 300, dur: '6s', delay: '1s' },
        { cx: 800, cy: 200, dur: '7s', delay: '2s' },
        { cx: 350, cy: 500, dur: '5.5s', delay: '0.5s' },
        { cx: 950, cy: 450, dur: '6.5s', delay: '1.5s' },
        { cx: 600, cy: 600, dur: '4.5s', delay: '3s' },
        { cx: 100, cy: 400, dur: '5.8s', delay: '0.8s' },
        { cx: 1050, cy: 150, dur: '7.2s', delay: '2.2s' },
      ].map((pt, i) => (
        <circle key={`glow-${i}`} cx={pt.cx} cy={pt.cy} r="1.5" fill={i % 2 === 0 ? '#06b6d4' : '#8b5cf6'}>
          <animate
            attributeName="r"
            values="1;4;1"
            dur={pt.dur}
            begin={pt.delay}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.2;0.7;0.2"
            dur={pt.dur}
            begin={pt.delay}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Animated counter hook
// ---------------------------------------------------------------------------
function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (prefersReduced) {
            setCount(target);
            return;
          }
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// ---------------------------------------------------------------------------
// Glass Card component
// ---------------------------------------------------------------------------
function GlassCard({
  children,
  className = '',
  glowColor = 'cyan',
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'violet';
}) {
  const borderColor = glowColor === 'cyan' ? 'border-cyan-500/20' : 'border-violet-500/20';
  const hoverBorder = glowColor === 'cyan' ? 'hover:border-cyan-400/40' : 'hover:border-violet-400/40';
  const hoverShadow =
    glowColor === 'cyan'
      ? 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]'
      : 'hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]';

  return (
    <div
      className={`
        group relative rounded-2xl border ${borderColor} ${hoverBorder}
        bg-white/[0.03] backdrop-blur-xl
        transition-all duration-500
        ${hoverShadow}
        hover:bg-white/[0.06]
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature icon components
// ---------------------------------------------------------------------------
function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="#06b6d4" strokeWidth="1.5" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
      />
    </svg>
  );
}

function TranscriptIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="#8b5cf6" strokeWidth="1.5" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

function TopicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="#06b6d4" strokeWidth="1.5" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  );
}

function SummaryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="#8b5cf6" strokeWidth="1.5" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function RedesignV4Page() {
  const episodes = useAnimatedCounter(12847);
  const podcasts = useAnimatedCounter(463);
  const topics = useAnimatedCounter(8921);
  const queries = useAnimatedCounter(51204);

  return (
    <div
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} relative min-h-screen overflow-hidden`}
      style={{ backgroundColor: '#050510', color: '#e2e8f0' }}
    >
      {/* ---- Reduced motion styles ---- */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          svg animate,
          svg animateMotion,
          svg animateTransform {
            animation: none !important;
          }
          .motion-animate {
            animation: none !important;
            transition: none !important;
          }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.3), 0 0 60px rgba(6, 182, 212, 0.1); }
          50% { box-shadow: 0 0 30px rgba(6, 182, 212, 0.5), 0 0 80px rgba(6, 182, 212, 0.2); }
        }
        @keyframes neon-line {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      {/* ---- Grid mesh background (full page) ---- */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <GridMeshSVG className="h-full w-full opacity-60" />
      </div>

      {/* ---- Ambient gradient blobs ---- */}
      <div
        className="motion-animate pointer-events-none fixed left-1/4 top-1/4 z-0 h-[600px] w-[600px] rounded-full opacity-20 blur-[150px]"
        style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', animation: 'float-slow 12s ease-in-out infinite' }}
      />
      <div
        className="motion-animate pointer-events-none fixed right-1/4 bottom-1/4 z-0 h-[500px] w-[500px] rounded-full opacity-15 blur-[150px]"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', animation: 'float-slow 15s ease-in-out infinite 3s' }}
      />

      {/* ================================================================== */}
      {/* HERO SECTION */}
      {/* ================================================================== */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        {/* Neural network behind hero text */}
        <div className="motion-animate absolute inset-0 flex items-center justify-center opacity-40" style={{ animation: 'float-slow 20s ease-in-out infinite' }}>
          <NeuralNetworkSVG className="h-auto w-full max-w-4xl" />
        </div>

        <div className="relative z-10">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-cyan-400" style={{ animation: 'glow-pulse 2s ease-in-out infinite' }} />
            <span className="font-[family-name:var(--font-mono-jb)] text-xs tracking-wider text-cyan-300">
              NEURAL AUDIO INTELLIGENCE
            </span>
          </div>

          {/* App name */}
          <h1 className="font-[family-name:var(--font-space)] text-6xl font-bold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
            <span className="bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent">
              Omniscient
            </span>
          </h1>

          {/* Tagline */}
          <p className="mx-auto mt-6 max-w-xl font-[family-name:var(--font-space)] text-lg text-slate-400 sm:text-xl">
            AI that understands every word.
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-500">
            Search across transcripts, discover hidden topics, and chat with any episode.
            Every podcast, fully understood.
          </p>

          {/* Data stream decoration */}
          <div className="mx-auto mt-8 max-w-xl">
            <DataStreamSVG className="h-auto w-full opacity-70" />
          </div>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="/explore"
              className="motion-animate group relative inline-flex items-center gap-2 rounded-xl px-8 py-3.5 font-[family-name:var(--font-space)] font-semibold text-white transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                animation: 'glow-pulse 3s ease-in-out infinite',
              }}
              aria-label="Start exploring podcasts"
            >
              <span>Explore Podcasts</span>
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <a
              href="/topics"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 font-[family-name:var(--font-space)] font-medium text-slate-300 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/5 hover:text-white"
              aria-label="Search topics across podcasts"
            >
              Search Topics
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="motion-animate absolute bottom-8 left-1/2 -translate-x-1/2" style={{ animation: 'float-slow 3s ease-in-out infinite' }}>
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <span className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-[0.2em]">Scroll</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* AI FEATURES SHOWCASE */}
      {/* ================================================================== */}
      <section className="relative z-10 px-4 py-24" aria-labelledby="features-heading">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="font-[family-name:var(--font-mono-jb)] text-xs uppercase tracking-[0.25em] text-cyan-400">
              Capabilities
            </p>
            <h2
              id="features-heading"
              className="mt-3 font-[family-name:var(--font-space)] text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            >
              Intelligence at every layer
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-slate-500">
              Every episode is processed through multiple AI systems to extract meaning, context, and connections.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Chat */}
            <GlassCard className="p-8" glowColor="cyan">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                <ChatIcon />
              </div>
              <h3 className="font-[family-name:var(--font-space)] text-xl font-semibold text-white">
                AI Chat
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Ask anything about any episode. Our RAG-powered AI retrieves the exact moments and delivers answers with timestamped citations.
              </p>
              <div className="mt-6 rounded-lg border border-cyan-500/10 bg-cyan-500/[0.03] p-3">
                <p className="font-[family-name:var(--font-mono-jb)] text-xs text-cyan-300/70">
                  &gt; &quot;What did they say about scaling AI infrastructure?&quot;
                </p>
              </div>
            </GlassCard>

            {/* Transcripts */}
            <GlassCard className="p-8" glowColor="violet">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
                <TranscriptIcon />
              </div>
              <h3 className="font-[family-name:var(--font-space)] text-xl font-semibold text-white">
                Full Transcripts
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Word-level transcription with speaker identification. Click any sentence to jump to that exact moment in the audio.
              </p>
              <div className="mt-6 flex gap-2">
                {['Speaker A', 'Speaker B'].map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-1 font-[family-name:var(--font-mono-jb)] text-[10px] text-violet-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </GlassCard>

            {/* Topics */}
            <GlassCard className="p-8" glowColor="cyan">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                <TopicIcon />
              </div>
              <h3 className="font-[family-name:var(--font-space)] text-xl font-semibold text-white">
                Topic Extraction
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                AI identifies key topics in every episode and links them across your entire podcast library. Discover unexpected connections.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Machine Learning', 'Startups', 'Ethics', 'Infrastructure'].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-cyan-500/15 bg-cyan-500/[0.06] px-3 py-1 text-xs text-cyan-300/80"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </GlassCard>

            {/* Summaries */}
            <GlassCard className="p-8" glowColor="violet">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
                <SummaryIcon />
              </div>
              <h3 className="font-[family-name:var(--font-space)] text-xl font-semibold text-white">
                AI Summaries
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Get the key insights in seconds. Each episode is distilled into structured summaries with key takeaways and notable quotes.
              </p>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="motion-animate h-full rounded-full"
                  style={{
                    width: '75%',
                    background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                    backgroundSize: '200% 100%',
                    animation: 'neon-line 3s linear infinite',
                  }}
                />
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* PODCAST DISCOVERY */}
      {/* ================================================================== */}
      <section className="relative z-10 px-4 py-24" aria-labelledby="discover-heading">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="font-[family-name:var(--font-mono-jb)] text-xs uppercase tracking-[0.25em] text-violet-400">
              Discovery
            </p>
            <h2
              id="discover-heading"
              className="mt-3 font-[family-name:var(--font-space)] text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Your next favorite podcast
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {[
              { name: 'Tech Frontiers', cat: 'Technology', color: 'cyan' },
              { name: 'Mind & Body', cat: 'Health', color: 'violet' },
              { name: 'Startup Stories', cat: 'Business', color: 'cyan' },
              { name: 'Deep Dives', cat: 'Science', color: 'violet' },
              { name: 'Creative Pulse', cat: 'Arts', color: 'cyan' },
              { name: 'Policy Lab', cat: 'Politics', color: 'violet' },
              { name: 'The Debug Log', cat: 'Engineering', color: 'cyan' },
              { name: 'Future Proof', cat: 'Innovation', color: 'violet' },
            ].map((podcast) => (
              <GlassCard key={podcast.name} className="flex flex-col items-center p-6 text-center" glowColor={podcast.color as 'cyan' | 'violet'}>
                {/* Placeholder art */}
                <div
                  className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl"
                  style={{
                    background:
                      podcast.color === 'cyan'
                        ? 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05))'
                        : 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))',
                    border: `1px solid ${podcast.color === 'cyan' ? 'rgba(6,182,212,0.2)' : 'rgba(139,92,246,0.2)'}`,
                  }}
                >
                  <svg className="h-8 w-8 opacity-40" viewBox="0 0 24 24" fill="none" stroke={podcast.color === 'cyan' ? '#06b6d4' : '#8b5cf6'} strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-space)] text-sm font-semibold text-white">
                  {podcast.name}
                </h3>
                <p className="mt-1 font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-slate-500">
                  {podcast.cat}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* LIVE STATS */}
      {/* ================================================================== */}
      <section className="relative z-10 px-4 py-24" aria-labelledby="stats-heading">
        <div className="mx-auto max-w-5xl">
          <h2 id="stats-heading" className="sr-only">Platform statistics</h2>

          {/* Neon divider */}
          <div
            className="motion-animate mx-auto mb-16 h-px w-48"
            style={{
              background: 'linear-gradient(90deg, transparent, #06b6d4, #8b5cf6, transparent)',
              backgroundSize: '200% 100%',
              animation: 'neon-line 4s linear infinite',
            }}
          />

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: 'Episodes Processed', counter: episodes, suffix: '+' },
              { label: 'Podcasts Indexed', counter: podcasts, suffix: '' },
              { label: 'Topics Discovered', counter: topics, suffix: '+' },
              { label: 'AI Queries Served', counter: queries, suffix: '+' },
            ].map((stat) => (
              <div key={stat.label} ref={stat.counter.ref} className="text-center">
                <p className="font-[family-name:var(--font-space)] text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                  <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                    {stat.counter.count.toLocaleString()}
                    {stat.suffix}
                  </span>
                </p>
                <p className="mt-2 font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CTA */}
      {/* ================================================================== */}
      <section className="relative z-10 px-4 py-32" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="cta-heading"
            className="font-[family-name:var(--font-space)] text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
          >
            Ready to hear what AI hears?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-slate-500">
            Add your favorite podcast and let Omniscient process every episode. Transcripts, topics, summaries, and chat in minutes.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="/request"
              className="motion-animate group relative inline-flex items-center gap-2 rounded-xl px-10 py-4 font-[family-name:var(--font-space)] text-lg font-semibold text-white transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                animation: 'glow-pulse 3s ease-in-out infinite',
              }}
              aria-label="Add a podcast to Omniscient"
            >
              Add a Podcast
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </a>
          </div>

          {/* Bottom data stream */}
          <div className="mx-auto mt-16 max-w-lg opacity-40">
            <DataStreamSVG className="h-auto w-full" />
          </div>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-16" />
    </div>
  );
}
