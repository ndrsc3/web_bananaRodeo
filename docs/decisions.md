# Architectural Decisions — Banana Rodeo

Each entry: the decision, **Why:** the constraint or reason, **Revisit when:** the condition that would change it.

---

## Hosting: Vercel

Serverless hosting with automatic deploys from `main`.

**Why:** Zero ops for an event site — no server to maintain, no scaling to configure. Free tier covers expected traffic. Git push → deploy is the right DX for a small project.

**Revisit when:** The site needs persistent background processes (e.g., WebSocket server, scheduled jobs that Vercel cron can't cover).

---

## Data Store: Vercel KV (Upstash Redis)

Single data store for page hit counters and guestbook entries.

**Why:** Only data store compatible with Vercel's serverless runtime without a connection pool. Relational DBs (Postgres, etc.) require connection pooling middleware on serverless — Redis is stateless by nature.

**Revisit when:** The site needs relational data, joins, or structured queries. At that point, Vercel Postgres + Prisma is the natural next step.

---

## Frontend: Vanilla TypeScript, No Framework

No React, Vue, Svelte, etc.

**Why:** Small event site with no complex shared state. Zero onboarding friction for contributors. A framework would add build complexity and abstraction for a site where pages are mostly independent HTML.

**Revisit when:** Page count grows past ~15 with shared state between pages, or the guestbook/interactive features need component-level reactivity.

---

## Build Tool: Vite

Bundles TypeScript from `src/`, processes HTML pages in `pages/`, copies static assets from `public/`.

**Why:** Replaced a custom monorepo build system. Supports TypeScript bundling, multi-entry HTML, HMR in dev, and a plugin API that powers the HTML template injection system (comment placeholder → fragment swap at build time).

**Revisit when:** Vite drops multi-entry HTML support or the custom Vite plugin becomes unmaintainable.

---

## Repo Structure: Flat (No Monorepo)

Single `package.json` at root. Frontend (`src/`, `pages/`, `public/`) and API (`api/`) coexist.

**Why:** Simplified from a previous monorepo structure. A single Vite frontend + Vercel serverless API doesn't justify workspace overhead. Vercel handles the routing split (`/api/*` → functions, everything else → static).

**Revisit when:** The project gains a second distinct application (e.g., a separate admin dashboard with its own build pipeline).

---

## HTML Templates: Custom Comment-Placeholder System

Shared header/footer injected via `<!-- HEADER -->` / `<!-- FOOTER -->` comments, replaced at build time by the Vite plugin in `vite.config.ts`. Fragments live in `public/templates/`.

**Why:** Avoids adopting an SSR framework (Next.js, Astro) just to share a header and footer on a static site. Keeps HTML files readable and editable without framework knowledge.

**Revisit when:** The number of shared template fragments grows large enough that the Vite plugin becomes a maintenance burden, or if SSR is needed for other reasons.

---

## CSS: No Framework

All CSS hand-written, organized in `public/styles/` by category (`base/`, `layout/`, `components/`, `animations/`, `themes/`, `pages/`, `utils/`).

**Why:** Web1.0 aesthetic requires custom CSS that a utility framework (Tailwind) or component framework (Bootstrap) would actively fight. The visual identity depends on explicit, idiosyncratic styling choices.

**Revisit when:** Never, unless the web1.0 aesthetic is intentionally abandoned.

---

## TypeScript: Strict Mode

`"strict": true` in `tsconfig.json`.

**Why:** Null safety matters for KV reads where data may be absent. Redis returns `null` for missing keys; without strict mode, null-handling bugs are silent.

**Revisit when:** Never. Strict mode is the right default.

---

## Redis Client: Both `@vercel/kv` and `@upstash/redis`

Both packages are present in `package.json`.

**Why:** `@vercel/kv` is the higher-level Vercel-native wrapper (auto-configures from env vars). `@upstash/redis` is the lower-level client for direct access when `@vercel/kv`'s abstraction is insufficient. `storage.ts` uses both.

**Revisit when:** `@vercel/kv` is deprecated or the Upstash client gains first-class Vercel integration that makes the wrapper unnecessary.

---

## API: CommonJS-Compatible Syntax in Vercel Functions

`api/*.ts` files use `import`/`export default` but are compiled by Vercel's Node.js runtime.

**Why:** Vercel's Node.js function runtime requires CommonJS-compatible module output. The `@vercel/node` runtime handles compilation; files must use `export default` (not named exports for the handler) and avoid ESM-only patterns.

**Revisit when:** Vercel officially moves to ESM-native function runtime (no CJS requirement).
