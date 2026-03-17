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

## Environment Variables

Required in `.env.local` for local Vercel dev:
- `VERCEL_KV_URL`
- `VERCEL_KV_REST_API_URL`
- `VERCEL_KV_REST_API_TOKEN`
- `VERCEL_KV_REST_API_READ_ONLY_TOKEN`
