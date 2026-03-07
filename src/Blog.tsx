import { Link, useParams } from "react-router-dom"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Components } from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"

const C = {
  bg: "#0a0e17",
  bg_subtle: "#0d1120",
  text: "#c5cad8",
  muted: "#4a5680",
  heading: "#dce0ee",
  accent: "#6b8acc",
  border: "rgba(80, 110, 170, 0.08)",
  code_bg: "rgba(80, 110, 170, 0.12)",
  code_border: "rgba(80, 110, 170, 0.15)",
  code_text: "#8aa4d6",
} as const

const site_theme: Record<string, React.CSSProperties> = {
  'code[class*="language-"]': { color: "#c5cad8", background: "none", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: "0.875rem", lineHeight: "1.6", textAlign: "left", whiteSpace: "pre", wordSpacing: "normal", wordBreak: "normal", tabSize: 2, hyphens: "none" },
  'pre[class*="language-"]': { color: "#c5cad8", background: "#0d1120", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: "0.875rem", lineHeight: "1.6", textAlign: "left", whiteSpace: "pre", wordSpacing: "normal", wordBreak: "normal", tabSize: 2, hyphens: "none", padding: "1rem", margin: "0", overflow: "auto", borderRadius: "0.5rem" },
  comment: { color: "#4a5680", fontStyle: "italic" },
  prolog: { color: "#4a5680" },
  doctype: { color: "#4a5680" },
  cdata: { color: "#4a5680" },
  punctuation: { color: "#6b7a9e" },
  property: { color: "#8aa4d6" },
  tag: { color: "#8aa4d6" },
  boolean: { color: "#d4a0e0" },
  number: { color: "#d4a0e0" },
  constant: { color: "#d4a0e0" },
  symbol: { color: "#d4a0e0" },
  selector: { color: "#a3d6a0" },
  "attr-name": { color: "#a3d6a0" },
  string: { color: "#a3d6a0" },
  char: { color: "#a3d6a0" },
  builtin: { color: "#a3d6a0" },
  inserted: { color: "#a3d6a0" },
  operator: { color: "#c5cad8" },
  entity: { color: "#c5cad8", cursor: "help" },
  url: { color: "#c5cad8" },
  "attr-value": { color: "#a3d6a0" },
  keyword: { color: "#6b8acc" },
  function: { color: "#dce0ee" },
  "class-name": { color: "#dce0ee" },
  regex: { color: "#e0c090" },
  important: { color: "#e0c090", fontWeight: "bold" },
  variable: { color: "#c5cad8" },
  deleted: { color: "#e07070" },
}

type Post = { slug: string; title: string; date: string; summary: string; content: string }

