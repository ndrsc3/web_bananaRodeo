# Plan: Banana Confessional — Listening Reliquary

> Exploration: `docs/explorations/banana-confessional.md`
> Prototype to graduate: `pages/tests/style-test.html` → `#proto-confessional`
> Build the curtain/booth/CRT in isolation first, wire audio last.

---

## Locked design (260603)

- **Listen-only reliquary** — no online submission in v1.
- **Threshold:** near-black page, a closed **wooden lattice screen** (carved confessional grille) centered, amber light leaking + faintly *breathing*, `ENTER THE BOOTH` prompt. Click slides the lattice aside (CSS) → reveals the interior; the **first confession starts on that same gesture** (satisfies autoplay).
- **Interior (260603 re-theme → "Celestial Uplink"):** the lattice parts to reveal a **shortwave/HAM rig** and triggers a power-on uplink sequence (hail the G.B.B.I.T.S. → no response → intercept). Amber **oscilloscope display** (graduated CRT, scope waveform + status, scanlines), glowing **tubes**, analog **signal/VU meter** (replaces equalizer), skyward **antenna**, speaker grille.
- **Controls (Hallicrafters S-108 reference):** horizontal frequency dial + sliding red needle, arc S-meter, Band selector (2024/2025/2026 — empty years = dead air + static), large **Tuner** knob (retune → next, white-noise burst + needle slide), large **Level** knob (volume steps), **Power** toggle (hold/resume). White noise via WebAudio (`src/static-noise.ts`). Bands derive from the year in each clip URL. (Replaced the phone receiver.)
- **Playback:** continuous auto-play, **shuffle-bag** (no near-term repeats) over a curated, pre-vetted clip pool. Anonymous — **no clip metadata on screen**, only atmospheric text.
- **Audio hosting:** **Vercel Blob** for clips + repo-committed `confessions.json` manifest. Frontend fetches manifest → shuffles → streams `<audio>`.
- **Styling:** standalone page stylesheet (own `:root`, own reset) per the project's standalone-page pattern — the booth is its own visual identity.
- **Navigation — unlisted, easter-egg entry.** No nav-bar link. The page is reached by clicking the **last (furthest-right, 7th) dancing banana** in the header. (The 3rd banana stays reserved for the falling-bananas leaderboard easter egg — no collision.) Header is site-wide, so the click handler lives in `src/main.ts` (loaded on every page) and navigates to `/pages/confessional.html`.
- **Audio prep — WAV → web.** Source clips are WAV (uncompressed, unusable for streaming). A processing pass converts each: mono MP3 ~64–96 kbps, EBU R128 loudness-normalized (consistent volume across the shuffle stream), **metadata stripped + anonymized filename** (`conf-NNN.mp3`) per the anonymity decision, optional silence-trim + `highpass=f=80`. Duration extracted via `ffprobe` for the manifest. ffmpeg 8.x confirmed available locally.

---

## New Files

