/**
 * Simple hit counter client - web 1.0 style
 * Just fetches the current page's hit count from the API
 */
export async function incrementHits(pageUrl: string): Promise<number> {
    try {
        // Ensure we have a valid pageUrl that starts with /
        const cleanPath = pageUrl.startsWith('/') ? pageUrl : `/${pageUrl}`;
        console.log('[HitCounter] Incrementing hits for path:', cleanPath);
        
        const response = await fetch(`/api/route?pathname=${encodeURIComponent(cleanPath)}`);
        console.log('[HitCounter] Response status:', response.status);
        
        if (!response.ok) {
            const error = await response.text();
            console.error('[HitCounter] API Error:', error);
            throw new Error(error);
        }
        
        const text = await response.text();
        console.log('[HitCounter] Raw response:', text);
        
        const count = parseInt(text, 10);
        if (isNaN(count)) {
            throw new Error('Invalid hit count received');
        }
        
        return count;
    } catch (error) {
        console.error('[HitCounter] Failed:', error);
        throw error;
    }
} 