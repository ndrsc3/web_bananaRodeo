# Plan: Falling Bananas — Auth Page Upgrade (2026)

> Exploration: `docs/explorations/falling-bananas.md`
> Build on test page first: `pages/tests/banana-rain-test.html`

---

## New Files

| File | Purpose |
|---|---|
| `pages/tests/banana-rain-test.html` | Isolated test page — build everything here first |
| `src/banana-hooks.ts` | General event emitter for all banana events |
| `src/banana-rain.ts` | Banana creation, variants, and rain management |
| `src/banana-audio.ts` | Audio system — load sounds, mute toggle, hook handlers |
| `src/banana-counter.ts` | Counter widget — personal (session) + collective (KV) |
| `api/banana-counter.ts` | Serverless: GET/POST community banana counter |
| `api/leaderboard.ts` | Serverless: GET/POST top-10 leaderboard |
| `pages/leaderboard.html` | Easter egg leaderboard page (pixel art) |
| `public/styles/pages/leaderboard.css` | Leaderboard pixel art styles |
| `public/assets/audio/banana-click.mp3` | Banana click sound (satisfying bloop) |
| `public/assets/audio/rotten-banana.mp3` | Sad clown sound (rotten banana event) |

## Modified Files

| File | Change |
|---|---|
| `public/styles/pages/index.css` | Counter widget restyle, banana variant styles, audio toggle |
| `public/templates/header.html` | Add `id="dancing-banana-3"` to 3rd banana (easter egg trigger) |
| `src/main.ts` | Register leaderboard easter egg click handler on header banana |
| `index.html` | Wire up all new modules, replace inline script |

---

## Phase 1 — Test Page + Hook System

### Step 1: Create the test page

Create `pages/tests/banana-rain-test.html` as a standalone page that mirrors the current `index.html` banana rain — no auth, no redirect. Just the rain, the counter display placeholder, and a fake "submit" button that triggers the leaderboard flow. This page stays separate from `index.html` throughout development.

No Vite template injection needed — write it as a plain HTML page with inline script imports via `type="module"`.

### Step 2: Create `src/banana-hooks.ts`

Simple typed event emitter. Events:

```ts
type BananaEvent =
  | 'banana:click'        // { banana, size, isGolden, isRotten }
  | 'banana:golden'       // { banana }
  | 'banana:rotten'       // { banana }
  | 'multiplier:start'    // { duration: number }
  | 'multiplier:end'      // {}
  | 'counter:personal'    // { value: number }
  | 'counter:collective'  // { value: number }
  | 'rain:reverse'        // { duration: number }
  | 'rain:shrink-all'     // {}
  | 'rain:restore'        // {}
```

Export a singleton `bananaHooks` instance. Any module can `bananaHooks.on(event, handler)` and `bananaHooks.emit(event, data)`.

### Step 3: Create `src/banana-rain.ts`

Extract banana creation logic out of the inline script in `index.html` into a proper module. Responsibilities:

- `startRain()` — begins the `setInterval`, stores active bananas in a Set
- `createBanana()` — picks size + variant, sets up click handler, appends to `#bananaRain`
- Variant roll: ~1/30 → golden, ~1/40 → rotten, else regular
- On click: emit `banana:click`, then `banana:golden` or `banana:rotten` as appropriate
- Listen to `rain:reverse` → invert fall animation direction for duration, then restore
- Listen to `rain:shrink-all` → force `.small` class on all active bananas
- Listen to `rain:restore` → remove forced `.small`, restore normal size classes

Golden banana: render with a CSS class `.banana-golden` (gold color + glow, same emoji 🍌 but styled — not a different emoji, keeping it subtle/discoverable)

Rotten banana: render with `.banana-rotten` (desaturated/brown tint via CSS filter)

---

## Phase 2 — Audio System

### Step 4: Create `src/banana-audio.ts`