| File | Purpose |
|---|---|
| `pages/confessional.html` | Page entry — header/footer templates, links standalone stylesheet, module script |
| `public/styles/pages/confessional.css` | Standalone stylesheet — curtain, booth interior, CRT, scanlines, equalizer, receiver, animations |
| `src/confessional.ts` | Page logic — manifest fetch, shuffle-bag, audio playback, curtain reveal, receiver/skip transport, screen state machine |
| `public/audio/confessions.json` | Manifest — list of clip URLs (+ optional duration). Committed; clips themselves live in Blob. **Anonymous — no year/name/title** (it's client-fetchable) |
| `scripts/process-confessions.ts` *(Phase 4)* | Read year-organized WAVs (timestamped names preserved) → ffmpeg web-prep (mono MP3, loudnorm, strip metadata, optional FX) → upload to Blob → regenerate manifest. Mirrors `process-images.py` |

## Source media layout (year-organized)

Imported source clips are organized by year, owner-side only:

```
_capture/audio/web_bananaRodeo/confessions/
  2022/*.wav
  2023/*.wav
  2024/*.wav
  2025/*.wav
```

(Matches the existing image convention, e.g. `_capture/images/web_bananaRodeo/photowall/2025/`.) **Source files keep their original date/timestamped names** (e.g. `20240628_143022.wav`) — already anonymous (a timestamp IDs no person), so no renaming. The pipeline preserves the timestamp into the published name and **strips embedded audio metadata** (`-map_metadata -1`) as hygiene. Anonymity is enforced at the **presentation layer** — the booth screen shows no date/name/metadata regardless of filename (atmospheric text only).

## Modified Files

| File | Change |
|---|---|
| `public/templates/header.html` | Add `id` to the **last (7th, furthest-right) dancing banana** as the confessional trigger |
| `src/main.ts` | Register click handler on the last header banana → navigate to `/pages/confessional.html` (header is site-wide, so this belongs in main.ts) |
| `package.json` | Add `@vercel/blob` dependency (not currently installed) |
| `docs/TASKS.md` | Replace exploration line with a single P3 task linking this plan |

---

## Phase 1 — Curtain → booth shell (no audio) ✅ DONE (260603)

> Built: `pages/confessional.html` + `public/styles/pages/confessional.css` + `src/confessional.ts`. Wooden-lattice reveal, booth interior with CRT/scanlines/equalizer, `closed → inside` state machine. Builds + lints clean. Live animation not yet visually verified — run `npm run dev` → `/pages/confessional.html`.

- Scaffold `pages/confessional.html` from `pages/template.html`; link `confessional.css`; `<script type="module" src="/src/confessional.ts">`.
- Build the closed **wooden lattice** threshold: centered grille on near-black, amber edge-glow with a slow breathing keyframe, `ENTER THE BOOTH` prompt, hand cursor near the curtain.
- Build the **POV booth interior** (graduate `proto-confessional`): wood-paneled vignette, central CRT screen, amber/sepia palette.
- State machine in `confessional.ts`: `closed → inside`. Click on the lattice runs the **part-and-reveal** animation (lattice slides aside, glow floods, interior fades in). No audio yet.
- **Autoplay note:** the reveal handler is the user gesture — Phase 3 will call `audio.play()` *synchronously* inside it.

## Phase 2 — Screen + receiver + equalizer ✅ DONE (folded into Phase 3, 260603)

- CRT screen states (text only, anonymous): `CONNECTION ESTABLISHED` → `RECEIVING…` → `PAUSED` → `TUNING…`. Blinking `RECEIVING…` indicator.
- CSS **equalizer** bars (animate while "playing", flatline when "paused").
- **Phone receiver** element with pick-up / hang-up visual states; a **skip** affordance (dial/button). Wire them to the state machine driving the screen + equalizer (drive with a placeholder timer for now).
- Optional web1.0 **`CONFESSIONS HEARD: 0042`** counter in a corner.

## Phase 3 — Audio layer ✅ DONE (260603)

> Built `src/confession-audio.ts` (ConfessionStream: manifest fetch, shuffle-bag, auto-advance, autoplay-safe cue) + wired into `confessional.ts`. Receiver = pause/resume, skip = next, CRT + equalizer gated to playback, fallbacks for blocked-autoplay + empty manifest. Serving path verified (page/manifest/MP3 all 200); audible playback not yet ear-verified — run `npm run dev`.

- Define manifest schema (see below); add 2–3 **local placeholder clips** in `public/audio/` for dev.
- `confessional.ts`: fetch manifest → build a **shuffle-bag** (exhaust pool before repeating) → single `<audio>` element.
- Wire gestures: reveal click → `play()` first clip; receiver pick-up/hang-up → play/pause; skip → next from bag; `ended` event → auto-advance.
- Graceful handling: empty/failed manifest (booth shows `LINE DEAD` / `NO SIGNAL`), and **autoplay-blocked fallback** (visible play affordance if the synchronous play() is still rejected).

## Phase 4 — Audio processing pipeline + Vercel Blob hosting ✅ DONE (260604)

> Blob hosting live: `process-confessions.ts` uploads via `@vercel/blob` when `BLOB_READ_WRITE_TOKEN` is set; 2024's 27 clips uploaded, `confessions.json` now holds public Blob URLs (sfo1, CORS `*`). `crossOrigin="anonymous"` added so the analyser reads cross-origin audio. Re-curate = drop WAVs in the year folder → `BLOB_READ_WRITE_TOKEN=… npm run process-confessions` → commit the manifest.

- `npm i @vercel/blob`; provision a Blob store for the project (needs `BLOB_READ_WRITE_TOKEN` in env).
- Build `scripts/process-confessions.ts` (mirrors `process-images.py`). Per WAV in `_capture/audio/web_bananaRodeo/confessions/<year>/`:
  - ffmpeg chain (baseline): `-ac 1 -af "afftdn,highpass=f=80,<FX>,loudnorm=I=-16:TP=-1.5:LRA=11" -b:a 64k -map_metadata -1` → MP3 (loudnorm last so output level is consistent after FX)
  - preserve the source timestamped name (e.g. `20240628_143022.mp3`)
  - `ffprobe` for duration
  - upload to Blob, collect URL
- **Locked default FX chain (260603):** `afftdn → highpass=f=300,lowpass=f=3400 → pitch ↓0.85 → aecho=0.8:0.9:50:0.25 (light reverb) → loudnorm`. Telephone hotline timbre + deeper/eerie register + light booth space. **Sample rate is read per-file** (`ffprobe`) so the pitch math is correct (sources are 48 kHz, not 44.1). `-ac 1 -b:a 64k -map_metadata -1`.
  - `pitch` factor tunable in the script (`PITCH = 0.85`); lower = deeper. *Aesthetic, not a privacy mechanism — a fixed shift is reversible.*
  - `lofi` → `acrusher=...` (degraded-archive grit) — available but off by default.
- **Status:** ✅ pipeline built (`scripts/process-confessions.ts`, `npm run process-confessions`) and run for 2024 — **27 clips**, ~13.7 min. Manifest `public/audio/confessions.json` committed with **public Blob URLs** (Phase 4 done — production audio works).
- Regenerate `public/audio/confessions.json` from the upload results (URLs + durations).
- Swap Phase 3's local placeholders for the Blob manifest. Curation thereafter: drop reviewed WAVs into the year folder → run the script → commit the regenerated manifest. No binaries in git.

## Phase 5 — Polish & integration

- Web1.0 texture: breathing amber on the closed lattice, scanlines, blink timing, optional confessions-heard counter, **leave-the-booth** (close the lattice → back to threshold).
- `prefers-reduced-motion` fallback for the curtain animation; mobile layout; receiver affordance labels so pause is discoverable.
- **Auth/cursor/counter:** internal pages run `handleAuthRedirect()` + `initializePageStats()` + `initializeCursor()` (see `src/main.ts`). `confessional.ts` must call these too (import them) so the page is gated and counted like the rest.
- **Entry trigger:** wire the last-header-banana click handler in `main.ts` and confirm it fires from every page (header is shared). Keep the banana visually identical (no hint) — it's an unlisted easter egg.

---

## Manifest schema

```json
{
  "clips": [
    { "url": "https://<blob-host>/conf-001.mp3", "duration": 47 },
    { "url": "https://<blob-host>/conf-002.mp3", "duration": 112 }
  ]
}
```

`duration` optional (used only to pace UI if needed). **No titles/years/names** — anonymity is a design decision, so the manifest intentionally carries no identifying metadata.

---

## Risks / open

- **Autoplay strictness (iOS/Safari):** must call `audio.play()` synchronously in the reveal click handler; keep the fallback play affordance from Phase 3.
- **Receiver-as-pause discoverability:** the metaphor is lovely but non-obvious — lean on labels / hover hints.
- **Blob setup:** needs a token in env; confirm Vercel Blob is provisioned for the project before Phase 4.
