import { incrementHitCount, getHitCount } from './storage.js';

function log(message, ...args) {
  console.log(`[HitCounter:${new Date().toISOString()}] ${message}`, ...args);
}

/**
 * Simple hit counter endpoint - web 1.0 style
 */
export default async function handler(req, res) {
  try {
    const pathname = req.query.pathname;
    if (!pathname) {
      throw new Error('pathname parameter is required');
    }
    
    log('Hit counter request for:', pathname);
    
    // In development mode, only return the current count without incrementing
    if (process.env.NODE_ENV === 'development') {
      const count = await getHitCount(pathname);
      log('Development mode - returning current count:', count);
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(count.toString());
    }
    
    // In production, increment the counter
    const count = await incrementHitCount(pathname);
    log('New hit count:', count);
    
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(count.toString());
  } catch (error) {
    log('Error:', error);
    res.status(500).send('Error: ' + error.message);
  }
}