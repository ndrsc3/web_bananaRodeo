# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Website for **The Banana Rodeo Science Fair** in Reno, NV — a Web1.0-inspired event site with a modern serverless backend. Deployed on Vercel.

## Commands

```bash
# Development
npx vercel dev         # Local dev server with Vercel serverless functions (default)

# Production build
npm run build          # Vite build → dist/

# Preview built output
npm run preview        # Serve dist/ locally with Vite preview

# Lint / Format
npm run lint           # ESLint on src/ api/ vite.config.ts
npm run format         # Prettier --write on all source files

# Scripts
npm run hash-password  # Generate hashed password (tsx scripts/hash-password.ts)
npm run reset-counters # Reset all hit counters (tsx scripts/reset-counters.ts)
```

## Architecture

**Flat structure** — no monorepo. All source at project root.

### Frontend

- **Vanilla TypeScript/HTML/CSS** — no framework
- `src/` — TypeScript source (bundled by Vite)
- `public/` — static assets copied verbatim to `dist/` (styles, images, gifs, templates)
- `pages/` — HTML entry points, processed by Vite (template injection, TS bundling)
- `index.html` — root entry point (password/auth gate)
- `dist/` — Vercel output directory (do not edit directly)

**Build pipeline:** Vite bundles TypeScript from `src/`, injects shared templates into HTML pages via a custom plugin in `vite.config.ts`, and copies static assets from `public/`.

**Entry point:** `src/main.ts` — initializes auth check, page hit counter, and custom cursor on `DOMContentLoaded`.

**CSS in `public/styles/`** organized by: `base/`, `layout/`, `components/`, `animations/`, `themes/`, `pages/`, `utils/` — all imported via `main.css`. See **CSS System** section below for conventions.

### Backend (`api/`)

Vercel serverless functions (Node.js 20.x, TypeScript compiled by Vercel automatically):
- `route.ts` — hit counter: `GET /api/route?pathname=` increments Redis counter (skips increment in dev mode)
- `guestbook.ts` — `POST` adds entry, `GET` returns paginated entries (max 100, FIFO eviction)
- `storage.ts` — shared KV/Redis operations
- `auth.ts` — auth logic

API files use CommonJS-compatible syntax (`import`/`export default`) — Vercel requires this.

**Data store:** Vercel KV (Redis via `@upstash/redis`)
- Page hits: key `page:{pathname}` → `{ hasHitCounter, hits, lastUpdated }`
- Guestbook: Redis list at `guestbook:entries` → entry objects with id, name, message, bananaMemory, mood, timestamp

### Routing (`vercel.json`)
- `/api/*` → serverless functions
- Everything else → filesystem (static output in `dist/`)

## HTML Template System

Pages in `pages/` use HTML comment placeholders replaced at build time by the Vite plugin in `vite.config.ts`. Template fragments live in `public/templates/`.

| Placeholder | Fragment file |
|---|---|
| `<!-- HEADER -->` | `public/templates/header.html` |
| `<!-- FOOTER -->` | `public/templates/footer.html` |
| `<!-- CHAT-MARQUEE -->` | `public/templates/chat-marquee.html` (optional) |

**To add a new page:** use `/new-page` skill. Copy `pages/template.html` as a starting point.

Key HTML conventions:
- Body class is `page-background-color` or `page-background-color2` (darker)
- `<h1 class="glitch">` for animated section titles
- Content sections use `section-basic-trans` or `section-content-base section-content-win98` for the Windows 98 panel look
- Page-specific CSS goes in `public/styles/pages/` and is linked directly from the HTML (not imported via `main.css`)
- Script tag: `<script type="module" src="/src/main.ts"></script>`

## CSS System

The CSS is being built toward a **portable design token system** that can be extracted to other projects. A designer (Adobe suite) will eventually contribute — treat this as iterative groundwork.

### Folder roles

| Folder | Purpose |
|---|---|
| `base/` | Variables, reset, typography |
| `layout/` | Header, footer, sections, grid, page backgrounds |
| `components/` | Reusable elements: buttons, cards, images, marquee, tables |
| `animations/` | Keyframes + effect/transition utility classes |
| `themes/` | Whole visual paradigms: web1, bbs, win98, guestbook |
| `pages/` | Standalone page overrides — linked directly from HTML, not in main.css |
| `utils/` | Helpers: text-center, hidden, loading |

