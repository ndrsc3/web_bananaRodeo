# Banana Rodeo Website

A web1.0-inspired website built with modern technologies.

## Project Structure

```
website_bananaRodeo/
├── packages/
│   ├── client/           # Frontend package
│   │   ├── public/       # Static assets
│   │   │   ├── css/     # Stylesheets
│   │   │   ├── assets/  # Images, videos, etc.
│   │   │   ├── pages/   # HTML pages
│   │   │   └── templates/ # Shared HTML components
│   │   └── src/
│   │       ├── features/ # Feature-based components
│   │       ├── core/     # Core utilities
│   │       └── build.ts  # Build script
│   ├── server/          # Backend package
│   │   └── src/
│   │       ├── routes/   # API routes
│   │       └── services/ # Business logic
│   └── shared/          # Shared package
│       └── src/
│           ├── types/    # Shared TypeScript types
│           └── constants/# Shared constants
├── api/                  # Serverless API functions
├── scripts/             # Build and utility scripts
├── .vercel/             # Vercel build output
├── package.json         # Root package.json
├── vercel.json          # Vercel configuration
├── sitemap.xml          # Site map for SEO
└── robots.txt           # Robots file for SEO
└── .env.local          # Local environment variables
```

## Build System

The build process uses npm workspaces and outputs to:

- **Client Assets**: `packages/client/dist/`
- **API Functions**: `api/`

### Build Commands

```bash
# Install dependencies
npm install

# Development
npm run watch        # Watch TypeScript and static assets
npm run vercel-dev  # Start local dev server (separate terminal)

# Production build
npm run build

# Clean build artifacts
npm run clean
```

### Build Process Details

The build system consists of two main parts:

1. **TypeScript Compilation** (`build:client`):
   - Compiles client-side TypeScript
   - Outputs to `packages/client/dist`

2. **Static Asset Processing** (`build:static`):
   - Processes HTML templates
   - Copies and optimizes static assets
   - Handles CSS bundling

### Development Scripts

- `watch:ts`: Watch and compile TypeScript
- `watch:static`: Process static assets on change
- `watch`: Run all watchers (TypeScript + static)
- `vercel-dev`: Local development server

## Template System

A simple yet powerful HTML templating system for consistent components:

### Template Tags

```html
<!-- HEADER -->     # Site header
<!-- FOOTER -->     # Site footer
<!-- CHAT_MARQUEE -->  # Scrolling chat
```

### Adding New Templates

1. Create template in `packages/client/public/templates/`
2. Update `templates.ts`:
   - Add to `TemplateComponents` interface
   - Add file reading to `getTemplates()`
   - Add replacement pattern

## Development Setup

1. Clone repository
2. Install: `npm install`
3. Copy `.env.example` to `.env.local`
4. Start watchers: `npm run watch`
5. Start dev server: `npm run vercel-dev`

## Environment Variables

Required variables in `.env.local`:
- `VERCEL_KV_URL`: KV storage URL
- `VERCEL_KV_REST_API_URL`: KV REST API URL
- `VERCEL_KV_REST_API_TOKEN`: KV API token
- `VERCEL_KV_REST_API_READ_ONLY_TOKEN`: KV read-only token

## 🛠️ Technology Stack

- **Frontend**: 
  - Vanilla TypeScript
  - HTML5 with custom templating
  - Pure CSS3 (no preprocessors)
  - Web1.0 aesthetic principles

- **Backend**: 
  - Vercel Serverless Functions
  - TypeScript
  - Vercel KV (Redis)

- Inspired by my friends
- Thanks to all contributors and early adopters
- Thank you web1.0 for the inspiration

## Author

Niko Millias
- Twitter: [@ndrsc3](https://twitter.com/ndrsc3)
- GitHub: [@ndrsc3](https://github.com/ndrsc3)

---

Made with ❤️ for The Great Big Banana in The Sky
