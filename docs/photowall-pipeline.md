# Photo Wall & Image Pipeline — Runbook

How raw event photos become the year-tabbed photo wall on banana.rodeo. Follow
this whenever a new batch of photos arrives or a new event year needs a wall.

Site images are **never committed by hand.** Raw camera files (any format/size,
including iPhone HEIC) are dropped into the underScore `_capture/` intake and
normalized to web-optimized WebP by a shared tool. Only the WebP + a
`manifest.json` are committed and deployed.

## The pieces

| Piece | Path | Role |
|---|---|---|
| Intake | `_capture/images/web_bananaRodeo/photowall/<year>/` *(underScore root)* | Drop raw originals here, one folder per event year |
| Tool | `knowledge/tools/process-images.py` *(underScore root)* | Auto-orients, resizes, converts to WebP, strips metadata, writes the manifest |
| Config | `image-pipeline.toml` *(this repo root)* | One `[[target]]` per year: `photowall-<year>` |
| Output | `public/assets/photowall/<year>/*.webp` + `manifest.json` | Committed, deployed to Vercel |
| Frontend | `src/photowall.ts` — the `YEARS` array | Newest-first year tabs; opens on `YEARS[0]` |
| Archive | `_library/images/web_bananaRodeo/photowall/<year>/` | Where originals go if you `--drain` |

The wall shows **one year at a time** — each year is a self-contained pool
(output folder + manifest). The frontend fetches `/assets/photowall/<year>/manifest.json`
for the selected tab. Manifest entries carry `{file, w, h}` so frames lay out by
true aspect ratio without layout shift.

## Runbook

All image-processing commands run from the **underScore repo root**, with the
project path pointing at the web worktree that holds `image-pipeline.toml`.
Do the work in a feature worktree per the repo's Git Workflow — not on `main`.

### 1. Land the originals in the right intake

Photos often arrive misfiled (e.g. dumped under `_capture/audio/…` or a phone's
export folder). Normalize them to the year's intake folder:

```
_capture/images/web_bananaRodeo/photowall/<year>/
```

Mixed formats are fine — the tool reads HEIC/JPG/PNG/etc. and outputs WebP.

### 2. If this is a NEW year, register it in two places

**a. Add a pipeline target** in `image-pipeline.toml` (copy an existing
`photowall-<year>` block, bump the year):

```toml
[[target]]
name     = "photowall-<year>"
intake   = "web_bananaRodeo/photowall/<year>"
output   = "public/assets/photowall/<year>"
max_edge = 1600
format   = "webp"
quality  = 80
manifest = true
```

**b. Prepend the year** to `YEARS` in `src/photowall.ts` (newest-first — the
first entry is the default tab):

```ts
const YEARS = ['<year>', '2026', '2025', '2024'] as const;
```

*(An existing year that just gained more photos needs neither step — skip to 3.)*

### 3. Process — dry-run first, then for real

```bash
# from underScore root; --dry-run writes nothing, just reports
python3 knowledge/tools/process-images.py workSpace/web_bananaRodeo-<worktree> --dry-run

# process a single year's target
python3 knowledge/tools/process-images.py workSpace/web_bananaRodeo-<worktree> --target photowall-<year>
```

Re-runs are idempotent — deterministic slug names mean a re-process overwrites
rather than multiplies. Omit `--target` to process every target (all years +
sponsors); prefer per-target to keep the diff scoped.

### 4. Build & verify before committing

```bash
npm run lint && npm run build
```

Confirm `dist/assets/photowall/<year>/` has the expected WebP count and a
`manifest.json` with a matching entry count, and that no stale flat `*.webp`
sit at `public/assets/photowall/` root (years live in subfolders).

### 5. Ship it

Commit (config + `photowall.ts` + the new `public/assets/photowall/<year>/`
WebP & manifest), push the feature branch, open a **PR into `development`**,
validate the year tabs on the preview deploy, then fast-forward `main`. Full
flow — including the post-publish worktree refresh — is in **CLAUDE.md → Git
Workflow**. Don't skip the `web_bananaRodeo-dev` fast-forward.

### 6. Originals — drain or leave

Once the change is validated/merged, archive the originals out of `_capture` so
re-runs don't reprocess them and the intake stays clean:

```bash
python3 knowledge/tools/process-images.py workSpace/web_bananaRodeo-<worktree> --target photowall-<year> --drain
```

`--drain` moves the processed originals to `_library/images/web_bananaRodeo/photowall/<year>/`
(subfolder layout preserved). **Leave them in `_capture` if you might re-run** —
draining is a one-way move. This is a deliberate call each time, not automatic.

## Notes & gotchas

- **Run location matters.** The tool resolves `_capture/` and `_library/`
  relative to the *underScore* repo root, and the intake/output relative to the
  *project path* you pass. Run it from underScore root, point it at the worktree.
- **Unsupported files are skipped, not converted** — the tool warns and moves on
  (e.g. a stray `.mov`). Convert or remove them from the intake first.
- **`.svg` passes through verbatim** (already web-optimal) — relevant for sponsor
  logos, not photos.
- **Adding a year is three edits** total: intake folder + `image-pipeline.toml`
  target + `YEARS` entry. Miss the `YEARS` entry and the photos deploy but get no
  tab; miss the target and there's nothing to tab to.
- Full tool reference / design: `knowledge/tools/process-images.py` docstring and
  `underScore/work/plans/active/260603-image-pipeline.md`.
