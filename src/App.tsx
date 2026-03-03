import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import "./App.css"

const C = {
  bg_start: "#141e35",
  bg_end: "#070a12",
  text: "#c5cad8",
  muted: "#4a5680",
  heading: "#dce0ee",
  accent: "#6b8acc",
  code_bg: "rgba(80, 110, 170, 0.08)",
  code_border: "rgba(80, 110, 170, 0.06)",
  code_text: "#8aa4d6",
  glass_bg: "rgba(255, 255, 255, 0.06)",
  glass_highlight: "rgba(255, 255, 255, 0.12)",
  glass_border: "rgba(255, 255, 255, 0.08)",
} as const

type Star = { x: number; y: number }

const gen_stars = (n: number, spread: number): Star[] =>
  Array.from({ length: n }, () => ({
    x: Math.floor(Math.random() * spread),
    y: Math.floor(Math.random() * spread),
  }))

const stars_shadow = (stars: Star[]): string =>
  stars.map(({ x, y }) => `${x}px ${y}px #fff`).join(",")

const WORK = [
  { name: "runluau-renderer", desc: "a renderer made in luau", href: "https://github.com/ssynical/runluau-renderer" },
  { name: "koralys", desc: "luau decompiler & disassembler", href: "https://github.com/ssynical/koralys" },
  { name: "yotsuba", desc: "rv32ima virtual machine for esp32", href: null },
  { name: "iptv", desc: "iptv streaming backend", href: "https://github.com/ssynical/iptv" },
] as const

const STACK = [
  "javascript", "typescript", "python", "react", "node.js",
  "docker", "aws", "luau", "c++", "c",
] as const

const LINKS = [
  { label: "github", href: "https://github.com/ssynical" },
  { label: "telegram", href: "https://t.me/jiface" },
  { label: "signal", href: "https://signal.me/#p/+jif.02" },
  { label: "discord", href: "https://discord.com/users/1460413830394937477" },
] as const

const BADGES = [
  "/yourad.gif", "/yourad.gif", "/yourad.gif",
  "/yourad.gif", "/yourad.gif", "/yourad.gif",
] as const

function Star_Layer({ size, count, duration }: { size: number; count: number; duration: number }) {
  const shadow = useRef(stars_shadow(gen_stars(count, 2000)))
  return (
    <div
      className="fixed top-0 left-0 pointer-events-none"
      style={{
        width: size,
        height: size,
        background: "transparent",
        boxShadow: shadow.current,
        animation: `star_drift ${duration}s linear infinite`,
      }}
    />
  )
}

function Glass_Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        borderRadius: "1.25rem",
        boxShadow: "0 0 0 1px rgba(107, 138, 204, 0.15), 0 0 30px rgba(107, 138, 204, 0.04)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(16px) saturate(120%) brightness(1.1)",
          WebkitBackdropFilter: "blur(16px) saturate(120%) brightness(1.1)",
          borderRadius: "inherit",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: C.glass_bg, borderRadius: "inherit" }}
      />
      <div
        className="absolute inset-0"
        style={{
          borderRadius: "inherit",
          boxShadow: `inset 1px 1px 0 ${C.glass_highlight}, inset 0 0 8px rgba(255,255,255,0.05)`,
          border: `1px solid ${C.glass_border}`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="px-1.5 py-0.5 rounded font-mono"
      style={{
        fontSize: "inherit",
        lineHeight: "inherit",
        background: C.code_bg,
        border: `1px solid ${C.code_border}`,
        color: C.code_text,
      }}
    >
      {children}
    </code>
  )
}

export default function App() {
  useEffect(() => {
    const s = document.createElement("style")
    s.textContent = `
      @keyframes star_drift {
        from { transform: translateY(0) }
        to { transform: translateY(-2000px) }
      }
    `
    document.head.appendChild(s)
    return () => { document.head.removeChild(s) }
  }, [])

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: `radial-gradient(ellipse at bottom, ${C.bg_start} 0%, ${C.bg_end} 100%)` }}
    >
      <Star_Layer size={1} count={200} duration={100} />
      <Star_Layer size={2} count={100} duration={200} />
      <Star_Layer size={3} count={50} duration={300} />

      <div
        className="fixed top-0 right-0 w-1/2 h-1/2 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top right, rgba(60, 90, 160, 0.04) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 py-12 sm:py-20">
        <Glass_Panel className="w-full max-w-xl">
          <main className="px-5 py-8 sm:px-10 sm:py-10" style={{ color: C.text }}>
            <section className="mb-10">
              <p className="text-base sm:text-lg mb-1" style={{ color: C.muted }}>hi, i'm</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: C.heading }}>jiface <span className="text-lg sm:text-xl font-normal" style={{ color: C.muted }}>(he/him)</span></h2>
              <p className="mt-3 text-base" style={{ color: C.muted }}>making things that work</p>
              <hr className="my-4 border-0 h-px" style={{ background: C.glass_border }} />
              <p className="text-sm" style={{ color: C.muted }}>
                currently working on <Code>luaparse</Code> and learning <Code>rust</Code>
              </p>
            </section>

            <section className="mb-10">
              <h3 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: C.muted }}>work</h3>
              <div className="space-y-2 sm:space-y-2.5 font-mono text-sm sm:text-base">
                {WORK.map(({ name, desc, href }) => (
                  <div key={name} className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3">
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: C.accent }}>{name}</a>
                    ) : (
                      <span style={{ color: C.accent }}>{name}</span>
                    )}
                    <span style={{ color: C.muted }} className="hidden sm:inline text-sm">—</span>
                    <span style={{ color: C.muted }} className="text-xs sm:text-sm">{desc}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-10">
              <h3 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: C.muted }}>stack</h3>
              <div className="flex flex-wrap gap-2">
                {STACK.map((t) => <Code key={t}>{t}</Code>)}
              </div>
            </section>

            <section className="mb-10">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm sm:text-base font-mono">
                {LINKS.map(({ label, href }, i) => (
                  <span key={label} className="flex items-center gap-3 sm:gap-4">
                    {i > 0 && <span style={{ color: C.muted }}>/</span>}
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold transition-colors duration-200 hover:underline"
                      style={{ color: C.accent }}
                    >
                      {label}
                    </a>
                  </span>
                ))}
              </div>
            </section>

            <section>
              <Link
                to="/blog"
                className="text-sm font-mono transition-colors duration-200 hover:underline"
                style={{ color: C.accent }}
              >
                blog --&gt;
              </Link>
            </section>
          </main>
        </Glass_Panel>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-1">
          {BADGES.map((src, i) => (
            <img key={i} src={src} alt="badge" width={88} height={31} className="block" style={{ imageRendering: "pixelated" }} />
          ))}
        </div>
      </div>

      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
        <filter id="lens_filter" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
          <feComponentTransfer in="SourceAlpha" result="alpha">
            <feFuncA type="identity" />
          </feComponentTransfer>
          <feGaussianBlur in="alpha" stdDeviation="50" result="blur" />
          <feDisplacementMap in="SourceGraphic" in2="blur" scale="50" xChannelSelector="A" yChannelSelector="A" />
        </filter>
      </svg>
    </div>
  )
}
