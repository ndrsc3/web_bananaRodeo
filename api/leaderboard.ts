import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

const LEADERBOARD_KEY = 'leaderboard:entries';
const MAX_ENTRIES = 10;

interface LeaderboardEntry {
  name: string;
  phrase: string;
  score: number;
  timestamp: string;
}

function log(msg: string, ...args: unknown[]): void {
  console.log(`[Leaderboard:${new Date().toISOString()}] ${msg}`, ...args);
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    if (req.method === 'GET') {
      const entries = (await kv.get<LeaderboardEntry[]>(LEADERBOARD_KEY)) ?? [];
      return res.status(200).json({ entries });
    }

    if (req.method === 'POST') {
      const { name, phrase, score } = req.body ?? {};

      if (typeof name !== 'string' || name.trim().length === 0 || name.length > 30) {
        return res.status(400).json({ error: 'Invalid name' });
      }
      if (typeof phrase !== 'string' || phrase.trim().length === 0 || phrase.length > 80) {
        return res.status(400).json({ error: 'Invalid phrase' });
      }
      if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 100000) {
        return res.status(400).json({ error: 'Invalid score' });
      }

      const entries = (await kv.get<LeaderboardEntry[]>(LEADERBOARD_KEY)) ?? [];
      const newEntry: LeaderboardEntry = {
        name: name.trim(),
        phrase: phrase.trim(),
        score,
        timestamp: new Date().toISOString(),
      };

      // Insert, sort descending by score, keep top 10
      const updated = [...entries, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_ENTRIES);

      const rank = updated.findIndex((e) => e === newEntry) + 1; // 0 if pruned

      await kv.set(LEADERBOARD_KEY, updated);
      log('New entry at rank', rank, { name: newEntry.name, score });
      return res.status(200).json({ rank, entries: updated });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    log('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
