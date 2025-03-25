import { PageData, APIResponse, API_ROUTES } from '../types.js';

const { KV } = API_ROUTES;

export async function initializeKVStore(): Promise<APIResponse<boolean>> {
  try {
    const endpoint = `${KV.BASE}?action=${KV.ACTIONS.INIT}`;
    console.debug('Initializing KV store', { endpoint });
    const response = await fetch(endpoint);
    const text = await response.text(); // Get raw response first
    console.debug('Raw KV init response:', { text, status: response.status });
    const data = JSON.parse(text);
    console.info('KV store initialized', { success: data.success });
    return data;
  } catch (error) {
    console.error('Failed to initialize KV store', { 
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize KV store'
    };
  }
}

export async function getPageHits(pageUrl: string): Promise<APIResponse<PageData>> {
  try {
    const endpoint = `${KV.BASE}?action=${KV.ACTIONS.GET_HITS}&pageUrl=${encodeURIComponent(pageUrl)}`;
    console.debug('Fetching page hits', { endpoint });
    const response = await fetch(endpoint);
    const text = await response.text(); // Get raw response first
    console.debug('Raw get hits response:', { text, status: response.status });
    const data = JSON.parse(text);
    console.info('Retrieved page hits', { 
      pageUrl,
      success: data.success,
      hits: data.data?.hits 
    });
    return data;
  } catch (error) {
    console.error('Failed to get page hits', { 
      pageUrl, 
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get page hits'
    };
  }
}

export async function incrementHits(pageUrl: string): Promise<APIResponse<number>> {
  try {
    const endpoint = `${KV.BASE}?action=${KV.ACTIONS.INCREMENT_HITS}&pageUrl=${encodeURIComponent(pageUrl)}`;
    console.debug('Incrementing page hits', { endpoint });
    const response = await fetch(endpoint);
    const text = await response.text(); // Get raw response first
    console.debug('Raw increment response:', { text, status: response.status });
    const data = JSON.parse(text);
    console.info('Incremented page hits', { 
      pageUrl,
      success: data.success,
      newHitCount: data.data 
    });
    return data;
  } catch (error) {
    console.error('Failed to increment hits', { 
      pageUrl, 
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to increment hits'
    };
  }
} 