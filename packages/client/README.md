# @banana-rodeo/client

Frontend package for the Banana Rodeo website.

## Structure

```
src/
├── features/           # Feature-based components
│   └── hit-counter/   # Hit counter feature
│       ├── components/
│       └── styles/
├── core/              # Core utilities
│   ├── animations.ts
│   ├── image-loader.ts
│   ├── kv-client.ts
│   └── templates.ts
└── templates/         # HTML templates
```

## Build Process

The build process:
1. Compiles TypeScript files
2. Processes HTML templates
3. Copies static assets
4. Outputs to `.vercel/output/static`

### Commands

```bash
# Build
npm run build

# Clean
npm run clean

# Watch mode
npm run watch
```

## Template System

The template system allows for consistent header and footer across all pages:

1. Templates are stored in `/templates`
2. Pages use special comments to include templates:
   ```html
   <!-- HEADER -->
   <!-- FOOTER -->
   ```
3. Build process:
   - Reads template files
   - Replaces comments with template content
   - Maintains proper indentation
   - Outputs processed files to build directory

### Template Markers

- `<!-- HEADER -->`: Inserts the header template
- `<!-- FOOTER -->`: Inserts the footer template

## Features

### Hit Counter
- Tracks page visits
- Updates in real-time
- Persists data using Vercel KV

### Image Loading
- Lazy loading for images
- Uses Intersection Observer
- Improves page load performance

### Animations
- Scroll-based animations
- Uses Intersection Observer
- Adds CSS classes dynamically 