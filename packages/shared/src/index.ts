export * from './types/kv';

// Constants will be exported here as we add them
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