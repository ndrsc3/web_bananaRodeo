export const API_ROUTES = {
    KV: {
        BASE: '/api/kv',
        ACTIONS: {
            INIT: 'init',
            GET_HITS: 'get_hits',
            INCREMENT_HITS: 'increment_hits'
        }
    }
} as const; 