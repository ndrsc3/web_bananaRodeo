---
status: concept
tags: [dx, feature, design]
---

# Style System Expansion — New Web1.0 Components & Themes

## The Question
What new visual styles should we add to the design system to support upcoming pages and keep the Web1.0/eclectic aesthetic growing? Which prototypes are worth promoting into `main.css`?

---

## Context

A style test page lives at `pages/tests/style-test.html`. It showcases all existing styles and the prototypes below. Use it as a visual reference when deciding what to build.

---

## Prototypes (all demoed in style-test.html)

### Ready-ish (clear use case)
- **Under Construction banner** — yellow/black diagonal caution tape stripe, blinking border. For coming-soon zones or WIP page dividers.
- **Webring nav strip** — prev/next navigation block. Decorative, could link between pages or just be retro furniture.
- **Award / Certificate badge** — gilded certificate frame. For sponsor recognition or science fair winners.

### Page-specific concepts

**Banana Confessional Phone Booth page:**
- **Confessional Booth panel** — dark wood (#1a0d00), amber/sepia tones, CRT scanline overlay, inset bevel screen. Intimate and slightly eerie. Could frame a form for anonymous confessions or display a rotating confessional queue.

**The Great Big Banana In The Sky (deity page):**
- **Renaissance altarpiece** — aged canvas, gilded frame with craquelure texture, chiaroscuro light, flat gold halo disc (Byzantine icon style), inscription plaque with faux Latin. Candle-flicker animation on scene.
  - Variant A: single devotional panel
  - Variant B: full triptych with scientist + cowboy as side-wing saints
- Direction: lean more Byzantine/icon (flat, gold leaf everywhere) vs. High Renaissance (softer, more painterly). Emoji do the figure work for now.

**Sponsor-us page / general:**
- **Neon Vegas / Casino** — black bg, colored neon glow signs (pink, cyan, yellow). Reno casino town energy. Works for event night atmosphere or sponsor callouts.
- **Glow cards** — like `.card-terminal` but 4 neon color variants: pink, cyan, orange, gold. Hover brightens glow.
- **Newspaper / Broadsheet** — 3-column "Reno Gazette" layout, Times New Roman, aged paper (#f5f0e8). For announcements or a fake period newspaper about the event.

**General / atmosphere:**
- **AIM / AOL chat window** — simulated AOL Instant Messenger. Could display organizer quotes, confessional messages, or chatroom-style content.
- **Reno High Desert Night** — deep purple/black Nevada night sky, silhouetted terrain, pink + blue neon signs. Good for location/atmosphere sections.

---

## Open Questions
- Should glow cards live in `components/cards.css` alongside existing card variants?
- Renaissance / confessional styles — are they page-specific (go in `pages/`) or general enough to be themes?
- Is the newspaper layout a layout component or a theme?
- Neon Vegas — standalone theme file or part of an expanded `themes/neon.css`?

---

## Next Steps
When revisiting: open `pages/tests/style-test.html` to review all visuals, then decide which to promote and where they belong in the CSS structure.
