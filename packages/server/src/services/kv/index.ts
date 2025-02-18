import { kv } from '@vercel/kv';
import type { KVStore, PageData, APIResponse } from '@banana-rodeo/shared';

export async function initializeKV(): Promise<APIResponse<boolean>> {
  try {
    const isInitialized = await kv.get('initialized');
    
    if (!isInitialized) {
      // Set initial state
      await kv.set('pages', {
        '/': {
          hasHitCounter: true,
          hits: 0,
          settings: {
            showHitCounter: true,
            counterPosition: 'footer'
          }
        }
      });

      await kv.set('auth', {
        password: '',
        protectedPages: []
      });

      await kv.set('guestbook', {
        entries: [],
        settings: {
          allowHtml: false,
          moderationEnabled: true,
          entriesPerPage: 10
        }
      });
      
      await kv.set('initialized', true);
    }

    return {
      success: true,
      data: true
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize KV store'
    };
  }
}

export async function getPageData(pageUrl: string): Promise<APIResponse<PageData | null>> {
  try {
    const pages = await kv.get('pages') as Record<string, PageData>;
    return {
      success: true,
      data: pages[pageUrl] || null
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get page data'
    };
  }
}

export async function incrementPageHits(pageUrl: string): Promise<APIResponse<number | null>> {
  try {
    const pageData = await getPageData(pageUrl);
    
    if (!pageData.success || !pageData.data?.hasHitCounter) {
      return {
        success: true,
        data: null
      };
    }

    const newHits = (pageData.data.hits || 0) + 1;
    const updatedData = {
      ...pageData.data,
      hits: newHits,
      lastUpdated: new Date().toISOString()
    };

    await kv.hset(`pages:${pageUrl}`, updatedData);
    
    return {
      success: true,
      data: newHits
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to increment page hits'
    };
  }
} 