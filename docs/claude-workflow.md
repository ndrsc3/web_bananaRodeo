# Claude Workflow — banana-rodeo

Workflow version: v0.1 (2026-03)
Base: ndr-claude-workflow (pre-package)

## Overview

The workflow system treats development as inquiry-driven: ideas start as exploration files, get refined until they're understood, get planned (when complex), then built. A task board tracks actionable work. Skills (slash commands) handle recurring session patterns. Agents handle research tasks that would pollute the main context. A decisions doc captures the *why* behind architectural choices so they don't get re-litigated each session.

Core components: skills in `.claude/commands/`, agents in `.claude/agents/`, exploration files in `docs/explorations/`, a task board at `docs/TASKS.md`, and an architectural decisions log at `docs/decisions.md`.

---

## File Inventory

| File | Generic or Custom | Notes |
|---|---|---|
| `.claude/commands/backlog.md` | Generic | Session-start brief; reads TASKS.md + explorations |
| `.claude/commands/explore.md` | Generic | Inquiry session on a named exploration |
| `.claude/commands/idea.md` | Generic | Captures new idea → creates exploration file |
| `.claude/commands/groom.md` | Generic | Pipeline health check; proposes stale-entry cleanup |
| `.claude/commands/ship.md` | **Custom** | Build → lint → commit → push; Vercel-specific |
| `.claude/commands/new-page.md` | **Custom** | Scaffolds HTML page with Banana Rodeo structure |
| `.claude/agents/backlog.md` | Generic | Research agent for backlog skill |
| `.claude/agents/explore.md` | Generic | Research agent for explore skill |
| `docs/TASKS.md` | Generic structure, custom content | Three-tier board; content is project-specific |
| `docs/decisions.md` | Generic structure, custom content | ADR log; decisions are project-specific |
| `docs/claude-workflow.md` | Generic structure, custom content | This file; inventory + changelog |
| `docs/explorations/` | **Custom** | All content is project-specific |
| `docs/plans/` | Generic structure, custom content | Complex feature plans; content is project-specific |
| `CLAUDE.md` | **Custom** | Project instructions; entirely project-specific |

---

## Doc Structure

```
docs/
  decisions.md          ← architectural ADR log
  claude-workflow.md    ← this file
  TASKS.md              ← task board (P1/P2/P3 + Done)
  explorations/         ← one file per idea, any status
  plans/                ← detailed plans for complex features
  archive/              ← archived task board entries
```

---

## Project-Specific Customizations

These differ from what a generic workflow base would provide:

- **`/new-page`** — scaffolds HTML using Banana Rodeo conventions: `page-background-color` body class, `glitch` h1, `section-content-win98` panels, Vite script tag, comment placeholders for shared templates
- **`/ship`** — runs `npm run build` + `npm run lint` before committing; pushes to `main` which triggers Vercel auto-deploy
- **TASKS.md tags** — includes `[ANALYTICS-Pn]` tier (P1/P2/P3 phased analytics rollout) not present in the generic base
- **`docs/explorations/`** — all content is project-specific (banana-themed features, event-specific pages, etc.)
- **`CLAUDE.md`** — documents Banana Rodeo architecture, HTML conventions, Vercel KV data schema, environment variables

---

## Generic Files (safe to copy to a new project as-is)

These files contain no project-specific content and can be used as a starting point in other projects:

- `.claude/agents/backlog.md`
- `.claude/agents/explore.md`
- `.claude/commands/backlog.md`
- `.claude/commands/explore.md`
- `.claude/commands/idea.md`
- `.claude/commands/groom.md`
- `docs/TASKS.md` structure (three-tier board format, not content)
- `docs/decisions.md` structure (ADR format, not content)
- `docs/claude-workflow.md` structure (this file, not content)

When copying to a new project: replace all content in TASKS.md, decisions.md, and explorations/. Update the File Inventory table and Project-Specific Customizations section in this file.

---

## Changelog

- **2026-03-17** — Initial workflow setup: TASKS.md, explorations/, docs/plans/, CLAUDE.md
- **2026-03-17** — Added `/ship` and `/new-page` skills, `/backlog` skill
- **2026-03-18** — Added backlog and explore agents, `/idea` and `/explore` skills
- **2026-03-18** — Added `docs/decisions.md`, `docs/claude-workflow.md`, `/groom` skill (v0.1 baseline)
