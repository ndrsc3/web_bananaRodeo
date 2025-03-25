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
    const pageData = pages[pageUrl];

    if (!pageData?.hasHitCounter) {
      return new Response(
        JSON.stringify({
          success: true,
          data: null
        } as APIResponse<null>),
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const newHits = (pageData.hits || 0) + 1;
    const updatedData = {
      ...pageData,
      hits: newHits,
      lastUpdated: new Date().toISOString()
    };

    pages[pageUrl] = updatedData;
    await kv.set('pages', pages);

    return new Response(
      JSON.stringify({
        success: true,
        data: newHits
      } as APIResponse<number>),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to increment page hits'
      } as APIResponse<null>),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 