const POSTS: Post[] = [
  {
    slug: "hello-world",
    title: "hello world",
    date: "2026-03-03",
    summary: "first post — more to come.",
    content: `this is the first post on this blog. i've been meaning to start writing things down for a while now: thoughts on projects, things i've learned, stuff i find interesting.

i'll be writing about luau, rust, low-level programming, and whatever else i'm working on at the time. expect posts about parsers, virtual machines.

more to come. stay tuned.`,
  },
  {
    slug: "koralys-typeinfo",
    title: "displaying typeinfo in koralys",
    date: "2026-03-04",
    summary: "parsing luau's typeinfo blob and showing type annotations in disassembled output.",
    content: `luau bytecode has had type information baked into it since bytecode version 4. every function proto can carry a typeinfo blob; a compact encoding of parameter types, upvalue types, and typed local variables. the compiler emits this when optimization level is >= 2 or when \`typeInfoLevel\` is set. koralys was already deserializing these bytes and storing them, but never actually displaying them. that changed today.

the typeinfo blob layout (types version 3) looks like this:

| field | encoding | description |
|---|---|---|
| sizeTypeinfo | varint | length of function signature bytes |
| sizeTypedUpvals | varint | count of typed upvalues |
| sizeTypedLocals | varint | count of typed locals |
| signature bytes | raw bytes | \`[LBC_TYPE_FUNCTION, numParams, paramType1, ...]\` |
| upvalue types | 1 byte each | one LuauBytecodeType per upvalue |
| typed locals | type,reg,pc,pc | type byte, register, startpc, endpc delta |

each type is a single byte. bit 7 (\`0x80\`) marks it as optional/nullable. the low 7 bits map to: \`0=nil\`, \`1=boolean\`, \`2=number\`, \`3=string\`, \`4=table\`, \`5=function\`, \`6=thread\`, \`7=userdata\`, \`8=vector\`, \`9=buffer\`, \`15=any\`. values 64..95 are tagged userdata subtypes.

the implementation adds three helpers: \`decode_type_byte()\` converts a raw byte -> a readable string like \`'boolean?'\` or \`'number'\`. \`_read_varint_from_blob()\` parses varints from within the byte list. \`parse_type_info()\` decodes the full blob into structured data (signature, typed upvals, typed locals).

before and after, using this source compiled with \`-O2 -g2\`:

\`\`\`lua
local function add(a: number, b: number): number ... end
local function greet(name: string, loud: boolean?): string ... end
local function process(tbl: {string}, callback: (string) -> number): number ... end
\`\`\`

**before** (add):
\`\`\`
function(a, b)
  [000] ADD R2 = R0 + R1
  [001] RETURN return R2
end
\`\`\`

**after** (add):
\`\`\`
function(a: number, b: number)
  [000] ADD R2 = R0 + R1
  [001] RETURN return R2
end
  --< Type Info >--
  signature: (a: number, b: number)
\`\`\`

**before** (greet):
\`\`\`
function(name, loud)
\`\`\`

**after** (greet):
\`\`\`
function(name: string, loud: boolean?)
  --< Type Info >--
  signature: (name: string, loud: boolean?)
\`\`\`

**before** (process):
\`\`\`
function(tbl, callback)
\`\`\`

**after** (process):
\`\`\`
function(tbl: table, callback: function)
  --< Type Info >--
  signature: (tbl: table, callback: function)
\`\`\`

types show up in two places: inline in the function signature (so you see them at a glance), and in a dedicated \`--< Type Info >--\` section at the bottom of each proto (for the full breakdown including upvalue and local types).

the typeinfo parsing adds effectively zero overhead. \`parse_type_info()\` itself takes ~2.5 microseconds per proto with a signature, and 0.11 microseconds for empty blobs. the overhead is lost in the noise of instruction disassembly.

files compiled without type annotations (\`O0\` or \`O1\`) produce no extra output and no crashes. the feature is purely additive.

next up: fixing the \`read_proto_source\` off by one in the v5 deserializer, and continuing the audit.

that's all for this blog post folks. don't forget to brush your teeth`,
  },
  {
    slug: "kasada-vm-2026",
    title: "dissecting kasada's vm (march 2026)",
    date: "2026-03-07",
    summary: "pulling apart a live kasada ips.js from nike and documenting the vm architecture, bytecode encoding, and anti-re techniques",
    content: `i grabbed a live kasada \`ips.js\` script from nike's production endpoint (\`accounts.nike.com\`) and spent some time pulling it apart. 520KB of minified javascript, delivered as a 429 challenge response. here's what's inside.

## how the script gets loaded

when you hit a kasada-protected endpoint without a valid token, the server returns a 429 with a tiny html page:

\`\`\`html
<!DOCTYPE html><html><head></head><body>
<script>window.KPSDK={};
KPSDK.now=typeof performance!=='undefined'
  &&performance.now?performance.now.bind(performance)
  :Date.now.bind(Date);
KPSDK.start=KPSDK.now();</script>
<script src="/149e9513-01fa-4fb0-aad4-566afd725d1b/
  2d206a39-8ed7-437e-a3be-862e0f06eea3/ips.js
  ?KP_UIDz=...&x-kpsdk-im=..."></script>
</body></html>
\`\`\`

the \`KPSDK\` global is set up first with a high-resolution timer. then the ips.js script is loaded with two query params: \`KP_UIDz\` (session identifier) and \`x-kpsdk-im\` (initialization message). the script itself is the entire vm: interpreter, bytecode, encoded instruction handlers, and a regenerator runtime. everything in one payload.

## high-level structure

the 520KB script breaks down into a few distinct sections:

| section | size | description |
|---|---|---|
| main IIFE | ~513K | vm interpreter + encoded bytecode + instruction set |
| regenerator runtime | ~6.3K | babel's regenerator-runtime for async/generator support |
| dispatcher + kickoff | ~177 chars | the dispatch loop and initial \`l(d)\` call |

the entire thing is wrapped in an IIFE with \`"use strict"\`. the first thing it does is define two decoder functions, then decode the bytecode, set up the vm state, build the instruction set, and start executing.

## the two decoders

kasada ships two bytecode decoders in the same script. the first one (\`S\`) is the interesting one:

\`\`\`js
var S = function(i, r, e) {
  // time-based seed generation
  var a = 2;
  var u = [Math.round(+new Date / 18000081) * a];
  for (var f = 1; f < 2; f++) {
    u.push(u[0] - a * f);
    u.push(u[0] + a * f);
  }
  // integrity constant
  var o = 3506192980;
  // Map-based lookup table (not indexOf)
  var c = new Map;
  for (var v = 0; v < r.length; v++) c.set(r[v], v);
  // ...decode with fnv-like hash verification
};
\`\`\`

this decoder generates a **time-based seed** from the current timestamp divided by ~18 million (around a 5-hour window). it tries three candidate seeds: \`[seed, seed-2, seed+2]\`. for each candidate, it decodes the bytecode and after 19 values, runs an integrity check: an fnv-like hash over those values using \`TextEncoder\`, compared against a hardcoded constant (\`3506192980\`).

this means the script **expires**. if you save an ips.js and try to use it hours later, the time seed won't match any candidate and decoding fails silently (returns \`[]\`). nice anti-replay mechanism.

the second decoder (\`u\`) is the classic base-n decoder:

\`\`\`js
u = function(r, v, f) {
  var l = v.length, a = l - f;
  var n = new Map;
  for (var u = 0; u < l; u++) n.set(v[u], u);
  // standard base-n decode loop
  for (; x < r.length;)
    for (var h = 0, t = 1; ;) {
      var M = n.get(r[x++]) || 0;
      if (M < f) { h += t * M; p.push(h | 0); break; }
      h += t * (M % f + f); t *= a;
    }
  return p;
};
\`\`\`

both use \`Map.get()\` for O(1) lookups instead of the older \`indexOf\` approach (maybe more on this later?). the main bytecode uses \`S\` with this encoding table and radix 38:

\`\`\`
0jEec2fFM$AQBnLaD=1qkX7iwhgdGCtZuRV|WHS+P>s^zIlp34UNTb8v<x65y9YomJrK~O
\`\`\`

68 characters, all ascii. no unicode. radix 38 means the first 38 characters are "digit" values and the remaining 30 are "continuation" markers for multi-byte encoding.

## bytecode layout

after decoding, the bytecode is a flat array of integers. the script then extracts a string table from it:

\`\`\`js
var c = E[R + i.indexOf(".")] ^ D;
var U = E.splice(c, E[c + d.Q[0]] + 2);
\`\`\`

\`E\` is the decoded bytecode array. \`R\` is its length. the string table offset is found by XOR-ing a value at a computed index with \`D\` (derived from the bytecode length plus some constant). then \`splice()\` removes the string table from the bytecode in-place, so the remaining array is pure instructions.

## vm state

the vm state is an array-based structure:

\`\`\`js
var e = [
  1,                    // [0] = instruction pointer (starts at 1)
  {
    p: window,          // current 'this' binding
    $: null,            // caller reference
    C: [],              // memory/scope chain
    Q: [0],             // sub-state array
    g: void 0           // parent memory keeper
  },                    // [1] = metadata object
  void 0               // [2] = return value register
];
\`\`\`

registers start at index 0 in the \`Q\` array (sub-state). the instruction pointer lives at \`e.Q[0]\`. register 2 is always the return value. this is a flat register-based VM, not stack-based.

## helper functions

four core helpers drive everything:

\`\`\`js
// read register index from bytecode (>>5 strips low bits)
function g(e) { return E[e.Q[0]++] >> 5 }

// read value FROM a register
function y(e) { return e.Q[E[e.Q[0]++] >> 5] }

// write value TO a register
function w(e, r) { e.Q[g(e)] = r }

// get state metadata
function L(e) { return e.Q[1] }
\`\`\`

the \`>> 5\` is important. bytecode values encode register indices in the upper bits. shifting right by 5 extracts the register number, meaning registers 0-127 fit in a single byte with 5 bits of extra data.

there's also a value reader (\`A\`) that handles multiple types:

\`\`\`js
var A = function(r, v, f, l) {
  var a = r[v[0]++];
  if (a & 1) return a >> 1;           // small integer (odd)
  if (a === f[0]) {                    // float64
    var p = r[v[0]++], x = r[v[0]++];
    var n = p & 2147483648 ? -1 : 1;   // sign bit
    var u = (p & 2146435072) >> 20;     // exponent
    var h = (p & 1048575) * Math.pow(2, 32) + /* ... */
    // IEEE 754 reconstruction
  }
  // ... string table lookup, etc.
};
\`\`\`

small integers are encoded inline (odd values, shifted right by 1). floats use two 32-bit words following the IEEE 754 layout. strings reference the extracted string table.

## string encoding

strings in the table are encoded with a bitwise transform:

\`\`\`js
String.fromCharCode(S & 4294967232 | S * 41 & 63)
\`\`\`

that's \`charCode & 0xFFFFFFC0 | charCode * 41 & 0x3F\`. the upper 26 bits are preserved, and the lower 6 bits are scrambled by multiplying by 41 and masking. it's a simple reversible transformation — just enough to prevent string extraction by grep.

## the instruction set: proxy-based lazy decoding

this is the most interesting part. the instruction handlers are encoded as a string and wrapped in a \`Proxy\`:

\`\`\`js
N = new Proxy(encodedHandlerString, {
  get: function(T, n) {
    var t = Number(n);
    var _ = r[t];             // shuffled opcode index
    var o = e.get(_);          // check cache
    if (o !== void 0) return o;
    // decode handler source and compile it
    var C = new Function(
      u(T[_], "bTrONeQsycpCkXzMjng0VJt" +
              "U5aShKY3mE4v8L1HuGxdPIWD" +
              "lA29iBoZ6fFRw7", 45)
        .map(function(p) {
          return String.fromCharCode(p ^ 2 - 3 + 2 + 2)
        }).join("")
    )();
    e.set(_, C);               // cache it
    return C;
  }
});
\`\`\`

when the dispatch loop accesses \`N[opcodeIndex]\`, the Proxy's \`get\` trap fires. it:

1. maps the opcode index through a shuffled mapping (\`r[t]\`)
2. checks a \`Map\` cache for a previously decoded handler
3. if not cached: decodes the handler source from the encoded string using the classic decoder (\`u\`) with a separate 61-char alphabet and radix 45
4. applies a char transform: \`charCode ^ (2 - 3 + 2 + 2)\` which simplifies to \`charCode ^ 3\`
5. compiles it with \`new Function()\` and caches the result

this is a really good (in my opinion) anti-static-analysis technique. you can't just read the instruction handlers from the source code, as they don't exist as javascript until a specific opcode is first executed at runtime. and the Proxy makes it transparent to the dispatch loop.

## the dispatch loop

the actual execution loop is *pretty* compact:

\`\`\`js
function l(e) {
  var r = [P, [M, H], E, N];
  // P=window, M=Promise, H=regenerator, E=bytecode, N=instrSet
  var T = [m, v, f, l, i, y];
  // m=return, v=catch, f=stateInit, l=self, i=randProp, y=pop

  while (true) {
    var _ = void 0;
    _ = N[E[e.Q[0]++]];
    try {
      var o = _(e, b, w, L, r, T);
      if (o === null) { break; }
    } catch (C) {
      v(e, C);
    }
  }
}
l(d);  // start execution
\`\`\`

each handler receives **6 args**: the vm state, a reader function, the register writer, the metadata getter, a refs array (window/promise/bytecode/instruction set), and a funcs array (return/catch/init/dispatcher/prop/pop). handlers that need to terminate the vm return \`null\`. exceptions are caught and routed through the error handler \`v()\`.

the refs and funcs arrays are important; instead of closing over variables in the outer scope, the handlers receive everything they need as arguments. this means the handlers are self-contained, meaning they can be compiled independently via \`new Function()\` without needing access to the surrounding closure. that's what allows the Proxy-based lazy compilation to work.

## error handling

the vm has structured exception handling:

\`\`\`js
function v(e, r) {
  while (true) {
    var T = e.Q[1];      // metadata
    if (!T) { throw r; }  // no handler = rethrow
    if (T.r) {             // catch address set?
      e.E = { z: r };     // store error
      e.Q[0] = T.r;       // jump to handler
      return;
    }
    e.Q = T.Q;            // unwind to parent scope
  }
}
\`\`\`

when an exception occurs, the vm walks up the scope chain looking for a catch address (\`T.r\`). if found, it stores the error and jumps to the handler. if no handler exists in the entire chain, it rethrows as a native javascript exception.

the return function follows similar logic:

\`\`\`js
function m(e, r) {
  var T = L(e);          // get metadata
  T.i = { z: r };        // store return value
  if (T.v) {
    e.Q[0] = T.v;        // finally block address
  } else {
    e.Q = T.Q;           // restore parent state
    e.Q[2] = r;          // set return register
  }
}
\`\`\`

if a finally block address (\`T.v\`) is set, the return is deferred and execution jumps there first. otherwise, it restores the parent state and puts the return value in register 2.

## opcode count

the script carries 50 opcodes. the pipe-separated instruction table starts with \`"50|..."\` where the first entry is the count. with the classic kasada architecture documented by [nullpt.rs](https://nullpt.rs/devirtualizing-nike-vm-1) (weluvu!) as reference, these likely cover: arithmetic/bitwise ops, comparison ops, object property access, variable scoping, control flow (jump/branch), function definition and calling, try-catch-finally, for-in iteration, and async/generator support via the regenerator runtime.

the opcode ids are **shuffled per script generation**. the mapping from bytecode value -> handler index goes through the \`r\` array which is randomized. so two different ips.js scripts from the same endpoint will have completely different opcode assignments.

## afterword

the overall architecture is a register-based bytecode vm with a flat instruction array, scope chain for variable resolution, and structured exception handling. it's compact, reasonably fast, and... difficult... to statically analyze without running it.

that's all for this one, folks! see you all next time.`,  
  },
]

