---
status: concept
tags: [page, photowall, cursor, interaction, kv]
---

# Photo Wall — Prop Stamps

Turn the photo wall's prop cursors from decoration into a mark you can leave.
Click a photo to enlarge it, the prop cursor grows with it, and clicking again
**stamps** the prop onto the photo — where it stays, for everyone. The wall
stops being an archive we publish and becomes a gallery the crowd decorates.

## The Question

The wall already ships ten photobooth-prop cursors (goggles, hats, mustache,
lips, monocle) — but they only ever hover. Can the same prop become a *stamp*,
so visitors collectively dress up the photos, and the accumulated silliness
becomes the artifact?

## Concept

Two moves that look like two features and are actually one build:

1. **The prop scales with the photo.** Open the lightbox and the prop grows
   from cursor-size to photo-size — big goggles on a big face.
2. **Click to stamp.** In stamp mode the prop leaves an imprint at the click
   point. Imprints persist server-side and render for every later visitor, on
   the enlarged view and (ideally) on the wall thumbnail too.

## What already exists

| Piece | Where | Note |
|---|---|---|
| 10 prop cursors | `public/assets/icons/cursors/*.svg`, `PROPS` in `src/prop-cursor.ts` | Each carries a tuned hotspot (`hx`,`hy`) + the SVG's intrinsic size (`w`,`h`) |
| Prop follower | `createPropFollower()`, `src/prop-cursor.ts` | **Built** — the scaled DOM prop over the enlarged photo; the stamp preview |
| Cursor picker | `setupCursorPicker()`, `src/photowall.ts` | Sets `--frame-cursor` on `<body>`, remembers choice in `localStorage`, hands the prop to the follower |
| Cursor CSS | `public/styles/pages/photowall.css:190` (frames), `:337` (lightbox) | Both read the same var — same size in both by construction |
| Lightbox | `setupLightbox()`, `src/photowall.ts` | Click frame → enlarge; arrows/swipe/Esc |
| Per-year pools | `manifest.json` per year, `{file,w,h}` | Stable photo identity: `{year, file}` |
| Persistence idiom | `api/guestbook.ts` + `@vercel/kv` | List key, `lpush` + `ltrim` to a `MAX_ENTRIES` cap |

## The finding that couples the two halves

**A native CSS cursor cannot be enlarged the way this idea needs.**
`cursor: url(…)` takes the image at its intrinsic size — there is no scale
knob — and browsers cap custom cursors around 128×128 CSS px, silently
*dropping* the cursor when the image exceeds it. Safari's SVG-cursor support is
already flagged as shaky in `docs/TASKS.md`. So "enlarge the prop in the
lightbox" by shipping a second, bigger SVG per prop buys one fixed step up,
against the cap, on the least reliable path.

The alternative: **hide the native cursor over the lightbox image and follow the
pointer with a DOM `<img>`.** Arbitrary size, animatable, rotatable, no cap,
and it sidesteps the Safari SVG-cursor problem entirely.

That DOM follower *is* the stamp preview. You cannot build stamping without it,
and once you have it the "enlarge the cursor" half is free. **Build the follower
first; both halves fall out of it.** Keep the native cursor on the wall
thumbnails, where small is correct and the CSS var already works.

## Anchoring — the constraint that dictates the data model

Stamps cannot anchor to anything about the wall. `sample(pool, WALL_SIZE)`
reshuffles which 24 photos hang, `colSpan()` randomizes width, tilt is random
per frame, and column count is viewport-dependent — nothing about a frame's
position survives a Rehang, a resize, or another visitor.

Anchor to the **photo**, in the photo's own normalized space:

```ts
interface Stamp {
    id: string;        // uuid
    prop: string;      // PROPS id — 'tophat', 'granny-glasses', …
    x: number;         // 0..1, fraction of photo width
    y: number;         // 0..1, fraction of photo height
    scale: number;     // fraction of photo width the prop spans
    rot: number;       // degrees, for hand-placed wonkiness
    at: string;        // ISO timestamp
    by?: string;       // opaque client id, for "undo mine" + rate limiting
}
```

