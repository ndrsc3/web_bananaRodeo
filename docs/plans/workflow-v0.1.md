# Plan: Workflow Docs Consolidation (v0.1)

## Context

The Claude workflow system for this project has matured across several sessions: skills, agents, an exploration pipeline, and a task board are all in place. Three gaps remain before this is a stable, cross-project baseline:

1. **No `docs/decisions.md`** — Claude knows the *what* and *how* of the codebase but not the *why*. Architectural decisions get re-litigated every session.
2. **No `/groom` skill** — the exploration pipeline and task board accumulate stale entries with no maintenance mechanism.
3. **No `docs/claude-workflow.md`** — with two other projects about to adopt this system, there's no doc that distinguishes generic workflow files from project-specific customizations. Cross-project merging will be blind without it.

All files stay in the repository (no migration to `~/.claude/`). The repo *is* the package for now. `docs/claude-workflow.md` is what enables disciplined merging across projects when the `ndr-claude-workflow` package is eventually formalized.

---

## Files to Create

| File | Type |
|---|---|
| `docs/decisions.md` | New doc |
| `.claude/commands/groom.md` | New skill |
| `docs/claude-workflow.md` | New doc |

CLAUDE.md gets a small addition pointing to the two new docs.

---

## 1. `docs/decisions.md`

Pre-populated from reading `package.json`, `vercel.json`, `vite.config.ts`, `tsconfig.json`, and `CLAUDE.md`.

Each entry: one-line decision, **Why:** (constraint or reason), **Revisit when:** (the condition that would change it).

Decisions to document:

- **Vercel for hosting** — serverless, zero ops for an event site. Revisit if site needs persistent background processes.
- **Vercel KV (Upstash Redis)** — only data store compatible with serverless without a connection pool. Revisit if relational data is needed.
- **Vanilla TypeScript, no framework** — small event site, no complex state, zero onboarding friction for contributors. Revisit if page count grows past ~15 with shared state.
- **Vite as build tool** — replaced a custom monorepo build; supports TS bundling + custom plugin for HTML template injection. Revisit only if Vite drops HTML multi-entry support.
- **Flat repo structure (no monorepo)** — simplified from a previous monorepo; single frontend + serverless API doesn't justify workspace overhead.
- **Custom HTML template system** — HTML comment placeholders replaced at build time via Vite plugin in `vite.config.ts`. Avoids SSR framework for shared header/footer on a static site.
- **No CSS framework** — web1.0 aesthetic requires custom CSS; framework would fight the design. CSS organized by category in `public/styles/`.
- **TypeScript strict mode** — `"strict": true` in tsconfig; null safety matters for KV reads where data may be absent.
- **`@upstash/redis` + `@vercel/kv`** — both present; `@vercel/kv` is the higher-level wrapper, `@upstash/redis` for direct access when needed.

---

## 2. `.claude/commands/groom.md`

### Behavior
Read-only analysis followed by a proposed change list. Never modifies files without explicit confirmation.

### What it checks

**Exploration pipeline health** — reads all `docs/explorations/*.md`:
- `seed` files with no content beyond a title/reference (stuck seeds)
- `concept` files with unanswered Key Questions and no recent apparent development
- `explored` files with no `## Plan` section and no matching tasks in TASKS.md
- `planned` files where TASKS.md has no corresponding tasks

**TASKS.md health** — reads `docs/TASKS.md`:
- Done section exceeding 10 items (suggest archiving to `docs/archive/TASKS-archive.md`)
- `[~]` in-progress tasks (flag if more than 3)
- `_Last touched_` date (flag if >2 weeks stale)
- TASKS.md references to exploration files that don't exist

### Output format
```
## Pipeline Health Report — [date]

### Exploration Issues
[numbered list: file, problem, proposed action]

### Task Board Issues
[numbered list: issue, proposed action]

### Proposed Changes
[bulleted list of exactly what would be changed]

Apply these changes? (yes / review each / skip)
```

### On confirmation
- "yes" — apply all proposed changes
- "review each" — step through each change one at a time
- "skip" — exit without changes

---

## 3. `docs/claude-workflow.md`

The cross-project coordination doc. Two audiences: Claude (reads it to understand what's customized) and the developer (reads it when bootstrapping a new project or merging workflow updates).

### Structure

- Workflow version + date
- One-paragraph overview of the system
- File inventory table: each `.claude/` file → Generic or Custom → notes
- Doc structure (standard paths)
- Project-specific customizations from base
- Generic files safe to copy as-is
- Changelog

---

## 4. CLAUDE.md addition

Add a brief "Decisions" subsection under the Idea Pipeline section pointing to `docs/decisions.md`.

---

## Verification

1. Read `docs/decisions.md` — confirm all entries are accurate, none contradict the actual codebase
2. Run `/groom` — confirm it reads explorations + TASKS.md and prints a valid health report without touching files
3. Read `docs/claude-workflow.md` — confirm the file inventory is complete and the generic/custom split is correct
4. Start a new session, run `/backlog` — confirm it reads the new docs without errors
