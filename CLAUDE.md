# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Website for **The Banana Rodeo Science Fair** in Reno, NV — a Web1.0-inspired event site with a modern serverless backend. Deployed on Vercel.

## Commands

```bash
# Development
npm run watch          # Concurrent TS compilation + static file watching
npm run vercel-dev     # Local dev with Vercel serverless functions

# Production build
npm run build          # Clean + compile TS + process static assets

# Individual steps
npm run build:client   # Compile TypeScript only
npm run build:static   # Process/copy static assets only
npm run clean          # Remove build artifacts
```

## Architecture

**Monorepo** (npm workspaces) with two main areas:

### Frontend (`packages/client/`)
- **Vanilla TypeScript/HTML/CSS** — no framework
- `src/` — TypeScript source compiled to `dist/src/`
- `public/` — static assets copied to `dist/`
- `dist/` — Vercel output directory (do not edit directly)

**Build pipeline:** `src/build.ts` copies `public/` assets to `dist/`, then processes HTML pages by injecting shared template fragments (header, footer, chat-marquee) from `public/templates/`. Template injection uses HTML comment placeholders.

**Entry point:** `src/main.ts` — initializes auth check, page hit counter, and custom cursor on `DOMContentLoaded`.

**Feature modules in `src/`:**
- `page-stats.ts` + `kv-client.ts` — hit counter (calls `/api/route`)
- `guestbook.ts` — guestbook form submission and entry display
- `cursor.ts` — custom cursor with trail effects
- `auth.ts` — localStorage-based 24-hour session auth

**CSS in `public/styles/`** organized by: `base/`, `components/`, `layout/`, `animations/`, `utils/`, `web1/`

### Backend (`api/`)
Vercel serverless functions (Node.js 20.x, runtime `@vercel/node@3.1.0`):
- `route.js` — hit counter: `GET /api/route?pathname=` increments Redis counter (skips increment in dev mode)
- `guestbook.js` — `POST` adds entry, `GET` returns paginated entries (max 100, FIFO eviction)
- `storage.js` — shared KV/Redis operations
- `auth.js` — auth logic

**Data store:** Vercel KV (Redis via `@upstash/redis`)
- Page hits: key `page:{pathname}` → `{ hasHitCounter, hits, lastUpdated }`
- Guestbook: Redis list at `guestbook:entries` → entry objects with id, name, message, bananaMemory, mood, timestamp

### Routing (`vercel.json`)
- `/src/*.ts` → `api/serve-ts`
- `/api/*` → serverless functions
- Everything else → filesystem (static output in `packages/client/dist/`)

## HTML Template System

Pages in `public/pages/` use HTML comment placeholders that are replaced at build time by `src/templates.ts`:

| Placeholder | Replaced with |
|---|---|
| `<!-- HEADER -->` | `<header class="header">` + `templates/header.html` |
| `<!-- FOOTER -->` | `<footer class="footer">` + `templates/footer.html` |
| `<!-- CHAT-MARQUEE -->` | `templates/chat-marquee.html` (optional, not on every page) |

**To add a new page:** use `/new-page` skill. The bare minimum structure is in `public/pages/template.html`.

Key HTML conventions:
- Body class is `page-background-color` or `page-background-color2` (darker)
- `<h1 class="glitch">` for animated section titles
- Content sections use `section-basic-trans` or `section-content-base section-content-win98` for the Windows 98 panel look
- Page-specific CSS goes in `public/styles/components/`

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

## Idea Pipeline

Ideas flow through three stages before becoming code:

```
docs/explorations/   ← ideas at any stage (seed → explored)
docs/plans/          ← implementation plans generated in Plan mode
docs/TASKS.md        ← actionable tasks, with links to plans where applicable
```

### Explorations (`docs/explorations/`)

Each idea has its own file. Ideas can sit at any stage indefinitely.

| Status | Meaning |
|---|---|
| `seed` | Captured name/concept, may have a reference link |
| `concept` | What it is, why it fits, key open questions |
| `explored` | Rough UX, content notes, technical considerations |
| `planned` | Ready to build — tasks filed, plan generated in `docs/plans/` |

**Frontmatter template:**
```markdown
---
status: seed
tags: [page, feature, fx, easter-egg, content, game, audio, dx]
---
```

Sections to fill in as the idea develops: `## Concept`, `## Key Questions`, `## Rough UX / Notes`, `## Implementation Notes`, `## References`.

### Plans (`docs/plans/`)

When an exploration is fully fleshed out, run Plan mode to generate a step-by-step implementation plan. Save the output to `docs/plans/<name>.md`. Add a minimal reference in `TASKS.md`:

```
- [ ] [FEATURE] Build X — see docs/plans/x.md
```

Details live in the plan, not the task.

### Task Board (`docs/TASKS.md`)

Three-tier board (P1 blockers / P2 next-up / P3 backlog).

- Use `/backlog` at session start for a brief and task orientation
- Update checkboxes: `[ ]` todo, `[~]` in-progress, `[x]` done
- Move completed items to Done section
- Tags: `[PAGE: name]`, `[FEATURE]`, `[FX]`, `[DX]`, `[EASTER]`, `[ANALYTICS-Pn]`

## Environment Variables

Required in `.env.local` for local Vercel dev:
- `VERCEL_KV_URL`
- `VERCEL_KV_REST_API_URL`
- `VERCEL_KV_REST_API_TOKEN`
- `VERCEL_KV_REST_API_READ_ONLY_TOKEN`
