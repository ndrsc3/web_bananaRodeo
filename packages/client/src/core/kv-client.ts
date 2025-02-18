import { PageData, APIResponse, API_ROUTES } from '@banana-rodeo/shared';

const { KV } = API_ROUTES;

export async function initializeKVStore(): Promise<APIResponse<boolean>> {
  try {
    const response = await fetch(`${KV.BASE}?action=${KV.ACTIONS.INIT}`);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize KV store'
    };
  }
}

export async function getPageHits(pageUrl: string): Promise<APIResponse<PageData>> {
  try {
    const response = await fetch(`${KV.BASE}?action=${KV.ACTIONS.GET_HITS}&pageUrl=${encodeURIComponent(pageUrl)}`);
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get page hits'
    };
  }
}

export async function incrementHits(pageUrl: string): Promise<APIResponse<number>> {
  try {
    const response = await fetch(`${KV.BASE}?action=${KV.ACTIONS.INCREMENT_HITS}&pageUrl=${encodeURIComponent(pageUrl)}`);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to increment hits'
    };
  }
} 