### Standalone page stylesheets

Pages with a completely different visual identity (leaderboard, thebananacard) use their **own stylesheet instead of main.css** — own `:root` variables, own `body` reset, own font import. Use this pattern for any new page that can't reasonably layer on top of main.css.

### Prototype styles (`proto-*`)

`pages/tests/style-test.html` is the **living style guide** — all new component and theme ideas are prototyped here first using the `proto-` prefix. When a prototype gets used on a real page, graduate it:
- Reusable elements → `components/`
- Whole visual paradigms → `themes/` or a standalone page stylesheet
- The call is made at build time, not in advance

### Variables

`base/variables.css` is the source of truth for design tokens. Key stacks:
- `--font-western: 'Rye', serif` — western aesthetic (requires `<link>` to Google Fonts)
- `--font-handwritten: 'Architects Daughter', cursive` — handwritten style (requires `<link>`)
- `--color-terminal-green`, `--color-win98-silver`, etc. — theme palette values

**Hardcoding policy:** Hardcoding colors directly is acceptable for one-off themed contexts. When a hardcoded value appears in 3+ places, add it as a comment in the promotion-candidate block at the bottom of `variables.css`. Create a named variable only when the value is confirmed as a recurring token.

## Git Workflow

Feature branches → main → Vercel auto-deploys on push to main.

### Branch naming

| Prefix | Use for |
|---|---|
| `feature/` | New functionality |
| `fix/` | Bug fixes |
| `chore/` | Tooling, deps, docs, refactors |

Keep branch names short and lowercase: `feature/falling-bananas`, `fix/auth-redirect`, `chore/update-deps`.

Branch from main, run `/review` before merging, use `/ship` to handle commit → merge → push. Keep branches short-lived.

When working with collaborators, push the branch instead of merging locally and open a GitHub PR. Merge via GitHub UI (merge commit, not squash). Branches get Vercel preview deployments automatically.

## Decisions

Architectural decisions (why we chose Vercel, Vanilla TS, Vite, etc.) are documented in `docs/decisions.md`. Check there before re-litigating tech choices.

## Workflow

The full workflow system — skills, agents, exploration pipeline, task board — is documented in `docs/claude-workflow.md`. That doc also identifies which files are generic (safe to copy to other projects) vs. project-specific.

## Idea Pipeline

Development is driven by inquiry. Ideas start as questions, get explored until they're understood, then get planned and built.

```
docs/explorations/   ← every idea, at any stage
docs/plans/          ← detailed implementation plans (complex features only)
docs/TASKS.md        ← actionable work queue
```

### Explorations (`docs/explorations/`)

Each idea lives in its own file at any stage (`seed` → `concept` → `explored` → `planned` → `built`). Full file format and stage definitions are in `docs/claude-workflow.md`.

**Skills:**
- `/idea` — capture a new idea, create the exploration file
- `/explore [name]` — run an inquiry session on an existing idea

### Plans (`docs/plans/`)

For complex features, save a step-by-step plan to `docs/plans/<name>.md` and link it from the exploration's `## Plan` section. Simple features can inline the plan in the exploration directly.

When a plan exists, add **one task** to `docs/TASKS.md` linking to it — not a breakdown of its steps. The plan is the source of truth for implementation detail; TASKS.md is a triage board.

### Task Board (`docs/TASKS.md`)

Three-tier board (P1 blockers / P2 next-up / P3 backlog). Use `/backlog` at session start. Checkboxes: `[ ]` todo, `[~]` in-progress, `[x]` done. Tags: `[PAGE: name]`, `[FEATURE]`, `[FX]`, `[DX]`, `[EASTER]`.

## Environment Variables

Required in `.env.local` for local Vercel dev:
- `VERCEL_KV_URL`
- `VERCEL_KV_REST_API_URL`
- `VERCEL_KV_REST_API_TOKEN`
- `VERCEL_KV_REST_API_READ_ONLY_TOKEN`
