---
status: concept
tags: [page, feature, fx, content]
---

# The Mantle

A page that recreates the **La Finka mantle** — red-brick corner fireplace, wood
mantel shelf with its brass figurines / tribal mask / lava lamp, the brass-trimmed
firebox — with a **live "digital frame"** composited into the seascape painting
above the mantel. The frame cycles through the **JCPenney-shoot photos**, processed
through the same underScore image pipeline as the photo wall.

## The Question
Can a web page feel like *standing in the room* at La Finka — and can a fixed
domestic object (a framed painting over a fireplace) become a living, rotating
window that makes the space feel inhabited and current?

## Concept
Take the real photo of the La Finka mantle as the backdrop and overlay a digital
photo-frame exactly where the seascape painting hangs. The painting's real wood
frame, brick, brass, and lava lamp all stay; only the "canvas" comes alive as a
slideshow of the JCPenney shoot. Same lo-fi, web1.0, warm-retro aesthetic as the
rest of the site.

## Versions
- **v1 — real photo + live frame (this build).** Processed room photo as backdrop;
  a crossfading slideshow inside the painting, *contain on a dark screen* so portrait
  and landscape shots both sit cleanly. JCPenney photos via the `mantle` pipeline target.
- **v2 — stylized recreation (separate, later).** Rebuild the mantle scene in CSS /
  pixel art / web1.0 instead of a photo. More "playable", sets up the animated fire.
- **Future — the living fire.** Make the firebox flames alive. Candidate styles to play
  with: (a) web1.0 animated-GIF flames, (b) pixelated retro-videogame fire, (c) a photo
  collage that flickers. Undecided — this is the "we'll play with it" surface.

## Key Questions
- Exact placement of the digital frame over the painting (tuned via CSS `--screen-*`
  vars against the real backdrop). v1 ships a best estimate to refine on preview.
- Slideshow pacing / transition (v1: ~5s crossfade, click to advance).
- Does the frame get a subtle "screen" glow to read as digital, or stay photoreal?
- Eventually: which fire style wins, and does the fire react (to time of day? hover? a button)?
- Could other mantel objects become interactive later (lava lamp blubs, mask speaks)?

## Implementation Notes
- **Backdrop:** `mantle-backdrop` pipeline target → `public/assets/mantle/backdrop/`
  (single optimized webp, no manifest). Source: `IMG_4872.jpg` (the real mantle).
- **Slideshow pool:** `mantle` target → `public/assets/mantle/` + `manifest.json`.
  Drop JCPenney originals into `_capture/images/web_bananaRodeo/mantle/`, run the pipeline.
- **Overlay:** `<img>` backdrop + an absolutely-positioned `.mantle-frame` in % coords so
  alignment holds across viewport widths. Two stacked `<img>` elements crossfade.
- Page: `pages/mantle.html`, `src/mantle.ts`, `public/styles/pages/mantle.css`.

## Plan
(populate when status → planned)

## References
- `IMG_4872.jpg` — the real La Finka mantle (backdrop source)
- Sibling: the photo wall (`docs/explorations/bananifestation.md` is unrelated; the
  photowall feature is the shared image-pipeline consumer pattern)
