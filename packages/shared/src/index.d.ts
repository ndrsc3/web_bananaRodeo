export * from './types/kv';
export declare const API_ROUTES: {
    readonly KV: {
        readonly BASE: "/api/kv";
        readonly ACTIONS: {
            readonly INIT: "init";
            readonly GET_HITS: "getHits";
            readonly INCREMENT_HITS: "incrementHits";
        };
    };
};
