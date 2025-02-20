import { APIResponse, API_ROUTES } from '@banana-rodeo/client/dist/src/types';
import { initializeKV, getPageData, incrementPageHits } from '../../services/kv';

const { ACTIONS } = API_ROUTES.KV;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const pageUrl = searchParams.get('pageUrl');

  let response: APIResponse<any>;

  switch (action) {
    case ACTIONS.INIT:
      response = await initializeKV();
      break;
    
    case ACTIONS.GET_HITS:
      if (!pageUrl) {
        response = {
          success: false,
          error: 'pageUrl is required'
        };
        break;
      }
      response = await getPageData(pageUrl);
      break;
    
    case ACTIONS.INCREMENT_HITS:
      if (!pageUrl) {
        response = {
          success: false,
          error: 'pageUrl is required'
        };
        break;
      }
      response = await incrementPageHits(pageUrl);
      break;
    
    default:
      response = {
        success: false,
        error: 'Invalid action'
      };
  }

  return new Response(JSON.stringify(response), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
} 