const md_components: Components = {
  p: ({ children }) => (
    <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: C.text }}>{children}</p>
  ),
  h1: ({ children }) => (
    <h1 className="text-xl sm:text-2xl font-bold mt-8 mb-4" style={{ color: C.heading }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg sm:text-xl font-bold mt-6 mb-3" style={{ color: C.heading }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base sm:text-lg font-semibold mt-5 mb-2" style={{ color: C.heading }}>{children}</h3>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold" style={{ color: C.heading }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ color: C.text }}>{children}</em>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: C.accent }}>{children}</a>
  ),
  code: ({ className, children }) => {
    const match = className?.match(/language-(\w+)/)
    if (match) {
      return (
        <div className="my-4 rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
          <SyntaxHighlighter
            language={match[1]}
            style={site_theme}
            customStyle={{ margin: 0, background: C.bg_subtle, padding: "1rem" }}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      )
    }
    return (
      <code
        className="px-1.5 py-0.5 rounded font-mono"
        style={{ fontSize: "inherit", background: C.code_bg, border: `1px solid ${C.code_border}`, color: C.code_text }}
      >
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <>{children}</>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 mb-4 text-sm sm:text-base" style={{ color: C.text }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 mb-4 text-sm sm:text-base" style={{ color: C.text }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 pl-4 my-4 italic" style={{ borderColor: C.accent, color: C.muted }}>{children}</blockquote>
  ),
  hr: () => (
    <hr className="my-6 border-0 h-px" style={{ background: C.border }} />
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-xs sm:text-sm font-mono" style={{ borderCollapse: "collapse" }}>{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ borderBottom: `1px solid ${C.border}` }}>{children}</thead>
  ),
  th: ({ children }) => (
    <th className="text-left px-3 py-2 font-semibold" style={{ color: C.heading }}>{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2" style={{ color: C.text, borderBottom: `1px solid ${C.border}` }}>{children}</td>
  ),
}

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
        <time className="text-xs font-mono block mt-2 mb-6" style={{ color: C.muted }}>{post.date}</time>
        <Markdown remarkPlugins={[remarkGfm]} components={md_components}>
          {post.content}
        </Markdown>
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
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
        {post ? <Post_View post={post} /> : <Blog_List />}
      </div>
    </div>
  )
}