Key: `photowall:stamps:<year>:<file>` — reads are per-photo (the lightbox shows
one), so a key per photo matches the access pattern. Renders correctly at any
size, in the lightbox and on a thumbnail, forever.

## Key Questions

- **Where do stamps show?** Lightbox only is the cheap build. Thumbnails too is
  the actual payoff — you *see* the wall accumulate — but it means stamps for
  24 photos on every hang (batch endpoint, or fold stamp counts into the
  manifest fetch).
- **Who can stamp, and how do we not get wrecked?** The site's password gate is
  client-side `localStorage` (`src/auth.ts`) — friction, not a control. A public
  write endpoint is a public write endpoint. Existing idiom (per-key cap +
  `ltrim`) covers volume; still open: per-visitor cap, rate limit, admin purge,
  and whether a stamp is a shape from a fixed set (safe — it is) or ever
  free-form (not safe).
- **Density and decay.** Stamps accumulate forever; a beloved photo becomes an
  unreadable pile. Cap per photo? Fade or shrink older ones? A "hide stamps"
  toggle so the photo can still be seen? FIFO out at the cap, or first-come
  permanent?
- **Undo.** Can you remove your own stamp (needs the opaque client id) — or is
  the whole point that you can't take it back?
- **Reset boundary.** Does each event year's wall start clean, or do stamps ride
  along with the photos forever?
- **Does stamping have a mode?** Explicit toggle ("🖐 Stamp mode") vs. click-to-
  stamp being the default in the lightbox — which then competes with backdrop-
  click-to-close and prev/next.
- **Mobile.** No hover, no cursor. Tap-to-place-then-confirm? Or is stamping a
  desktop affordance and mobile is view-only?

## Rough UX / Notes

- Prop follows the pointer at photo scale, slightly translucent, with a gentle
  wobble — it reads as "not placed yet."
- Click → it snaps opaque, takes a small random rotation, and thunks into place
  (a stamp *sound* would earn its keep here; `[FEATURE] Sound event system` is
  already on the board).
- Existing stamps render beneath the follower so you can see what's taken.
- A stamp count per frame on the wall — a tiny corner badge — makes accumulation
  visible without loading every stamp.
- Reuses the existing picker wholesale: whichever prop is selected is the one
  you stamp. No new chrome except the mode toggle.
- Wants the **banantennae** and the other props already queued in `docs/TASKS.md`
  — stamping makes the size of the prop set matter a lot more.

## Build order

1. ~~**DOM prop-follower in the lightbox**~~ — **shipped**, `src/prop-cursor.ts`.
   Hides the native cursor over the enlarged photo and tracks the pointer with a
   scaled `<img>`. Ships the "enlarge the cursor" half on its own, no backend —
   and stamping's placement preview now exists.
2. **Local stamps** — click to place, render from an in-memory array, no
   persistence. Proves the anchoring math and the feel. The follower already
   knows the pointer position and the prop's rendered geometry; this step turns
   that into a normalized `(x, y)` and pins a copy.
3. **`api/stamps.ts`** — GET/POST on `photowall:stamps:<year>:<file>`, capped and
   rate-limited in the `api/guestbook.ts` idiom.
4. **Thumbnails** — batch read, render stamps (or just counts) on the wall.

Step 2 is a sitting and answers most of the Key Questions by making them
concrete. Don't decide density, decay, or moderation on paper — decide them
after step 2, on a wall with fifty stamps on it.

## References

- `src/prop-cursor.ts` — `PROPS`, `nativeCursor()`, `createPropFollower()` (step 1, built)
- `src/photowall.ts` — `setupCursorPicker()`, `setupLightbox()`
- `public/styles/pages/photowall.css` — `--frame-cursor` at :190 (frames), :337 (lightbox)
- `api/guestbook.ts` — the KV list + cap idiom this would follow
- `docs/photowall-pipeline.md` — how photos and manifests get to the wall
- `docs/TASKS.md` § Photo Wall — follow-ups — queued prop art (banantennae, SVG refinement)
