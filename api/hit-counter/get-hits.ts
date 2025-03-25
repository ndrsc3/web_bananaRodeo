export const config = {
  runtime: 'edge'
};

import { kv } from '@vercel/kv';
import type { PageData, APIResponse } from '@banana-rodeo/client/dist/src/types';

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageUrl = searchParams.get('pageUrl');

  if (!pageUrl) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'pageUrl is required'
      } as APIResponse<null>),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const pages = await kv.get('pages') as Record<string, PageData>;
    
    return new Response(
      JSON.stringify({
        success: true,
        data: pages[pageUrl] || null
      } as APIResponse<PageData | null>),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get page data'
      } as APIResponse<null>),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 