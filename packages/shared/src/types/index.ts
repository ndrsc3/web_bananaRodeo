// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Hit Counter Types
export interface HitCount {
  page: string;
  count: number;
  lastUpdated: string;
}

// Guestbook Types
export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  timestamp: string;
}

// Web 1.0 Effect Types
export interface CursorEffect {
  type: 'trail' | 'sparkle' | 'matrix';
  enabled: boolean;
  config?: Record<string, unknown>;
}

// Asset Types
export interface Web1Asset {
  path: string;
  type: 'image' | 'audio' | 'midi';
  metadata?: Record<string, unknown>;
} 