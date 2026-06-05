---
status: planned
tags: [page, audio, event]
---

# Banana Confessional

An interactive page built around the real-world Banana Confessional booth — a physical confessional set up at the event where attendees record audio confessions. Years of recordings have been archived.

## The Question
Can we bring a physical, intimate event experience (the confessional booth) to the web in a way that preserves its strangeness — and what does it mean to archive absurd, personal audio in a community context?

## Concept

A **listening reliquary**, not a recording booth. Listen-only; submission is out of scope for v1.

**Framing (260603 re-theme — "Celestial Uplink"):** a shortwave/HAM rig is trying to raise the **Great Big Banana In The Sky** (G.B.B.I.T.S., the patron deity). The heavens don't answer — but the antenna **intercepts the prayers others are beaming up to it.** Those intercepted transmissions *are* the confessions. The eavesdropping drama is preserved, and the locked audio FX (telephone band + pitch-down + reverb) now reads as a degraded intercepted signal. (Replaces the earlier phone-confessional booth metaphor.)

## Decisions (260603 inquiry session)

- **Core act — listen, don't confess.** A reliquary. Visitors hear the archive; there is no online submission in v1. (Keeps scope tight and is the most on-brand framing: you're the eavesdropper.)
- **Surfacing — continuous broadcast.** Confessions auto-play one after another, like dropping into a late-night station mid-thought. Lean-back / ambient. Minimal transport: **pause** (stop a voice mid-confession) and **skip/next**. No browse list, no catalog — the stream is the experience.
- **Stream order — shuffle.** Randomized each visit. Ideally no repeats within a single session until the pool is exhausted (shuffle-bag, not pure random) so a short sitting doesn't replay the same confession.
- **Threshold — step inside first.** You land on a dark, closed booth. One deliberate act ("ENTER THE BOOTH" / pull the curtain) starts the stream. Ritual entry that builds anticipation — and cleanly satisfies browser autoplay policy (audio needs a user gesture). *The mechanic is locked; the visual treatment of "inside" is open — see Open Questions.*
- **On-screen presentation — anonymous / atmospheric.** The CRT screen shows **no identifying clip metadata** (no name, no year, no booth #). Only atmospheric / transmission text — e.g. `CONNECTION ESTABLISHED`, `RECEIVING…`, equalizer bars. Confessions are presented anonymously; the screen sells mood, not data.
- **Content & consent — curated, pre-vetted.** Consent is covered by the event media policy. Recordings are **reviewed and curated by a human before they're published to the web**. So moderation is an offline curation step, not a runtime feature — the page only ever plays what's already been blessed. No removal-request UI needed at launch.
- **UI metaphor — the rig.** Graduated the `proto-confessional` wood/CRT aesthetic into a shortwave radio set (scope, tubes, dials). Web1.0 texture: scanlines, blinking cursor, analog meters.
- **Visual direction — curtain parts → power-on.** Near-black page, a closed **wooden lattice** dead center, amber light leaking + faintly *breathing*, an `OPEN THE CHANNEL` prompt. Click slides the lattice aside, revealing the rig, **and triggers the power-on uplink sequence** (`INITIATING UPLINK… → HAILING THE HEAVENS… → …NO RESPONSE → ⚠ SIGNAL INTERCEPTED`), at which point the first transmission plays.
- **Interior — the rig (Hallicrafters S-108 reference).** Behind the lattice: a wooden cabinet with a brushed-steel control panel. A **horizontal frequency dial** with a **sliding red needle** + frequency readout, an arc **S-meter** (jitters on signal), an **antenna**, speaker grille. **Controls: Band selector** (2024 / 2025 / 2026 — years with no clips = dead air + static), a large **Tuner** knob (retune → next interception; spins; fires a **white-noise burst** + slides the needle), a large **Level** knob (volume steps), and a **Power** toggle (hold / resume). White noise (WebAudio) also fires on band change. Replaced the phone receiver.
- **Audio hosting — Vercel Blob + JSON manifest.** Audio files live in Vercel Blob (CDN-served, out of git); a repo-committed `confessions.json` manifest lists clip URLs (+ duration for the shuffle-bag). Frontend fetches manifest → shuffles → streams via `<audio>`. Curation = upload clip + update manifest, decoupled from code deploys (mirrors the existing image-pipeline model). Start small; scales as the archive grows.
- **Navigation — unlisted easter egg.** No nav-bar link. Reached by clicking the **last (furthest-right) dancing banana** in the header. (3rd banana stays reserved for the falling-bananas leaderboard.)
- **Source media — organized by year.** Imported WAVs live in `_capture/audio/web_bananaRodeo/confessions/<year>/` (matches the image convention). Source files keep their **date/timestamped names** (already anonymous — a timestamp IDs no person); no renaming. Anonymity is enforced at the **presentation layer**: the booth screen shows no date/name/metadata regardless.
- **Audio FX — telephone + pitch-down by default.** Default processing applies a telephone bandpass (300–3400 Hz, on-theme with the receiver) **and a pitch shift down** (deeper/eerie register). Reverb and lo-fi grit are additional opt-in FX. Baseline is denoise + loudnorm; FX are tunable config flags, raw kept alongside processed. Pitch is aesthetic, not a privacy mechanism (a fixed shift is reversible). (ffmpeg has no `rubberband`, so pitch uses the `asetrate`/`atempo` trick — lo-fi quality, which suits the aesthetic.)

## Plan

Implementation plan: `docs/plans/banana-confessional.md` (5 phases — curtain/booth shell → screen+receiver states → audio + shuffle-bag → Vercel Blob → polish & integration).

One small decision deferred to build time (noted in the plan): final receiver-affordance labeling so "hang up to pause" is discoverable.

## Rough UX / Notes

- Booth aesthetic: dark, candlelit, wooden paneling, a slot or window; amber CRT screen as the focal "transmission" display.
- Playback minimal — let the audio be the focus. Transport = pause + skip.
- Web1.0 elements: blinking "RECEIVING…" indicator, retro equalizer bars while a confession plays.
- Shuffle-bag playback (no near-term repeats) over a curated, pre-reviewed clip pool.
- Prototype already exists (`proto-confessional`) — graduates to a standalone page stylesheet (`public/styles/pages/`) per the project's standalone-page pattern, since the booth is its own visual identity.

## References

- Physical booth present at Banana Rodeo event since ~2022
- Multi-year audio archive exists locally (curated/reviewed per media policy before web publish)
- Prototype component: `pages/tests/style-test.html` → `#proto-confessional`
