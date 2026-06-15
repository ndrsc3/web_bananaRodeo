# Sponsor & vendor logos

Organized by year so each year's roster is a complete, self-contained snapshot.

```
partners/
  2025/       every sponsor shown in that year's "Celebrating the past!" section
  2026/       every current sponsor (new + returning) — referenced by the live 2026 section
  _vendors/   food/drink vendors (vendors section was retired from the page 260612)
  _archive/   logos not tied to a confirmed sponsor-year (prospects, commented-out)
```

## Adding a returning sponsor next year

A returning sponsor's logo already lives in the prior year's folder — copy it forward:

```bash
cp public/assets/partners/2026/logo_Stellar.png public/assets/partners/2027/
```

Then add their `<a class="partner-card">` block in `pages/sponsors-vendors.html` pointing at the new path. No need to re-source or re-process a logo we already have.

## Adding a brand-new sponsor

Drop the original into `_capture/images/web_bananaRodeo/2026-Sponsors/` (underScore), run the
image pipeline to optimize it into this year's folder, then add the card:

```bash
python knowledge/tools/process-images.py workSpace/web_bananaRodeo --target sponsors-2026
```

New logos land as optimized `.webp`; returning logos copied forward keep their original format.
Always verify a sponsor's website resolves before linking it (no placeholder/guessed URLs).
