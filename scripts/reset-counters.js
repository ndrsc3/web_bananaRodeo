import { kv } from '@vercel/kv';

/**
 * Reset all page hit counters to 0
 */
async function resetCounters() {
    try {
        // Get all keys that start with 'page:'
        const keys = await kv.keys('page:*');
        console.log(`Found ${keys.length} page counters to reset`);

        // Reset each counter to 0
        for (const key of keys) {
            const pageData = await kv.get(key);
            if (pageData && typeof pageData === 'object') {
                const updatedData = {
                    ...pageData,
                    hits: 0,
                    lastUpdated: new Date().toISOString()
                };
                await kv.set(key, updatedData);
                console.log(`Reset counter for ${key}`);
            }
        }

        console.log('Successfully reset all page counters to 0');
    } catch (error) {
        console.error('Error resetting counters:', error);
        process.exit(1);
    }
}

resetCounters(); 