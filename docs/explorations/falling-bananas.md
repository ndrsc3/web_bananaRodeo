---
status: planned
tags: [feature, fx, easter-egg]
---

# Falling Bananas — Interaction Upgrade (2026)

## The Question

How much more engaging can the auth page be — and what's the right level of game-ness before it overstays its welcome?

**Answered:** The 24-hour auth session and always-available password skip mean the experience can have real depth. People who want in can skip; people who want to play have something to discover.

---

## Decisions

- **Page role:** Main auth gate, stays. Banana rain is the primary entertainment while waiting to log in.
- **Interaction direction:** Eye candy that rewards curiosity — layers of discovery, not a forced game.
- **Community counter:** KV-backed global total. "The Bunch has collected X bananas." Replaces/extends the local-only counter.
- **Golden banana:** Rare drop (~1 in 30). Triggers visual burst + 10-second countdown multiplier on community counter.
- **Rotten banana:** Rare drop (opposite of golden). Subtracts from personal count, turns all bananas small, briefly reverses fall direction upward. Sad clown sound. Pin animation deferred.
- **Audio system:** Sound effects on banana click + rotten banana event. General hook architecture.
- **Counter widget:** Restyled as retro Web1.0 hit counter. Two displays — Personal Count (session) and Collective Count (community KV total).
- **Leaderboard:** Atari-style easter egg. Score locked at password submit. Shown if top 10 OR 10+ bananas collected. Player enters name + one-liner. Chunky pixel art, limited palette tied to Banana Rodeo Web1.0 colors. Accessible via auth flow AND as a hidden easter egg somewhere on the site.
- **Leaderboard storage:** KV-backed, persistent, top 10 entries.

---

## Concepts Considered (not in scope for now)

- Catch game / basket mechanic
- Combo system with multipliers
- Marquee text that reacts to click count
- Milestone community celebrations (shared visual burst at counter milestones)
- Rain density escalation on sustained clicking
- Floating combo feedback text

---

## Plan

### Architecture: Hook System

Build a general `BananaEventHooks` system first. Every banana event (click, golden, rotten, score milestone) fires through it, and effects are registered as handlers. This makes all future additions plug-and-play.

```
Events: banana:click, banana:golden, banana:rotten, counter:personal-update, counter:collective-update
```

### Phase 1 — Hook System + Audio

1. Create `src/banana-hooks.ts` — event emitter for banana events
2. Create `src/banana-audio.ts` — load and play sound effects; register handlers on `banana:click` and `banana:rotten`
3. Source/create sound assets: banana click (satisfying bloop), sad clown (rotten event)
4. Add mute toggle button to the page (Web1.0 style, defaulting to... TBD)

### Phase 2 — Banana Variants

5. Add golden banana variant to `createBanana()` (~1 in 30 chance, 🌟🍌 or styled differently)
6. Add rotten banana variant (~1 in 40 chance, 🍌 with visual indicator — brown/dark)
7. Wire golden → hook: burst effect + 10s multiplier countdown display
8. Wire rotten → hook: subtract personal count + shrink all bananas + reverse fall + play sad clown
9. After 10s, restore normal banana behavior

### Phase 3 — Counter Widget Restyle

10. Restyle `.banana-counter` as retro hit counter widget
11. Split into two displays: Personal Count (session) + Collective Count (KV total)
12. Add `GET /api/banana-counter` endpoint (read community total)
13. Add `POST /api/banana-counter` endpoint (increment, called on banana:click, respects multiplier)
14. Wire collective counter updates through hook system

### Phase 4 — Leaderboard

15. Design `pages/leaderboard.html` — chunky pixel art, limited palette (banana yellow/green/black), Web1.0 textures, top 10 table with name + phrase + score
16. Add KV schema: `leaderboard:entries` → sorted list of `{ name, phrase, score, timestamp }`
17. Add `POST /api/leaderboard` — submit score + entry, returns rank
18. Add `GET /api/leaderboard` — returns top 10
19. On password submit success: POST score → if rank ≤ 10 OR score ≥ 10, show name/phrase entry modal → on submit, redirect to leaderboard page → leaderboard auto-redirects to site after display
20. Add leaderboard easter egg link somewhere in the site (location TBD)

### Deferred

- Rotten banana pin/splat animation
- Milestone community celebrations (hook attachment point already exists)
- Combo feedback floating text

---

## Open / TBD

- Golden banana visual — emoji variant vs. CSS styled element? → CSS class on same emoji (subtle/discoverable)

## Resolved

- Audio default: **muted**, visible toggle button to unmute
- Leaderboard easter egg: **3rd dancing banana in the site header** (`id="dancing-banana-3"`)
- Full implementation plan: `docs/plans/falling-bananas.md`
