# CSS Organization Plan

> Implemented: 2026-03-23

## Context

The site had grown to 20+ pages and 22 CSS files (~2,528 lines). The existing structure was solid, but three problems were compounding with growth: inline CSS in HTML files, no page-specific CSS convention, and duplicate/missing variables. This plan refined the system for sustainable growth without rewriting what works.

---

## Changes Made

### New Files
- `public/styles/animations/keyframes.css` — canonical home for all `@keyframes`
- `public/styles/layout/page-backgrounds.css` — body background theme classes
- `public/styles/pages/index.css` — extracted from `index.html` inline styles
- `public/styles/pages/thebananacard.css` — extracted from `thebananacard.html` inline styles

### Structural Changes
- `public/styles/web1/` → `public/styles/themes/` (rename)
- `public/styles/web1.css` → `public/styles/themes/web1.css` (moved)
- `public/styles/web1/bbs.css` → `public/styles/themes/bbs.css` (moved)
- `public/styles/web1/win98.css` → `public/styles/themes/win98.css` (moved)
- `public/styles/web1/guestbook.css` → `public/styles/themes/guestbook.css` (moved into main.css chain)
- Removed extra `<link>` to guestbook.css from `pages/guestbook.html`

### Consolidations
- `@keyframes blink` removed from: `footer.css`, `cards.css`, `themes/guestbook.css`
- `@keyframes shake` removed from: `effects.css`, `themes/guestbook.css` (canonical in keyframes.css)
- `@keyframes typing` moved from `themes/bbs.css` to `keyframes.css`
- All other `@keyframes` moved from `effects.css` to `keyframes.css`
- Page background classes moved from `sections.css` to `layout/page-backgrounds.css`

---

## Updated Directory Structure

```
public/styles/
├── main.css                     (restructured import order)
├── base/
│   ├── variables.css            (expanded with terminal/Win98/font tokens)
│   ├── reset.css
│   └── typography.css
├── layout/
│   ├── page-backgrounds.css     (NEW — body background themes)
│   ├── header.css
│   ├── footer.css
│   ├── page-stats.css
│   ├── grid.css
│   └── sections.css             (section content themes only)
├── components/
│   ├── buttons.css
│   ├── cards.css
│   ├── icons.css
│   ├── marquee.css
│   ├── images.css
│   └── tables.css
├── animations/
│   ├── keyframes.css            (NEW — all @keyframes)
│   ├── effects.css              (utility classes only, no @keyframes)
│   └── transitions.css
├── themes/                      (RENAMED from web1/)
│   ├── web1.css
│   ├── bbs.css
│   ├── win98.css
│   └── guestbook.css
├── pages/                       (NEW — page-specific CSS)
│   ├── index.css
│   └── thebananacard.css
└── utils/
    └── helpers.css
```

---

## Convention for New Pages

```html
<link rel="stylesheet" href="/styles/main.css">
<!-- Add only if the page has styles not in main.css -->
<link rel="stylesheet" href="/styles/pages/my-page.css">
```

**Put in `pages/<name>.css`**: page-specific layout, one-off animations, unique visual themes
**Put in `main.css` chain**: anything used on 2+ pages
**Keep inline**: only tiny overrides (3 lines or fewer)

---

## Naming Conventions

| Pattern | Usage | Examples |
|---|---|---|
| `<theme>-<element>` | Theme component parts | `win98-window`, `bbs-terminal`, `terminal-title` |
| `section-content-<variant>` | Themed section containers | `section-content-blue`, `section-content-graph` |
| `page-background-<name>` | Body background themes | `page-background-color2`, `page-background-black` |
| `card[-<variant>][-<element>]` | Card components | `card`, `card-western`, `card-western-title` |
| Flat utility | Helpers | `hidden`, `text-center`, `visually-hidden` |
| No prefix | Page-specific classes | `password-form`, `banana-rain` (in `pages/`) |
