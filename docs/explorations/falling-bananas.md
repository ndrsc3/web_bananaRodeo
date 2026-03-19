---
status: concept
tags: [feature, fx, easter-egg]
---

# Falling Bananas — Interaction Ideas

## The Question
How much more engaging is a homepage when it has something to *do* — and what's the right level of game-ness before it becomes annoying or distracting from the actual event?

---

## Interaction Concepts

### Clickable Bananas
- Make falling bananas clickable; each click increments a counter
- "Pop" or "splat" animation on click
- Challenge: timing and precision on moving targets

### Catch Game
- Add a basket or monkey at the bottom the user can move left/right
- Arrow keys or mouse movement to position
- Score increases on catch — more game-like than pure clicking

### Banana Treasure Hunt
- Hide clickable bananas throughout page content
- Some always visible, some only appear on hover
- Hot/cold hints to encourage page exploration

### Combo System
- Quick successive clicks give bonus points
- Different banana sizes = different point values
- Speed/accuracy multipliers add a skill ceiling

### Power-Ups (Golden Bananas)
- Rare golden banana drops trigger special effects:
  - Double points for a period
  - Slow fall speed
  - Make bananas larger/easier to click

### Social Counter
- Store a global banana count (localStorage or server-side KV)
- Show total bananas collected across all visitors
- Creates a shared community goal

### Achievement System
- Milestones unlock visual effects or features
- Example achievements:
  - **"Going Bananas"** — collect 50 bananas
  - **"Banana Master"** — click 10 in a row
  - **"Speed Peeler"** — collect 5 in 3 seconds

### Banana Physics
- Clicking splits a banana into smaller pieces
- Chain reactions possible
- Makes the interaction more tactile and satisfying

---

## Implementation Considerations

- **Performance** — many moving DOM elements; consider canvas rendering
- **Mobile** — touch events alongside click events
- **Visual feedback** — animation and sound on interaction
- **Difficulty balance** — should feel fun, not frustrating
