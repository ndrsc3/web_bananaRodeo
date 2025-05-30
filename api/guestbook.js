import { kv } from '@vercel/kv';
import crypto from 'crypto';

const GUESTBOOK_KEY = 'guestbook:entries';
const MAX_ENTRIES = 100; // Limit total entries to prevent abuse

function log(message, ...args) {
    console.log(`[Guestbook:${new Date().toISOString()}] ${message}`, ...args);
}

/**
 * Add a new guestbook entry
 */
export async function addEntry(entry) {
    try {
        // Generate a unique ID
        const id = crypto.randomUUID();
        const newEntry = {
            ...entry,
            id
        };

        // Get current entries
        const entries = await kv.lrange(GUESTBOOK_KEY, 0, -1) || [];
        
        // Check if we need to remove old entries to stay under limit
        if (entries.length >= MAX_ENTRIES) {
            await kv.ltrim(GUESTBOOK_KEY, 0, MAX_ENTRIES - 2);
        }

        // Add new entry at the beginning (most recent first)
        await kv.lpush(GUESTBOOK_KEY, newEntry);
        
        log('Added new entry:', { id });
        return newEntry;
    } catch (error) {
        log('Error adding entry:', error);
        throw error;
    }
}

/**
 * Get guestbook entries with pagination
 */
export async function getEntries(page = 1, perPage = 10) {
    try {
        const start = (page - 1) * perPage;
        const end = start + perPage - 1;
        
        // Get entries for the requested page
        const entries = await kv.lrange(GUESTBOOK_KEY, start, end) || [];
        
        // Get total count
        const total = await kv.llen(GUESTBOOK_KEY);
        
        log('Retrieved entries:', { page, start, end, count: entries.length, total });
        
        return {
            entries,
            total,
            hasMore: total > (start + entries.length)
        };
    } catch (error) {
        log('Error getting entries:', error);
        throw error;
    }
}

// API route handler
export default async function handler(req, res) {
    try {
        if (req.method === 'POST') {
            const entry = req.body;
            
            // Basic validation
            if (!entry.name || !entry.message || !entry.bananaMemory || !entry.mood) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields'
                });
            }

            const newEntry = await addEntry(entry);
            return res.status(200).json({
                success: true,
                data: newEntry
            });
        }
        
        if (req.method === 'GET') {
            const page = parseInt(req.query.page || '1', 10);
            const perPage = parseInt(req.query.perPage || '10', 10);
            
            const result = await getEntries(page, perPage);
            return res.status(200).json({
                success: true,
                data: result
            });
        }

        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    } catch (error) {
        log('API Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
} 