import { Link, useParams } from "react-router-dom"

const C = {
  bg: "#0a0e17",
  bg_subtle: "#0d1120",
  text: "#c5cad8",
  muted: "#4a5680",
  heading: "#dce0ee",
  accent: "#6b8acc",
  border: "rgba(80, 110, 170, 0.08)",
} as const

type Post = { slug: string; title: string; date: string; summary: string; content: string[] }

const POSTS: Post[] = [
  {
    slug: "hello-world",
    title: "hello world",
    date: "2026-03-03",
    summary: "first post — more to come.",
    content: [
      "this is the first post on this blog. i've been meaning to start writing things down for a while now: thoughts on projects, things i've learned, stuff i find interesting.",
      "i'll be writing about luau, rust, low-level programming, and whatever else i'm working on at the time. expect posts about parsers, virtual machines.",
      "more to come. stay tuned.",
    ],
  },
]

function Post_Card({ slug, title, date, summary }: Omit<Post, "content">) {
  return (
    <Link to={`/${slug}`} className="block">
      <article
        className="px-5 py-4 rounded-lg transition-all duration-200 hover:brightness-125 cursor-pointer"
        style={{ background: C.bg_subtle, border: `1px solid ${C.border}` }}
      >
        <h3 className="text-lg font-semibold" style={{ color: C.heading }}>{title}</h3>
        <time className="text-xs font-mono block mt-1" style={{ color: C.muted }}>{date}</time>
        <p className="mt-2 text-sm" style={{ color: C.text }}>{summary}</p>
      </article>
    </Link>
  )
}

function Post_View({ post }: { post: Post }) {
  return (
    <>
      <Link
        to="/"
        className="text-sm font-mono transition-colors duration-200 hover:underline"
        style={{ color: C.accent }}
      >
        &lt;-- blog
      </Link>
      <article className="mt-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: C.heading }}>{post.title}</h1>
        <time className="text-xs font-mono block mt-2" style={{ color: C.muted }}>{post.date}</time>
        <div className="mt-6 space-y-4">
          {post.content.map((p, i) => (
            <p key={i} className="text-sm sm:text-base leading-relaxed" style={{ color: C.text }}>{p}</p>
          ))}
        </div>
      </article>
    </>
  )
}

function Blog_List() {
  return (
    <>
      <header className="mb-10">
        <a
          href="https://jiface.com"
          className="text-sm font-mono transition-colors duration-200 hover:underline"
          style={{ color: C.accent }}
        >
          &lt;-- jiface
        </a>
        <h1 className="text-3xl sm:text-4xl font-bold mt-4 tracking-tight" style={{ color: C.heading }}>blog</h1>
        <p className="mt-2 text-sm" style={{ color: C.muted }}>thoughts, notes, and things i've learned</p>
      </header>
      <div className="space-y-4">
        {POSTS.length > 0
          ? POSTS.map((p) => <Post_Card key={p.slug} slug={p.slug} title={p.title} date={p.date} summary={p.summary} />)
          : <p className="text-sm" style={{ color: C.muted }}>nothing here yet.</p>
        }
      </div>
    </>
  )
}

export default function Blog() {
  const { slug } = useParams()
  const post = slug ? POSTS.find((p) => p.slug === slug) : null

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text }}>
      <div className="max-w-xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
        {post ? <Post_View post={post} /> : <Blog_List />}
      </div>
    </div>
  )
}
