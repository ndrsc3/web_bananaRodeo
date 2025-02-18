# @banana-rodeo/shared

Shared types and constants for the Banana Rodeo website.

## Structure

```
src/
├── types/            # Shared TypeScript types
│   └── kv.ts        # KV store types
└── constants/       # Shared constants
    └── index.ts    # API routes and other constants
```

## Types

### KV Store Types

```typescript
interface KVStore {
    pages: PageStore;
    auth: AuthConfig;
    guestbook: GuestbookStore;
}

interface PageData {
    hasHitCounter: boolean;
    hits?: number;
    lastUpdated?: string;
    settings?: {
        showHitCounter: boolean;
        counterPosition?: 'header' | 'footer';
    };
}

interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
```

## Constants

### API Routes

```typescript
const API_ROUTES = {
    KV: {
        BASE: '/api/kv',
        ACTIONS: {
            INIT: 'init',
            GET_HITS: 'getHits',
            INCREMENT_HITS: 'incrementHits'
        }
    }
} as const;
```

## Usage

```typescript
// In other packages
import { PageData, APIResponse, API_ROUTES } from '@banana-rodeo/shared';
```

## Development

### Commands

```bash
# Build
npm run build

# Clean
npm run clean

# Watch mode
npm run watch
```

## Notes

- Types are used by both client and server packages
- Constants ensure consistency across packages
- No runtime dependencies 