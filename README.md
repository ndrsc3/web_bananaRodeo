# Banana Rodeo Website

A web1.0-inspired website built with modern technologies for The Banana Rodeo Science Fair in Reno, NV

## Project Structure

```
web_bananaRodeo/
├── src/               # TypeScript source (bundled by Vite)
├── pages/             # HTML entry points (template injection applied at build)
├── public/            # Static assets copied verbatim to dist/
│   ├── styles/        # CSS (base/, components/, layout/, animations/, web1/)
│   ├── assets/        # Images, gifs, icons, video
│   └── templates/     # Shared HTML fragments (header, footer, chat-marquee)
├── api/               # Vercel serverless functions (TypeScript, CommonJS)
├── scripts/           # Utility scripts (hash-password, reset-counters)
├── dist/              # Build output (Vercel output directory, do not edit)
├── index.html         # Root entry point (auth gate)
├── vite.config.ts     # Vite config + HTML template injection plugin
├── eslint.config.ts   # ESLint 9 flat config
├── vercel.json        # Vercel configuration
└── package.json
```

## Commands

```bash
# Install dependencies
npm install

# Development
npx vercel dev         # Local dev server with Vercel serverless functions

# Production
npm run build          # Vite build → dist/
npm run preview        # Serve dist/ locally

# Code quality
npm run lint           # ESLint
npm run format         # Prettier

# Utility scripts
npm run hash-password  # Generate a hashed password
npm run reset-counters # Reset all page hit counters
```

## Template System

Pages in `pages/` use HTML comment placeholders replaced at build time by the Vite plugin in `vite.config.ts`:

```html
<!-- HEADER -->       → public/templates/header.html
<!-- FOOTER -->       → public/templates/footer.html
<!-- CHAT-MARQUEE --> → public/templates/chat-marquee.html
```

## Development Setup

1. Clone repository
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in KV credentials
4. `npx vercel dev` — frontend + API functions together

## Environment Variables

Required in `.env.local` for local Vercel dev:
- `VERCEL_KV_URL`
- `VERCEL_KV_REST_API_URL`
- `VERCEL_KV_REST_API_TOKEN`
- `VERCEL_KV_REST_API_READ_ONLY_TOKEN`

## Technology Stack

- **Frontend**: Vanilla TypeScript, HTML5, CSS3, Web1.0 aesthetic
- **Build**: Vite, ESLint 9, Prettier
- **Backend**: Vercel Serverless Functions (TypeScript)
- **Data**: Vercel KV (Redis via @upstash/redis)
- **Hosting**: Vercel

## Author

Niko Millias
- Twitter: [@ndrsc3](https://twitter.com/ndrsc3)
- GitHub: [@ndrsc3](https://github.com/ndrsc3)

---

Made with ❤️ for The Great Big Banana in The Sky
