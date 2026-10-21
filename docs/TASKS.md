# Banana Rodeo — Task Board
<!-- [ ] todo  [~] in-progress  [x] done -->
<!-- P1=ship-blocker  P2=next-up  P3=someday -->

_Last touched: 2026-08-23_

---

## P1 — Ship Blockers

_(none)_

---

## P2 — Next Up

- [ ] [BUG] [PROD] **`/src/main.js` 404s on every page that injects the footer** — `public/templates/footer.html:26` has `<script src="/src/main.js" type="module">`, but `public/` is copied verbatim by Vite, so that path is never emitted and the request 404s **in production today** (`curl https://www.banana.rodeo/src/main.js` → 404). Every footer-injecting page pays a failed request + a console error, and whatever that tag was meant to load does not run. Decide whether the tag is redundant (pages already load their own entry) or whether something is silently missing. Found 260826 by the desktop UI smoke run.
- [ ] [BUG] [PAGE: photowall] [CURSOR] **Portrait photos barely scale the worn prop** — `REFERENCE_WIDTH` in `src/prop-cursor.ts` scales off the photo's *width*, but a portrait photo in the lightbox is *height*-constrained: a 556×828 photo clamps to `MIN_SCALE` and wears a 75px prop, against ~147px on a 1236px-wide landscape. Faces are not smaller in portrait shots, so this is backwards. Candidate: scale off height, off the smaller dimension, or off area. Measured 260826.
- [ ] [BUG] [DX] **`src/cursor.ts` `destroy()` cleans up nothing** — it queries `style[data-cursor-${this.containerElement.id}]`, an attribute it never sets, so neither the injected `cursor: none !important` style element nor the trail elements are removed. Latent today (**nothing calls `destroy()`**), but the system is live on 10+ pages via `[data-cursor-config]`, so it bites the first time an instance is torn down or a second one is created. Note it is unrelated to `src/prop-cursor.ts` (photowall does not opt into `cursor.ts`).

- [x] [PAGE: photowall] Random image selection from pool — manifest-driven random subset (22) on a salon-hang wall + Rehang reshuffle + empty state. Add photos: drop into `_capture/images/web_bananaRodeo/photowall/`, run `python knowledge/tools/process-images.py workSpace/web_bananaRodeo` (underScore image pipeline)
- [x] [PAGE: photowall] Picture frame layout + positioning — aspect-true JS masonry (no crop), realistic plaster wall, two switchable frame themes (mid-century wood / ornamental brass), hand-hung tilt + hover-straighten. Frame styles are graduation candidates → `components/` if reused elsewhere.
- [ ] [PAGE: gbbits] Church music/ambient audio
- [ ] [CURSOR] Custom banana cursor image asset
- [ ] [CURSOR] Tiny bananas emoji trail
- [ ] [DX] Make `api/` type-clean, then add it to `tsconfig.json` `include` so `npm run check` typechecks it. Today it has 25 errors, all TS2322: handlers typed `void` that `return res.status(…)`. `smoke` already proves every function loads; this would catch type bugs too.
- [ ] [DX] Before data-touching work: add a dev KV store, a second free Upstash database scoped to Development + Preview. Today every environment shares production KV (D4 in `_underScore/work/plans/active/261020-vercel-app-dev-process.md`).
- [ ] [DX] Establish CSS variable naming convention before designer onboards (`--color-{role}`, `--font-family-{role}` pattern)

---

## P3 — Backlog

### Sponsor Page (`/pages/sponsor-us`)
- [ ] [PAGE: sponsor-us] Fill in real 2026 event details (date, venue, expected attendance)
- [ ] [PAGE: sponsor-us] Add formal sponsorship tiers with dollar amounts
- [ ] [PAGE: sponsor-us] Add "Formed The BBB" LinkedIn link (currently TODO:: in page)
- [ ] [PAGE: sponsor-us] Add a nav link or share URL strategy (currently unlisted)

### Pages Not Yet Built
- [ ] [PAGE: digital-analogue-archive] 2D image library + PDF linking
- [ ] [PAGE: gbbits] Renaissance Banana Deity artwork + affirmations
- [ ] [PAGE: banana-meditation] Guided peeling animation + scrolling poem — see docs/explorations/banana-meditation.md
- [ ] [PAGE: banana-meditation] One-minute meditation timer
- [ ] [PAGE: banana-meditation] "We're Not Loading - This is a forced meditation" loading screen
- [ ] [PAGE: testimonials] Testimonials page
- [ ] [PAGE: loading] Loading page with 1 Minute Parks iframe embed
- [ ] [PAGE: banana-confessional] Audio confessional archive + experience — see docs/explorations/banana-confessional.md
- [ ] [PAGE: bananifestation] Reflective intro + intention ritual UX (standalone page) — see docs/explorations/bananifestation.md
- [ ] [PAGE: bananifestation] Quantum seed button → ceremonial number reveal (`getQuantumSeed()` abstraction + `crypto` fallback; source access pending)

