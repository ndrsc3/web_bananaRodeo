# /new-page — Scaffold a new HTML page

Use this command when the user wants to add a new page to the site. The argument is the page name (e.g., `/new-page schedule`).

## Steps

1. **Clarify intent** — ask the user:
   - What is the page's title (shown in browser tab and OG tags)?
   - What is the URL path it should live at (e.g., `/pages/schedule`)?
   - Should it include the `<!-- CHAT-MARQUEE -->` template? (most pages don't, guestbook-adjacent pages do)
   - What body background class? Options are `page-background-color` or `page-background-color2` (darker)

2. **Create the HTML file** at `pages/<name>.html` using this exact structure:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <title>[Page Title] - Banana Rodeo</title>

    <!-- Meta Tags -->
    <meta property="og:site_name" content="Banana Rodeo">
    <meta property="og:title" content="[Page Title] - Banana Rodeo">
    <meta property="og:url" content="https://banana.rodeo/pages/[name]">
    <meta property="og:type" content="website">
    <meta property="og:image" content="/assets/icons/banana-rodeo-pin.01.png">

    <link rel="icon" type="image/x-icon" href="/assets/icons/favicon.ico">
    <link rel="stylesheet" href="/styles/main.css">
    <meta name="robots" content="noindex, nofollow">
</head>

<body class="[background-class]">
    <!-- HEADER -->

    <!-- Hero Section -->
    <section class="section-basic-trans">
        <h1 class="glitch" align="center">[Page Title]</h1>
    </section>

    <!-- Content Section -->
    <section class="section-basic-trans">
        <table class="section-content-base section-content-win98">
            <tr>
                <td>
                    <h1 class="section-title" align="center">[Page Title]</h1>
                    <div class="web1-divider"></div>
                    <div class="description">
                        <p><!-- content goes here --></p>
                    </div>
                </td>
            </tr>
        </table>
    </section>

    <!-- CHAT-MARQUEE (if applicable) -->

    <!-- FOOTER -->

    <script type="module" src="/src/main.ts"></script>

  </body>
</html>
```

3. **Run the build** (`npm run build`) to confirm the template injection works and the page renders correctly.

4. **Ask if the page needs a nav link** in the header template (`public/templates/header.html`) and add it if so.

5. **Offer to add tasks** — ask: "Want me to add placeholder tasks for [page name] to `docs/TASKS.md` under P3?" If yes, add 2–3 stub tasks tagged `[PAGE: name]`. If no, skip silently.

## Key conventions
- Template placeholders (`<!-- HEADER -->`, `<!-- FOOTER -->`, `<!-- CHAT-MARQUEE -->`) are replaced at build time — leave them as-is in source
- The `<!-- CHAT-MARQUEE -->` placeholder is optional — only include if the page needs it
- Page-specific styles go in `public/styles/pages/<name>.css` and are linked directly from the HTML (not imported via `main.css`)
- Pages with a completely different visual identity (own color palette, fonts, body reset) use their **own standalone stylesheet instead of main.css** — see `leaderboard.html` as an example
- The `glitch` class on `<h1>` applies the animated glitch effect used across the site
