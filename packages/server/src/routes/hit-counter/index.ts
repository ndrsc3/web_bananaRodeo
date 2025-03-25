import { APIResponse, API_ROUTES } from '@banana-rodeo/client/dist/src/types';
import { initializeKV, getPageData, incrementPageHits } from '../../services/kv';

const { ACTIONS } = API_ROUTES.KV;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const pageUrl = searchParams.get('pageUrl');

  console.info(`Hit counter API called`, { action, pageUrl });

  let response: APIResponse<any>;

  switch (action) {
    case ACTIONS.INIT:
      console.debug('Initializing KV store');
      response = await initializeKV();
      break;
    
    case ACTIONS.GET_HITS:
      if (!pageUrl) {
        console.error('GET_HITS called without pageUrl');
        response = {
          success: false,
          error: 'pageUrl is required'
        };
        break;
      }
      console.debug(`Getting hits for page`, { pageUrl });
      response = await getPageData(pageUrl);
      break;
    
    case ACTIONS.INCREMENT_HITS:
      if (!pageUrl) {
        console.error('INCREMENT_HITS called without pageUrl');
        response = {
          success: false,
          error: 'pageUrl is required'
        };
        break;
      }
      console.debug(`Incrementing hits for page`, { pageUrl });
      response = await incrementPageHits(pageUrl);
      break;
    
    default:
      console.warn(`Invalid action received`, { action });
      response = {
        success: false,
        error: 'Invalid action'
      };
  }

  console.info(`Hit counter API response`, { success: response.success, error: response.error });
  
  return new Response(JSON.stringify(response), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
} 