### Photo Wall — follow-ups
- [ ] [PAGE: photowall] [CURSOR] **Prop stamps — leave your mark on the photos** → `docs/explorations/photowall-stamps.md`. Two halves of one build: the prop cursor scales up with the enlarged photo, then clicking stamps it on, persistently, for everyone. Build in order:
  - [x] **1. DOM prop-follower in the lightbox** — `src/prop-cursor.ts`: prop definitions (hotspot + intrinsic size) plus `createPropFollower()`, which hides the native cursor over one element and tracks the pointer with a scaled `<img>`. Wall thumbnails keep the native CSS cursor; the enlarged photo wears the follower, scaled to the photo's width. *Native `cursor: url()` can't do this: no scale knob, ~128px browser cap, and Safari SVG-cursor support is already suspect.* Bails to the native cursor on touch (no fine pointer).
  - [ ] **2. Local stamps** — click to place, render from an in-memory array, no persistence. Anchor is `{year, file}` + normalized `x`/`y` (0..1) — never wall geometry, which reshuffles on every Rehang.
  - [ ] **3. `api/stamps.ts`** — GET/POST `photowall:stamps:<year>:<file>` in the `api/guestbook.ts` KV idiom (list + cap + `ltrim`). Anonymous public write; the auth gate is client-side and is not a control.
  - [ ] **4. Stamps on the wall thumbnails** — batch read (or fold counts into the manifest fetch) so the wall visibly accumulates.
  - [ ] **Decide after step 2, not on paper:** stamp density/decay, per-visitor cap, undo-mine, per-year reset, mode toggle vs. click-to-stamp, mobile story.
- [ ] [PAGE: photowall] [CURSOR] Design more photobooth prop cursors — **specifically a "banantennae"** (banana deely-bopper antennae headband). Current set lives in `public/assets/icons/cursors/` (hand-authored SVGs); add new props to `PROPS` in `src/prop-cursor.ts` with a tuned hotspot **and the SVG's own `width`/`height` as `w`/`h`** — the follower needs both to place the hotspot at any scale, and a wrong size skews the prop everywhere but 1×.
- [ ] [PAGE: photowall] Refine rough cursor SVGs (cat-eye, cowboy hat, party hat, lips) — best-guess freehand shapes; tighten or commission cleaner art. Optionally render to PNG for guaranteed Safari support.

### Falling Bananas — Auth Page Upgrade
- [ ] [FEATURE] [FX] [EASTER] Implement falling bananas upgrade → `docs/plans/falling-bananas.md`

### Features & Easter Eggs
- [ ] [FEATURE] Countdown timer to event
- [ ] [FEATURE] Winamp-style media player
- [ ] [FEATURE] Sound event system
- [ ] [FEATURE] Mailbox/contact form
- [ ] [FEATURE] Random quotes system
- [ ] [FEATURE] Pop-up windows for guestbook entries
- [ ] [EASTER] Konami code
- [ ] [EASTER] "Not Stimulated Enough" clicker game
- [ ] [EASTER] Secret banana collection achievements
- [ ] [EASTER] Alternative passwords → easter egg routes
- [ ] [EASTER] Banana Magnifying Glass — spot the one different banana
- [ ] [FX] Matrix-style falling letters
- [ ] [FX] Text shake on hover
- [ ] [FX] Retro page transitions
- [ ] [FX] Snake-like mouse trail pattern

### Analytics (Phased)
- [ ] [ANALYTICS-P1] KV schema + API endpoints
- [ ] [ANALYTICS-P2] Admin stats dashboard (password-protected)
- [ ] [ANALYTICS-P2] ASCII art graphs
- [ ] [ANALYTICS-P3] Banana constellations / mood mandalas

### Dev / Build
- [ ] [DX] CSS linting
- [ ] [DX] HTML validation in build
- [ ] [DX] TypeScript strict improvements
- [ ] [DX] Code documentation standards
- [ ] [DX] Periodic CSS variable promotion review — scan for hardcoded colors used 3+ times, graduate to variables.css

---

## Done

- [x] [DEPLOY] Fix API 500s — added `"type": "module"` to package.json for `@vercel/node@5.x` ESM compat
- [x] [AUTH] Password-protected route handler working in production
- [x] [FX] Marquee scrolling — replaced deprecated `<marquee>` with CSS animations
- [x] [CURSOR] Custom cursor images (`cursor.ts`)
- [x] [CURSOR] Cursor trail system
- [x] [DX] `.cursorrules` established → removed, migrated to CLAUDE.md
- [x] [DX] CLAUDE.md created
- [x] [DX] `/ship` and `/new-page` skills created
- [x] [DX] `/backlog` skill created
- [x] [DX] Local task tracking system (`docs/TASKS.md`)
- [x] [DX] CSS organization audit — folder structure, variable gaps, file merges, conventions documented
- [x] [CSS] Merge `transitions.css` → `effects.css`, `icons.css` → `images.css`
- [x] [CSS] Add missing font variables (`--font-western`, `--font-handwritten`) to variables.css
- [x] [CSS] Add promotion-candidate comment block to variables.css
- [x] [CSS] Fix `st-section-label` — now prominent (navy bg, yellow text)
