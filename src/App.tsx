import { useEffect, useRef, useState } from "react"
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
  { name: "runluau-renderer", desc: "a renderer made in luau", href: "https://github.com/ssynical/renderer" },
  { name: "koralys", desc: "luau decompiler & disassembler", href: "https://github.com/focat69/koralys" },
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

const BADGE_TARGETS = ["https://vft.rip", "https://mambo.pet"] as const // :)

const random_badge_href = () => BADGE_TARGETS[Math.floor(Math.random() * BADGE_TARGETS.length)]

const BADGES = [
  "/me.gif", "/yourad.gif", "/yourad.gif",
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

const DISCORD_ID = "1460413830394937477"

type LanyardActivity = {
  name: string
  details?: string
  state?: string
  type: number
  assets?: { large_image?: string; large_url?: string; small_image?: string }
  timestamps?: { start?: number; end?: number }
  application_id?: string
}

type LanyardData = {
  discord_status: "online" | "idle" | "dnd" | "offline"
  discord_user: { avatar: string; display_name: string; username: string; id: string }
  activities: LanyardActivity[]
  listening_to_spotify: boolean
  spotify: {
    track_id: string
    song: string
    artist: string
    album: string
    album_art_url: string
    timestamps: { start: number; end: number }
  } | null
}

const STATUS_COLORS: Record<string, string> = {
  online: "#3ba55d",
  idle: "#faa81a",
  dnd: "#ed4245",
  offline: "#747f8d",
}

function use_lanyard(): LanyardData | null {
  const [data, set_data] = useState<LanyardData | null>(null)
  useEffect(() => {
    let alive = true
    const poll = async () => {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`)
        const json = await res.json()
        if (alive && json.success) set_data(json.data)
      } catch { /* silent :shushing_face: */ }
    }
    poll()
    const id = setInterval(poll, 30_000)
    return () => { alive = false; clearInterval(id) }
  }, [])
  return data
}

function format_elapsed(start: number): string {
  const diff = Math.floor((Date.now() - start) / 1000)
  const m = Math.floor(diff / 60)
  const s = diff % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

function Presence() {
  const data = use_lanyard()
  const [, set_tick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => set_tick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  if (!data) return null

  const status = data.discord_status
  const activity = data.activities.find((a) => a.type === 0)
  const listening = data.activities.find((a) => a.type === 2)
  const spotify = data.spotify

  const has_content = status !== "offline" || activity || listening || spotify
  if (!has_content) return null

  const resolve_art = (img?: string): string | null => {
    if (!img) return null
    if (img.startsWith("mp:external/")) return `https://media.discordapp.net/${img.replace("mp:", "")}`
    return null
  }

  return (
    <section className="mb-10">
      <div
        className="rounded-lg p-4 flex flex-col gap-3"
        style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glass_border}` }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: STATUS_COLORS[status] ?? STATUS_COLORS.offline }}
          />
          <span className="text-xs font-mono" style={{ color: C.muted }}>
            {status === "dnd" ? "do not disturb" : status}
          </span>
        </div>

        {spotify && (
          <div className="flex items-center gap-3">
            <img
              src={spotify.album_art_url}
              alt={spotify.album}
              width={48}
              height={48}
              className="rounded flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate" style={{ color: C.heading }}>{spotify.song}</p>
              <p className="text-xs truncate" style={{ color: C.muted }}>{spotify.artist}</p>
              {spotify.timestamps && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        background: C.accent,
                        width: `${Math.min(100, ((Date.now() - spotify.timestamps.start) / (spotify.timestamps.end - spotify.timestamps.start)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono flex-shrink-0" style={{ color: C.muted }}>
                    {format_elapsed(spotify.timestamps.start)}
                  </span>
                </div>
              )}
            </div>
            <svg viewBox="0 0 24 24" width={16} height={16} className="flex-shrink-0" style={{ fill: "#1db954" }}>
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>
        )}

        {!spotify && listening && (
          <div className="flex items-center gap-3">
            {resolve_art(listening.assets?.large_image) && (
              <img
                src={resolve_art(listening.assets?.large_image)!}
                alt={listening.name}
                width={48}
                height={48}
                className="rounded flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-mono mb-0.5" style={{ color: C.muted }}>listening on {listening.name.toLowerCase()}</p>
              {listening.details && <p className="text-sm font-semibold truncate" style={{ color: C.heading }}>{listening.details}</p>}
              {listening.state && <p className="text-xs truncate" style={{ color: C.muted }}>{listening.state}</p>}
              {listening.timestamps?.start && (
                <div className="mt-1.5 flex items-center gap-2">
                  {listening.timestamps.end ? (
                    <>
                      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            background: C.accent,
                            width: `${Math.min(100, ((Date.now() - listening.timestamps.start) / (listening.timestamps.end - listening.timestamps.start)) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono flex-shrink-0" style={{ color: C.muted }}>
                        {format_elapsed(listening.timestamps.start)}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] font-mono" style={{ color: C.muted }}>
                      {format_elapsed(listening.timestamps.start)} elapsed
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activity && (
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="text-xs font-mono mb-0.5" style={{ color: C.muted }}>playing</p>
              <p className="text-sm font-semibold truncate" style={{ color: C.heading }}>{activity.name}</p>
              {activity.details && <p className="text-xs truncate" style={{ color: C.muted }}>{activity.details}</p>}
              {activity.state && <p className="text-xs truncate" style={{ color: C.muted }}>{activity.state}</p>}
            </div>
          </div>
        )}
      </div>
    </section>
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

            <Presence />

            <section>
              <a
                href="https://blog.jiface.com"
                className="text-sm font-mono transition-colors duration-200 hover:underline"
                style={{ color: C.accent }}
              >
                blog --&gt;
              </a>
            </section>
          </main>
        </Glass_Panel>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-1">
          {BADGES.map((src, i) => {
            const is_me = src === "/me.gif"
            return is_me ? (
              <a key={i} href={random_badge_href()} target="_blank" rel="noopener noreferrer">
                <img src={src} alt="badge" width={88} height={31} className="block transition-opacity hover:opacity-80" style={{ imageRendering: "pixelated" }} />
              </a>
            ) : (
              <img key={i} src={src} alt="badge" width={88} height={31} className="block" style={{ imageRendering: "pixelated" }} />
            )
          })}
        </div>

        <a
          href="https://ipv6.he.net/"
          target="_blank"
          rel="noopener noreferrer"
          title="I'm IPv6 certified!"
          className="mt-4 block transition-opacity hover:opacity-80"
        >
          <img
            src="//ipv6.he.net/certification/create_badge.php?pass_name=jiface&badge=1"
            alt="IPv6 Certification Badge for jiface"
            width={128}
            height={128}
            style={{ border: 0 }}
          />
        </a>
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
