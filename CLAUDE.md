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

## Image Pipeline & Photo Wall

Site images (photo wall, sponsor logos) are **not committed by hand.** Raw camera files are dropped into the underScore `_capture/` intake and normalized to web-optimized WebP by `underScore/knowledge/tools/process-images.py`, driven by this repo's `image-pipeline.toml`. The photo wall (`/pages/photowall.html`) is organized **per event year** — each year is its own pipeline target rendering to `public/assets/photowall/<year>/` with its own `manifest.json`, and the frontend (`src/photowall.ts`) shows year tabs defaulting to the newest year.

**Adding a new year of photos — or any image drop — follows a fixed runbook:** `docs/photowall-pipeline.md`. Read it before touching `image-pipeline.toml`, the `photowall/<year>/` assets, or `YEARS` in `photowall.ts`.

## Git Workflow

**Two-tier promotion — nothing reaches production except through validation:**

```
feature/X   (its own git worktree)
   │  push + PR
   ▼
development  ← integration branch; validate on its Vercel preview deploy
   │  fast-forward once validated
   ▼
main         ← production; auto-publishes to banana.rodeo on push
```

- **`main`** = production. Vercel auto-deploys it to banana.rodeo. **Never commit to `main` directly** — it only ever advances by fast-forward to a validated `development` tip.
- **`development`** = integration / staging. All feature PRs land here; its preview deploy is where we validate before publishing. Branched from `main`, always ≥ `main`.
- **`feature/*`** = one branch per unit of work, each in its **own worktree** (below). PR into `development`, never into `main`.

### Branch naming

| Prefix | Use for |
|---|---|
| `feature/` | New functionality |
| `fix/` | Bug fixes |
| `chore/` | Tooling, deps, docs, refactors |

Keep branch names short and lowercase: `feature/falling-bananas`, `fix/auth-redirect`, `chore/update-deps`.

### Parallel work with git worktrees

Multiple Claude sessions (and the owner across machines) work this repo at once. **Never leave uncommitted work in a shared checkout** — a concurrent branch switch will stash or clobber it. Give every feature its own **worktree**: one folder per branch, all sharing one `.git`, working trees independent.

```bash
# fast path — branch + folder + node_modules symlink + .vercel copy in one step:
scripts/new-worktree.sh X           # → feature/X in ../web_bananaRodeo-X, based on origin/development

# manual equivalent:
git worktree add -b feature/X ../web_bananaRodeo-X development   # new branch + folder
cd ../web_bananaRodeo-X
ln -s ../web_bananaRodeo/node_modules node_modules               # each worktree needs its own deps
#   ^ symlink is fast but not matched by `.gitignore` (which has `node_modules/`, a dir);
#     add `node_modules` to .git/info/exclude so it can't be committed. (Or just `npm install`.)
cp -R ../web_bananaRodeo/.vercel .                               # project link + dev env — required for `npx vercel dev`
#   ^ copy, don't symlink: vercel writes build cache into .vercel/, concurrent dev servers shouldn't share it

# ...work, fetch-before-commit, push...
git push -u origin feature/X        # Vercel builds a preview for the branch
# open a PR into `development`. After it merges:
git worktree remove ../web_bananaRodeo-X
```

Running dev servers in two worktrees at once: give the second one its own port — `npx vercel dev --listen 3001`.

`git worktree list` shows every tree; `git worktree prune` clears stale ones. `workSpace/` is gitignored by the parent underScore repo (except `.manifest`), so extra worktree folders don't pollute it. If you lose uncommitted work after a branch switch, check `git stash list` before assuming it's gone.

### Commit & PR flow

- **Fetch before every commit** (`git fetch`) — concurrent sessions/agents push here routinely. If behind, rebase your un-pushed commits onto the remote tip before pushing; surface conflicts, don't force-resolve.
- Push the feature branch and open a **PR into `development`** (merge commit, not squash). Validate on the preview deploy. Run `/review` before merging. Keep branches short-lived.
- **Promote to production:** once `development` is validated, fast-forward `main` to it:
  `git checkout main && git merge --ff-only development && git push` → publishes to banana.rodeo.
- **After publishing — refresh long-lived worktrees so they don't silently drift behind `main`:**
  - Remove the merged feature worktree + branch: `git worktree remove ../web_bananaRodeo-<name>`, then `git branch -d <branch>` and (if pushed) `git push origin --delete <branch>`.
  - **Fast-forward the shared `web_bananaRodeo-dev` integration worktree** — it stays checked out on `development` and won't advance on its own: `cd ../web_bananaRodeo-dev && git pull --ff-only`. Skipping this is how it ends up "behind [N]" and the next session there starts from stale code.
- Note: `/ship` and `/review` predate this two-tier model — `/ship` should target `development`, not `main`. Update those skills to match before relying on them.

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

KV credentials live in the Vercel project (dashboard), not in the repo — there is **no top-level `.env.local`**. The Vercel CLI materializes them at `.vercel/.env.development.local` once the directory is linked (`npx vercel link`, or copy `.vercel/` from the main checkout — see worktree setup above); `npx vercel dev` then picks them up automatically. Re-pull after dashboard changes with `npx vercel env pull`.

Vars defined in the Vercel project:
- `VERCEL_KV_URL`
- `VERCEL_KV_REST_API_URL`
- `VERCEL_KV_REST_API_TOKEN`
- `VERCEL_KV_REST_API_READ_ONLY_TOKEN`

`.vercel/` is gitignored, so fresh clones and new worktrees start unlinked — that's why `vercel dev` prompts to link until the directory is linked or copied.
