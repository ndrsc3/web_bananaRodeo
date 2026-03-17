import { kv } from '@vercel/kv';

interface PageData {
    hasHitCounter: boolean;
    hits: number;
    lastUpdated: string;
}

function log(message: string, ...args: unknown[]): void {
    console.log(`[HitCounter:${new Date().toISOString()}] ${message}`, ...args);
}

/**
 * Get the KV store key for a page
 */
function getPageKey(pageUrl: string): string {
    return `page:${pageUrl}`;
}

/**
 * Initialize a hit counter for a page if it doesn't exist
 */
async function initPage(pageUrl: string): Promise<PageData> {
    try {
        log('Checking page data for:', pageUrl);
        const key = getPageKey(pageUrl);
        let pageData = await kv.get<PageData>(key);

        if (!pageData) {
            log('No existing page data, initializing:', pageUrl);
            pageData = {
                hasHitCounter: true,
                hits: 0,
                lastUpdated: new Date().toISOString(),
            };
            await kv.set(key, pageData);
            log('Page initialized with data:', { pageUrl, data: pageData });
        } else {
            // log('Found existing page data:', { pageUrl, data: pageData });
        }

        return pageData;
    } catch (error) {
        log('Error initializing page:', error);
        throw error;
    }
}

/**
 * Get the current hit count for a page without incrementing
 */
export async function getHitCount(pageUrl: string): Promise<number> {
    try {
        if (!pageUrl) {
            throw new Error('pageUrl is required');
        }

        // Clean the pageUrl
        const cleanPath = pageUrl.startsWith('/') ? pageUrl : `/${pageUrl}`;

        // Get page data
        const pageData = await initPage(cleanPath);
        return pageData.hits || 0;
    } catch (error) {
        log('Failed to get hit count:', error);
        throw error;
    }
}

/**
 * Increment hit counter for a page
 */
export async function incrementHitCount(pageUrl: string): Promise<number> {
    try {
        if (!pageUrl) {
            throw new Error('pageUrl is required');
        }

        // Clean the pageUrl
        const cleanPath = pageUrl.startsWith('/') ? pageUrl : `/${pageUrl}`;

        // Get or create page data
        const pageData = await initPage(cleanPath);
        const newHits = (pageData.hits || 0) + 1;

        // Update hit count
        const key = getPageKey(cleanPath);
        const updatedData = {
            ...pageData,
            hits: newHits,
            lastUpdated: new Date().toISOString(),
        };

        await kv.set(key, updatedData);

        return newHits;
    } catch (error) {
        log('Failed to increment hits:', error);
        throw error;
    }
}
