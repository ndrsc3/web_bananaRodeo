export const config = {
  runtime: 'edge'
};

import { kv } from '@vercel/kv';
import type { APIResponse } from '@banana-rodeo/client/dist/src/types';

export default async function handler(request: Request) {
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

      await kv.set('initialized', true);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: true
      } as APIResponse<boolean>),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize KV store'
      } as APIResponse<null>),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 