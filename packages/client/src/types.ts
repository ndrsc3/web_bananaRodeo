// Types for Banana Rodeo website

/**
 * Represents the page data including hit counter and content update tracking
 */
export interface PageData {
    /** Whether the page has a hit counter enabled */
    hasHitCounter: boolean;
    /** Number of times the page has been visited */
    hits: number;
    /** ISO timestamp of when the page content was last updated */
    lastUpdated: string;
}

/**
 * Represents a single guestbook entry
 */
export interface GuestbookEntry {
    /** Unique identifier for the entry */
    id: string;
    /** Name of the person signing the guestbook */
    name: string;
    /** Optional email address */
    email?: string;
    /** Optional website/homepage URL */
    website?: string;
    /** Optional location */
    location?: string;
    /** The main guestbook message */
    message: string;
    /** A favorite banana-related memory */
    bananaMemory: string;
    /** Selected mood from preset options */
    mood: string;
    /** Unix timestamp of when the entry was created */
    timestamp: number;
}

// API Response Type - matches backend response format
export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
} 