Run a health check on the exploration pipeline and task board. Read-only analysis first, then propose changes — never modify files without explicit confirmation.

## What to check

### 1. Exploration pipeline — read all `docs/explorations/*.md`

Flag each of these conditions:

- **Stuck seed**: `status: seed` with no content beyond a title (The Question is empty or just a placeholder)
- **Stale concept**: `status: concept` with unanswered Key Questions and no visible recent development
- **Explored but unplanned**: `status: explored` with no `## Plan` section content and no corresponding tasks in TASKS.md
- **Planned but orphaned**: `status: planned` with no corresponding tasks in TASKS.md

### 2. Task board — read `docs/TASKS.md`

Flag each of these conditions:

- **Done section oversize**: More than 10 items in the Done section → propose archiving oldest items to `docs/archive/TASKS-archive.md`
- **In-progress pile-up**: More than 3 `[~]` items → list them and ask if they're actually in progress
- **Stale board**: `_Last touched_` date older than 2 weeks → flag the date
- **Dead references**: Any `see docs/explorations/foo.md` links in TASKS.md where the file doesn't exist

## Output format

```
## Pipeline Health Report — [today's date]

### Exploration Issues
1. [filename]: [problem] → [proposed action]
2. ...

### Task Board Issues
1. [issue] → [proposed action]
2. ...

### Proposed Changes
- [exactly what would be changed, file by file]

Apply these changes? (yes / review each / skip)
```

If there are no issues in a section, write "No issues found."

## On user response

- **"yes"** — apply all proposed changes immediately
- **"review each"** — present each change one at a time and wait for confirmation before applying
- **"skip"** — exit without making any changes

Keep the health report concise. One line per issue. Don't editorialize — just name the problem and the proposed fix.