- Preload both audio assets on init
- `play(sound: 'click' | 'rotten')` — plays if not muted
- `toggleMute()` — flips muted state, persists to `localStorage`
- Registers handlers: `banana:click` → play click sound, `banana:rotten` → play sad clown
- Default: **muted**

### Step 5: Add mute toggle button to test page

Web1.0 style button in the top-right corner of the page (fixed position, above the rain layer):

```
[ 🔇 SOUND OFF ]   ←→   [ 🔊 SOUND ON ]
```

Styled like a retro toolbar button. Clicking toggles audio and updates label.

### Step 6: Source audio assets

Find/create two audio files:
- `banana-click.mp3` — short, satisfying bloop (< 0.5s)
- `rotten-banana.mp3` — sad trombone / sad clown (1–2s)

Place in `public/assets/audio/`.

---

## Phase 3 — Banana Variants & Effects

### Step 7: Golden banana effects (hook handlers)

Register on `banana:golden`:
1. **Visual burst** — create a radial explosion of 10–15 small banana emojis that scatter from the click point and fade out (DOM-based, same pattern as existing split animation)
2. **Multiplier countdown** — emit `multiplier:start` with `duration: 10000`. Show a countdown widget ("🌟 ×5 BONUS — 9s"). Both personal and collective counts increment ×5 during this window (tracked locally — no extra API calls). On expiry emit `multiplier:end`, hide widget.

### Step 8: Rotten banana effects (hook handlers)

Register on `banana:rotten`:
1. Subtract 3 from personal count (floor at 0), emit `counter:personal`
2. Emit `rain:shrink-all` — all active bananas get `.small`
3. Emit `rain:reverse` with `duration: 5000` — bananas fall upward for 5 seconds
4. Play sad clown sound via audio hook
5. After 5s emit `rain:restore`

### Step 9: CSS for variants and effects

In `public/styles/pages/index.css`:

```css
.banana-golden {
  filter: drop-shadow(0 0 8px gold) sepia(0.3) saturate(2);
}

.banana-rotten {
  filter: grayscale(0.6) sepia(0.4) brightness(0.7);
}

/* Reverse fall — applied by JS when rain:reverse fires */
.banana-reverse {
  animation-direction: reverse;
}

/* Multiplier countdown widget */
.multiplier-widget {
  position: fixed;
  top: 20px;
  right: 80px; /* leave room for mute toggle */
  z-index: 100;
  font-family: var(--font-comic);
  background: gold;
  border: 3px solid #000;
  padding: 6px 12px;
  font-size: 1.2rem;
  animation: borderBlink 0.5s infinite;
}
```

---

## Phase 4 — Counter Widget

### Step 10: Create `api/banana-counter.ts`

```
GET  /api/banana-counter          → { total: number }
POST /api/banana-counter          → { total: number }   (increments by body.amount)
```

KV key: `banana:collective` → `{ total: number, lastUpdated: string }`

Increment respects multiplier server-side? No — keep it simple: client sends the correct amount (1 or 5 during multiplier). Server just stores the total.

### Step 11: Create `src/banana-counter.ts`

- `init()` — fetch collective total on load, render widget, subscribe to hook events
- On `counter:personal` → update personal display
- On `banana:click` → POST to `/api/banana-counter` with amount (1 or 5 if multiplier active), update collective display on response
- Widget renders two panels side by side

### Step 12: Restyle counter widget

Replace `.banana-counter` in `index.css` with a retro hit counter widget. Two panels:

```
┌──────────────────────┐  ┌──────────────────────────────────┐
│  YOUR BANANAS        │  │  THE BUNCH HAS COLLECTED         │
│  [ 0 0 0 4 2 ]       │  │  [ 0 0 1 2 4 7 ]                 │
└──────────────────────┘  └──────────────────────────────────┘
```

Styled with:
- Monospace/pixel font (existing `--font-mono` or Press Start 2P)
- Dark background, green or yellow LED digits
- Inset border to simulate a physical counter display
- Small label above each counter

