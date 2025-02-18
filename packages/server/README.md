# @banana-rodeo/server

Backend package for the Banana Rodeo website.

## Structure

```
src/
├── routes/            # API routes
│   └── kv/           # KV store endpoints
│       └── index.ts
├── services/         # Business logic
│   └── kv/          # KV store service
│       └── index.ts
└── index.ts         # Package exports
```

## API Routes

### KV Store (`/api/kv`)

Handles page hit counting and other KV store operations.

#### Endpoints

- `GET /api/kv?action=init`
  - Initializes the KV store
  - Returns: `{ success: boolean }`

- `GET /api/kv?action=getHits&pageUrl={url}`
  - Gets hit count for a page
  - Returns: `{ success: boolean, data: PageData }`

- `GET /api/kv?action=incrementHits&pageUrl={url}`
  - Increments hit count for a page
  - Returns: `{ success: boolean, data: number }`

## Services

### KV Service

Manages Vercel KV store operations:
- Page hit counting
- Authentication settings
- Guestbook entries

## Development

### Environment Variables

Required for local development:
```
VERCEL_KV_URL=
VERCEL_KV_REST_API_URL=
VERCEL_KV_REST_API_TOKEN=
VERCEL_KV_REST_API_READ_ONLY_TOKEN=
```

### Commands

```bash
# Build
npm run build

# Clean
npm run clean

# Watch mode
npm run watch
```

## Deployment

Deployed as Vercel serverless functions:
- Routes are automatically mapped to function endpoints
- KV service connects to Vercel KV store
- Environment variables are managed through Vercel 