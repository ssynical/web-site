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
  {
    slug: "koralys-typeinfo",
    title: "displaying typeinfo in koralys",
    date: "2026-03-04",
    summary: "parsing luau's typeinfo blob and showing type annotations in disassembled output.",
    content: [
      "luau bytecode has had type information baked into it since bytecode version 4. every function proto can carry a typeinfo blob; a compact encoding of parameter types, upvalue types, and typed local variables. the compiler emits this when optimization level is >= 2 or when typeInfoLevel is set. koralys was already deserializing these bytes and storing them, but never actually displaying them. that changed today.",
      "the typeinfo blob layout (types version 3) looks like this:",
      "| field              | encoding       | description                                    |",
      "| sizeTypeinfo       | varint         | length of function signature bytes              |",
      "| sizeTypedUpvals    | varint         | count of typed upvalues                         |",
      "| sizeTypedLocals    | varint         | count of typed locals                           |",
      "| signature bytes    | raw bytes      | [LBC_TYPE_FUNCTION, numParams, paramType1, ...] |",
      "| upvalue types      | 1 byte each    | one LuauBytecodeType per upvalue                |",
      "| typed locals       | type,reg,pc,pc | type byte, register, startpc, endpc delta       |",
      "each type is a single byte. bit 7 (0x80) marks it as optional/nullable. the low 7 bits map to: 0=nil, 1=boolean, 2=number, 3=string, 4=table, 5=function, 6=thread, 7=userdata, 8=vector, 9=buffer, 15=any. values 64..95 are tagged userdata subtypes.",
      "the implementation adds three helpers: decode_type_byte() converts a raw byte -> a readable string like 'boolean?' or 'number'. _read_varint_from_blob() parses varints from within the byte list. parse_type_info() decodes the full blob into structured data (signature, typed upvals, typed locals).",
      "before and after, using this source compiled with -O2 -g2:",
      "local function add(a: number, b: number): number ... end",
      "local function greet(name: string, loud: boolean?): string ... end",
      "local function process(tbl: {string}, callback: (string) -> number): number ... end",
      "before (add):",
      "function(a, b)  |  [000] ADD R2 = R0 + R1  |  [001] RETURN return R2  |  end",
      "after (add):",
      "function(a: number, b: number)  |  [000] ADD R2 = R0 + R1  |  [001] RETURN return R2  |  end  |  --< Type Info >--  |  signature: (a: number, b: number)",
      "before (greet):",
      "function(name, loud)",
      "after (greet):",
      "function(name: string, loud: boolean?)  |  --< Type Info >--  |  signature: (name: string, loud: boolean?)",
      "before (process):",
      "function(tbl, callback)",
      "after (process):",
      "function(tbl: table, callback: function)  |  --< Type Info >--  |  signature: (tbl: table, callback: function)",
      "types show up in two places: inline in the function signature (so you see them at a glance), and in a dedicated --< Type Info >-- section at the bottom of each proto (for the full breakdown including upvalue and local types).",
      "the typeinfo parsing adds effectively zero overhead. parse_type_info() itself takes ~2.5 microseconds per proto with a signature, and 0.11 microseconds for empty blobs. the overhead is lost in the noise of instruction disassembly.",
      "files compiled without type annotations (O0 or O1) produce no extra output and no crashes. the feature is purely additive.",
      "next up: fixing the read_proto_source off by one in the v5 deserializer, and continuing the audit.",
      "that's all for this blog post folks. don't forget to brush your teeth"
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
