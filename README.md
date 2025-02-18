# Banana Rodeo Website

A web1.0-inspired website built with modern technologies.

## Project Structure

This is a monorepo project organized into the following packages:

```
packages/
├── client/           # Frontend package
│   ├── src/
│   │   ├── features/  # Feature-based components
│   │   ├── core/      # Core utilities
│   │   └── templates/ # HTML templates
│   └── ...
├── server/           # Backend package
│   ├── src/
│   │   ├── routes/    # API routes
│   │   └── services/  # Business logic
│   └── ...
└── shared/           # Shared package
    ├── src/
    │   ├── types/     # Shared TypeScript types
    │   └── constants/ # Shared constants
    └── ...
```

## Build System

The build process is orchestrated through npm workspaces and outputs to the `.vercel/output` directory:

- **Static Assets**: `.vercel/output/static/`
- **Server Functions**: `.vercel/output/functions/`

### Build Commands

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Clean build artifacts
npm run clean

# Watch mode for development
npm run watch
```

## Template System


### Template Structure
```
templates/
├── header.html
└── footer.html
```

### Usage
Templates can be included in any HTML file using special comments:

```html
<!-- HEADER -->
<main>
  Your content here
</main>
<!-- FOOTER -->
```

The build process will replace these comments with the actual template content, properly indented.

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env.local` with required environment variables
4. Run in watch mode: `npm run watch`

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
- **Deployment**: Vercel


## 🔍 Code Structure

```
website_bananaRodeo/
├── index.html              # Home page
├── pages/                  # All other pages
│   ├── about.html
│   ├── bananifesto.html
│   ├── contact.html
│   ├── merch.html
│   ├── events/
│   │   ├── index.html     # Main events page
│   │   ├── science-fair.html
│   │   └── competitions.html
│   └── get-involved/
│       ├── index.html     # Main get-involved page
│       ├── volunteer.html
│       ├── how-to-art.html
│       ├── sponsors.html
│       └── vendors.html
├── css/                    # Your existing CSS structure
├── assets/                 # Your images, videos, etc.
├── src/                    # TypeScript source files
│   └── js/
│       └── main.ts
├── dist/                   # Compiled files (generated)
├── package.json
└── vercel.json
└── sitemap.xml             # Sitemap for better indexing
└── robots.txt              # Robots.txt for better indexing
```

## 📦 Templating System
1. Template Files:
- `templates/header.html` contains the shared header
- `templates/footer.html` contains the shared footer

2. Page Structure:
- Pages use <!-- HEADER --> and <!-- FOOTER --> placeholders
- The templating script replaces these with the actual content

3. Build Process:
- `tsc` compiles all TypeScript files, including our templating script
- `node dist/js/build.js` runs our compiled templating script
- `npm run copy-static` copies the static assets

4. Development:
- Edit shared components in the templates directory
- Use the placeholders in your HTML files
- Run the build command to generate the final files

To create a new page:
1. Create a new HTML file in the pages directory
2. Include the <!-- HEADER --> and <!-- FOOTER --> placeholders
3. Add your page-specific content
4. Run the build command

The templating system will:
   - Process all HTML files in the project
   - Replace the placeholders with the shared components
   - Maintain the directory structure in the dist folder
   - Keep all assets and paths working correctly

## 👤 Author

Niko Millias
- Twitter: [@ndrsc3](https://twitter.com/ndrsc3)
- GitHub: [@ndrsc3](https://github.com/ndrsc3)

## 🙏 Acknowledgments

- Inspired by my friends
- Thanks to all contributors and early adopters
- Thank you web1.0 for the inspiration

---

Made with ❤️ for The Great Big Banana in The Sky