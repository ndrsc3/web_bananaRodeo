import { kv } from '@vercel/kv';

function log(message, ...args) {
  console.log(`[HitCounter:${new Date().toISOString()}] ${message}`, ...args);
}

/**
 * Get the KV store key for a page
 */
function getPageKey(pageUrl) {
  return `page:${pageUrl}`;
}

/**
 * Initialize a hit counter for a page if it doesn't exist
 */
async function initPage(pageUrl) {
  try {
    log('Checking page data for:', pageUrl);
    const key = getPageKey(pageUrl);
    let pageData = await kv.get(key);
    
    if (!pageData) {
      log('No existing page data, initializing:', pageUrl);
      pageData = {
        hasHitCounter: true,
        hits: 0,
        lastUpdated: new Date().toISOString()
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
 * Increment hit counter for a page
 */
export async function incrementHitCount(pageUrl) {
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
      lastUpdated: new Date().toISOString()
    };
    
    await kv.set(key, updatedData);
    
    return newHits;
  } catch (error) {
    log('Failed to increment hits:', error);
    throw error;
  }
}