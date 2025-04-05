import { kv } from '@vercel/kv';

/**
 * Debug utility to check hit counter values
 */
async function checkHitCounts() {
  try {
    // Get all keys
    const keys = await kv.keys('page:*');
    const results = {
      timestamp: new Date().toISOString(),
      counts: {}
    };
    
    // Get and display values for each key
    for (const key of keys) {
      const data = await kv.get(key);
      results.counts[key] = {
        hits: data.hits,
        lastUpdated: data.lastUpdated
      };
    }
    
    return results;
  } catch (error) {
    throw error;
  }
}

export default async function handler(req, res) {
  try {
    const results = await checkHitCounts();
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
} 