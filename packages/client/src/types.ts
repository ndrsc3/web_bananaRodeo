// Types and constants for Banana Rodeo website
// This is a simplified version of the shared package, keeping everything in one place

// API Routes
export const API_ROUTES = {
    KV: {
        BASE: '/api/kv',
        ACTIONS: {
            INIT: 'init',
            GET_HITS: 'getHits',
            INCREMENT_HITS: 'incrementHits'
        }
    }
} as const;

// KV Store Types
export interface KVStore {
    pages: PageStore;
    auth: AuthConfig;
    guestbook: GuestbookStore;
}

export interface PageStore {
    [pageUrl: string]: PageData;
}

export interface PageData {
    hasHitCounter: boolean;
    hits?: number;
    lastUpdated?: string;
    settings?: {
        showHitCounter: boolean;
        counterPosition?: 'header' | 'footer';
    };
}

export interface AuthConfig {
    password: string;
    protectedPages: string[];
}

export interface GuestbookStore {
    entries: GuestbookEntry[];
    settings: GuestbookSettings;
}

export interface GuestbookEntry {
    id: string;
    name: string;
    message: string;
    timestamp: string;
    website?: string;
    email?: string;
    avatar?: string;
}

export interface GuestbookSettings {
    allowHtml: boolean;
    moderationEnabled: boolean;
    entriesPerPage: number;
}

// API Response Type
export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
} 