---

## Phase 5 — Leaderboard

### Step 13: Create `api/leaderboard.ts`

```
GET  /api/leaderboard             → { entries: LeaderboardEntry[] }  (top 10, sorted by score desc)
POST /api/leaderboard             → { rank: number, entries: LeaderboardEntry[] }
     body: { name, phrase, score }
```

`LeaderboardEntry`: `{ name: string, phrase: string, score: number, timestamp: string }`

KV key: `leaderboard:entries` → JSON array, max 10, sorted by score descending. On new entry: insert in sorted position, evict #11 if present.

### Step 14: Create `pages/leaderboard.html`

Structure:
1. Pixel art header — "HALL OF GREAT BANANA COLLECTORS" in chunky pixel font
2. Top-10 table — rank, name, score, phrase
3. New entry row highlighted/blinking if arriving from auth flow (read `?highlight=rank` query param)
4. "ENTER SITE →" button at bottom — redirects to `?redirect=` destination or `/pages/home.html`
5. Auto-redirect after 15 seconds (countdown displayed)

Visual direction:
- Black background
- Banana yellow (`#FFD700`) + green (`#39FF14`) + white text
- Chunky pixel font (Press Start 2P via Google Fonts)
- Scanline overlay (CSS `repeating-linear-gradient` at low opacity)
- CRT glow on text (CSS `text-shadow`)
- Table rows with pixel border style

### Step 15: Create `public/styles/pages/leaderboard.css`

Full pixel art styling. Scanlines, glow, chunky table, blinking highlight for new entry.

### Step 16: Auth flow integration (in test page first)

When the fake "submit" button fires on the test page:
1. Lock personal score
2. POST score to `/api/leaderboard` (score-only check — `name: ''`, `phrase: ''`)
3. If `rank <= 10` OR `score >= 10`:
   - Show a modal overlay: "YOU MADE THE BOARD 🍌" + name input + phrase input + submit
   - On modal submit: POST full entry, redirect to `/pages/leaderboard.html?highlight={rank}&redirect={destination}`
4. Else: redirect straight to destination

Modal styling: same pixel art aesthetic, dark overlay, yellow border.

### Step 17: Header easter egg

In `public/templates/header.html`, add `id="dancing-banana-3"` to the 3rd `<img>`:

```html
<img src="/assets/gifs/DancingBanana.gif" alt="Dancing Banana" class="dancing-banana" id="dancing-banana-3">
```

In `src/main.ts`, register a click handler after DOM load:

```ts
const eb = document.getElementById('dancing-banana-3');
if (eb) eb.addEventListener('click', () => {
  window.location.href = '/pages/leaderboard.html';
});
```

Add a subtle `cursor: pointer` style on `#dancing-banana-3` (no other visual hint — pure discovery).

---

## Phase 6 — Wire to index.html 

Once everything is verified on the test page and confirmed by user:

1. Replace the inline `<script>` in `index.html` with module imports
2. Wire audio toggle button
3. Update `.banana-counter` markup to new two-panel widget
4. Integrate leaderboard flow into real `submitPassword()` function
5. Smoke test full auth → leaderboard → redirect flow

---

## Build Order Summary

```
1. pages/tests/banana-rain-test.html   (scaffold)
2. src/banana-hooks.ts                 (foundation)
3. src/banana-rain.ts                  (core logic)
4. src/banana-audio.ts + assets        (audio)
5. banana variants + effects (CSS+JS)  (golden, rotten)
6. api/banana-counter.ts               (KV)
7. src/banana-counter.ts + CSS         (widget)
8. api/leaderboard.ts                  (KV)
9. pages/leaderboard.html + CSS        (page)
10. Leaderboard auth flow              (modal + redirect)
11. Header easter egg                  (main.ts + header.html)
12. Wire everything to index.html      (final integration)
```
