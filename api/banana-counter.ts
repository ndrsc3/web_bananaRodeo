import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

const COUNTER_KEY = 'banana:collective';

function log(msg: string, ...args: unknown[]): void {
  console.log(`[BananaCounter:${new Date().toISOString()}] ${msg}`, ...args);
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    if (req.method === 'GET') {
      const total = (await kv.get<number>(COUNTER_KEY)) ?? 0;
      return res.status(200).json({ total });
    }

    if (req.method === 'POST') {
      const amount = Number(req.body?.amount);
      if (!Number.isFinite(amount) || amount <= 0 || amount > 10000) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      const total = await kv.incrby(COUNTER_KEY, Math.floor(amount));
      log('Incremented by', amount, '→', total);
      return res.status(200).json({ total });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    log('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
