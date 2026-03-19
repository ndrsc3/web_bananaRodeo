# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Website for **The Banana Rodeo Science Fair** in Reno, NV — a Web1.0-inspired event site with a modern serverless backend. Deployed on Vercel.

## Commands

```bash
# Development
npm run dev            # Vite dev server with HMR at localhost:5173
npx vercel dev         # Local dev with Vercel serverless functions

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

**Feature modules in `src/`:**
- `page-stats.ts` + `kv-client.ts` — hit counter (calls `/api/route`)
- `guestbook.ts` — guestbook form submission and entry display
- `cursor.ts` — custom cursor with trail effects
- `auth.ts` — localStorage-based 24-hour session auth

**CSS in `public/styles/`** organized by: `base/`, `components/`, `layout/`, `animations/`, `utils/`, `web1/`

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
- Page-specific CSS goes in `public/styles/components/`
- Script tag: `<script type="module" src="/src/main.ts"></script>`

## Git Workflow

Feature branches → main → Vercel auto-deploys on push to main.

```bash
git checkout -b feature/my-change   # work in a branch
# ... edit, build, validate ...
git checkout main
git merge feature/my-change
git push origin main                 # triggers Vercel deploy
```

Use `/ship` skill to walk through the validate → commit → push sequence.

Branches also get Vercel preview deployments — useful for reviewing changes before merging.

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

Each idea lives in its own file. Ideas can sit at any stage indefinitely — the goal is understanding, not velocity.

| Status | You can answer... |
|---|---|
| `seed` | Name + question in 1–3 sentences |
| `concept` | "What is it and why does it fit this project?" |
| `explored` | Key questions resolved, rough UX sketched, feasibility assessed |
| `planned` | Tasks filed in `TASKS.md`, `## Plan` section filled, ready to build |
| `built` | All linked tasks done |

**File format:**
```markdown
---
status: seed
tags: [page, feature, fx, easter-egg, content, game, audio, dx]
---

# [Name]

## The Question
What are we trying to find out or answer?

## Concept
What is it? Why does it fit this project?

## Key Questions
Open questions to answer before building.

## Rough UX / Notes

## Implementation Notes

## Plan
(populate when status → planned; inline steps if simple, link to docs/plans/<name>.md if complex)

## References
```

**Skills:**
- `/idea` — capture a new idea from a meeting or conversation, create the exploration file
- `/explore [name]` — run an inquiry session on an existing idea, advance it along the pipeline

### Plans (`docs/plans/`)

For complex features requiring a detailed step-by-step plan (multi-file refactors, new API endpoints, schema changes). When a plan file exists, link it from the exploration's `## Plan` section and reference it in `TASKS.md`:

```
- [ ] [FEATURE] Build X — see docs/plans/x.md
```

Simple features don't need a separate plan file — use the `## Plan` section in the exploration directly.

### Task Board (`docs/TASKS.md`)

Three-tier board (P1 blockers / P2 next-up / P3 backlog).

- Use `/backlog` at session start — shows tasks + surfaces incubating explorations
- Update checkboxes: `[ ]` todo, `[~]` in-progress, `[x]` done
- Move completed items to Done section
- Tags: `[PAGE: name]`, `[FEATURE]`, `[FX]`, `[DX]`, `[EASTER]`, `[ANALYTICS-Pn]`

## Environment Variables

Required in `.env.local` for local Vercel dev:
- `VERCEL_KV_URL`
- `VERCEL_KV_REST_API_URL`
- `VERCEL_KV_REST_API_TOKEN`
- `VERCEL_KV_REST_API_READ_ONLY_TOKEN`
