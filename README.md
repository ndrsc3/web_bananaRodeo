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
├── .vercel/             # Build output
│   └── output/
│       ├── static/      # Processed static files
│       └── api/         # Server functions
├── package.json         # Root package.json
├── vercel.json          # Vercel configuration
├── sitemap.xml          # Site map for SEO
└── robots.txt           # Robots file for SEO
```

## Build System

The build process is orchestrated through npm workspaces and outputs to the `.vercel/output` directory:

- **Static Assets**: `.vercel/output/static/`
- **Server Functions**: `.vercel/output/api/`

### Build Commands

```bash
# Install dependencies
npm install

# Full production build
npm run build

# Clean build artifacts
npm run clean
```

### Development Workflow

The development environment is split into two parts that need to run simultaneously:

1. Watchers for TypeScript and static assets:
```bash
npm run watch
```
This command runs:
- TypeScript compilation in watch mode (`watch:ts`)
- Static asset and template processing (`watch:static`)

2. Vercel Development Server:
```bash
npm run vercel-dev
```

Run these commands in separate terminal windows for the full development environment.

### Available Scripts

- `build:client`: Build client-side TypeScript
- `build:server`: Build server-side TypeScript
- `build:shared`: Build shared TypeScript code
- `build:static`: Process static assets and templates
- `watch:ts`: Watch and compile TypeScript
- `watch:static`: Watch and process static assets
- `watch`: Run all watchers concurrently
- `vercel-dev`: Run Vercel development server

## Template System

The project uses a simple HTML templating system for sharing common components across pages.

### Usage

1. Templates are stored in `packages/client/public/templates/`:
   - `header.html`: Site header
   - `footer.html`: Site footer

2. Include templates in any HTML file using comments:
```html
<!-- HEADER -->
<main>
  Your content here
</main>
<!-- FOOTER -->
```

3. During build/development:
   - Templates are automatically processed
   - Comments are replaced with actual content
   - Proper indentation is maintained

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env.local` with required environment variables
4. Start the watchers: `npm run watch`
5. In a new terminal, start the dev server: `npm run vercel-dev`

## Deployment

The project is configured for deployment on Vercel:

1. Frontend is served as static files
2. Backend runs as serverless functions
3. Data is stored in Vercel KV

Required environment variables:
- `VERCEL_KV_URL`
- `VERCEL_KV_REST_API_URL`
- `VERCEL_KV_REST_API_TOKEN`
- `VERCEL_KV_REST_API_READ_ONLY_TOKEN`

## License

ISC

## 🌟 Features

- **Feature 1**: 
- **Feature 2**:

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Backend**: TypeScript, Vercel Serverless Functions
- **Data Storage**: Vercel KV
- **Deployment**: Vercel

## Acknowledgments

- Inspired by my friends
- Thanks to all contributors and early adopters
- Thank you web1.0 for the inspiration

## Author

Niko Millias
- Twitter: [@ndrsc3](https://twitter.com/ndrsc3)
- GitHub: [@ndrsc3](https://github.com/ndrsc3)

---

Made with ❤️ for The Great Big Banana in The Sky