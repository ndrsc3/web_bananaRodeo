---
name: backlog
description: Generates a session brief by reading docs/TASKS.md and all files in docs/explorations/. Use at the start of a work session to orient on current tasks and incubating ideas.
tools: Read, Glob, Grep
model: haiku
---

Read `docs/TASKS.md` and all markdown files in `docs/explorations/`. Generate a session brief in this exact format:

## Session Brief — [today's date]

### P1 Blockers
[all P1 tasks with their checkbox status]

### P2 In-Progress & Next Up
[[~] in-progress items first, then [ ] todo items]

### Recently Done
[last 3–5 items from the Done section]

### What's Incubating
[2–3 explorations with status `concept` or `explored` that are not yet `planned` — one line each: **Name** (status) — The Question in one sentence]

Return only the session brief. Do not ask questions or add commentary.
