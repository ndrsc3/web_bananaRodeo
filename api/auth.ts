import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// This should match the hashed password from your setup
const HASHED_PASSWORD = process.env.SITE_PASSWORD;

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        const hashedInput = hashPassword(password);

        if (hashedInput === HASHED_PASSWORD) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(401).json({ error: 'Invalid password' });
        }
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
