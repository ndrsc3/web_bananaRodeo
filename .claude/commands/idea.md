# /idea — Capture and develop a new idea

Use this when a new idea surfaces — in a meeting, mid-conversation, or out of nowhere. The argument is the raw idea (e.g., `/idea banana confessional booth online`). If no argument is given, ask: "What's the idea?"

## Steps

1. **Capture the raw idea** — if provided as an argument, confirm it back in one sentence. If not, ask.

2. **Find the question** — ask: "What's the question or curiosity behind this?" Push for inquiry framing, not solution framing. What would building this help you find out? What community need or feeling does it address?

3. **Find the fit** — ask: "Why does this feel right for this project?" One sentence is fine. If the answer is "it's funny and absurd" — that counts.

4. **References** — ask: "Any references, examples, or inspiration?" Skip if the user seems ready to move on.

5. **Determine status:**
   - If you can answer "what is it + why does it fit" → `concept`
   - If it's still just a name/link/vibe → `seed`

6. **Create the exploration file** at `docs/explorations/<kebab-case-name>.md` using the standard format below. Populate what you know; leave sections as stubs where you don't.

7. **Ask:** "Want me to add this to the backlog in `docs/TASKS.md`?" If yes, add 1–2 stub tasks tagged `[PAGE: name]` or `[FEATURE]` under P3.

## Exploration file format

```markdown
---
status: seed | concept
tags: [page, feature, fx, easter-egg, content, game, audio, dx]
---

# [Name]

## The Question
What are we trying to find out or answer?

## Concept
What is it? Why does it fit this project?

## Key Questions
Open questions to answer before building.

## Rough UX / Notes

## Implementation Notes

## Plan
(populate when status → planned)

## References
```

## Tone

These ideas are often half-formed and ridiculous — that's fine, that's the point. Don't over-formalize. Capture the spirit, not just the facts. A one-line question is better than a polished brief.
