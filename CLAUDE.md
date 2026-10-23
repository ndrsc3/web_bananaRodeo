# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Website for **The Banana Rodeo Science Fair** in Reno, NV — a Web1.0-inspired event site with a modern serverless backend. Deployed on Vercel.

## Commands

```bash
# Development
npm run dev:full       # Preflight (lockfile, Vercel link, env keys) then vercel dev — use this
npm run dev:check      # Preflight only
npx vercel dev         # Local dev server with Vercel serverless functions

# The floor — CI and the pre-commit hook run exactly this
npm run check          # typecheck (src/) + lint + test (node --test) + build + smoke
npm run smoke          # Runtime-load gate: imports every api/ file under Node ESM

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

Vercel serverless functions (Node.js 24.x — `.nvmrc`, `engines` and CI agree; TypeScript compiled by Vercel automatically, no runtime pin):
- `route.ts` — hit counter: `GET /api/route?pathname=` increments Redis counter (skips increment in dev mode)
- `guestbook.ts` — `POST` adds entry, `GET` returns paginated entries (max 100, FIFO eviction)
- `auth.ts` — auth logic
- `keepalive.ts` — daily Vercel cron (`vercel.json` `crons`) that writes `keepalive:last`. Upstash archives a free database after a stretch with no commands, and an archived store 500s every KV route until restored by hand. If `CRON_SECRET` is set in the project, only Vercel's cron call is accepted.

API files use CommonJS-compatible syntax (`import`/`export default`) — Vercel requires this.

**`api/` holds handlers only:** every file there is a public endpoint, so a helper left there 500s on every call. Shared server code lives in `lib/` (`lib/storage.ts`: shared KV/Redis operations), imported as `../lib/storage.js`; Vercel bundles what a handler imports. `npm run smoke` fails any `api/` file without a default handler.

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

Site images (photo wall, sponsor logos) are **not committed by hand.** Raw camera files are dropped into the underScore `_inbox/` intake and normalized to web-optimized WebP by `underScore/knowledge/tools/process-images.py`, driven by this repo's `image-pipeline.toml`. The photo wall (`/pages/photowall.html`) is organized **per event year** — each year is its own pipeline target rendering to `public/assets/photowall/<year>/` with its own `manifest.json`, and the frontend (`src/photowall.ts`) shows year tabs defaulting to the newest year.

**Adding a new year of photos — or any image drop — follows a fixed runbook:** `docs/photowall-pipeline.md`. Read it before touching `image-pipeline.toml`, the `photowall/<year>/` assets, or `YEARS` in `photowall.ts`.

## Git Workflow

**GitHub flow: every change is a short-lived branch and a PR into `main`. The PR's Vercel preview is the staging check.**

```
feature/X   (its own worktree, branched from origin/main)
   │  commit (the pre-commit hook runs `npm run check`), push, open a PR into main
   ▼
PR          ← CI `verify` + a Vercel preview; validate on the preview
   │  owner approves, then merge (merge commit)
   ▼
main        ← production; auto-publishes to banana.rodeo, then verify it
```

- **`main`** = production. A GitHub ruleset enforces it: changes arrive only by PR, CI `verify` must pass, the branch must be up to date with `main`, and `main` can't be force-pushed or deleted.
- **`feature/*` / `fix/*` / `chore/*`** = one branch per unit of work, each in its **own worktree** (below). There is no long-lived integration branch. To test several features together, stack them on one branch and use its preview.
- **Agents never merge without the owner's approval in chat.** Agent and owner share one GitHub account, so "reviewed" means that approval plus green CI.
- **The main checkout (`../web_bananaRodeo`) stays on `main` and is never worked in.** It's the source of `node_modules` and `.vercel` for every worktree; refresh it with `git pull --ff-only` after merges.

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
scripts/new-worktree.sh X           # → feature/X in ../web_bananaRodeo-X, based on origin/main

# manual equivalent:
git fetch origin
git worktree add -b feature/X ../web_bananaRodeo-X origin/main   # new branch + folder
cd ../web_bananaRodeo-X
ln -s ../web_bananaRodeo/node_modules node_modules               # each worktree needs its own deps
#   ^ symlink is fast but not matched by `.gitignore` (which has `node_modules/`, a dir);
#     add `node_modules` to .git/info/exclude so it can't be committed. (Or just `npm install`.)
cp -R ../web_bananaRodeo/.vercel .                               # project link + dev env — required for `npx vercel dev`
#   ^ copy, don't symlink: vercel writes build cache into .vercel/, concurrent dev servers shouldn't share it

# ...work, fetch-before-commit, push...
git push -u origin feature/X        # Vercel builds a preview for the branch
# open a PR into `main`. After it merges:
git worktree remove ../web_bananaRodeo-X && git branch -d feature/X
```

Running dev servers in two worktrees at once: give the second one its own port — `npx vercel dev --listen 3001`.

`git worktree list` shows every tree; `git worktree prune` clears stale ones. `workSpace/` is gitignored by the parent underScore repo (except `.manifest`), so extra worktree folders don't pollute it. If you lose uncommitted work after a branch switch, check `git stash list` before assuming it's gone.

### Commit & PR flow

1. **Commit.** The pre-commit hook runs `npm run check`. Never bypass it with `--no-verify`.
2. **Before pushing, `git fetch` and rebase onto `origin/main`** if it moved. Concurrent sessions merge here routinely. Surface conflicts; don't force-resolve.
3. **Push and open a PR into `main`** (`/ship`). Run `/review` first. Keep branches short-lived: a PR open for days drifts.
4. **CI `verify` and the Vercel preview run on the PR.** Check the change on the preview. Previews are behind Vercel login, so open them in a browser signed in to Vercel.
5. **If GitHub says the branch is out of date** (another PR merged first): `gh pr update-branch <n>`, or rebase and push. CI reruns against the new `main`.
6. **Owner approves in chat, then merge** with a merge commit: `gh pr merge <n> --merge`. GitHub deletes the remote branch.
7. **Verify production:** the deploy finishes, `https://www.banana.rodeo` returns 200, and the GET APIs answer (`/api/banana-counter` returns `{"total":…}`).
8. **Clean up:** remove the worktree and local branch, and `git -C ../web_bananaRodeo pull --ff-only`.

**When a second developer joins:** the ruleset moves to 1 required approval, so each PR is approved by the other person (GitHub won't let an account approve its own PR), and a dev KV store goes in first, so previews stop writing to production data (`docs/TASKS.md`).

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

`.env.example` names the keys the code needs: `KV_REST_API_URL`, `KV_REST_API_TOKEN` (read by `@vercel/kv`) and `SITE_PASSWORD` (`api/auth.ts`). The project also holds `KV_URL`, `REDIS_URL`, `KV_REST_API_READ_ONLY_TOKEN` and `BLOB_*`.

**There is no dev store.** The KV variables are the same in Production, Preview and Development, so `vercel dev` and every preview read and write production data. This is a deliberate choice for now (`_underScore/work/plans/active/261020-vercel-app-dev-process.md`, D4). Don't run data-writing tests here. When a change touches data, add a second free Upstash database for Development + Preview first.

`.vercel/` is gitignored, so fresh clones and new worktrees start unlinked — that's why `vercel dev` prompts to link until the directory is linked or copied.
