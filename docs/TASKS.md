# Banana Rodeo — Task Board
<!-- [ ] todo  [~] in-progress  [x] done -->
<!-- P1=ship-blocker  P2=next-up  P3=someday -->

_Last touched: 2026-03-31_

---

## P1 — Ship Blockers

_(none)_

---

## P2 — Next Up

- [~] [PAGE: photowall] Random image selection from pool
- [ ] [PAGE: photowall] Picture frame layout + positioning
- [ ] [PAGE: gbbits] Church music/ambient audio
- [ ] [CURSOR] Custom banana cursor image asset
- [ ] [CURSOR] Tiny bananas emoji trail
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
