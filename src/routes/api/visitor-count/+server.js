import { kv } from '@vercel/kv';
import { json } from '@sveltejs/kit';

const VISITOR_KEY = 'hachimi:visitor_count';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
    try {
        // Get current count without incrementing
        const count = await kv.get(VISITOR_KEY) || 0;
        return json({ count: Number(count) });
    } catch (error) {
        console.error('KV GET error:', error);
        // Return a fallback count if KV is not available (local dev)
        return json({ count: 1, error: 'KV not configured' });
    }
}

/** @type {import('./$types').RequestHandler} */
export async function POST() {
    try {
        // Increment and return the new count
        const newCount = await kv.incr(VISITOR_KEY);
        return json({ count: newCount });
    } catch (error) {
        console.error('KV INCR error:', error);
        // Return a fallback count if KV is not available (local dev)
        return json({ count: 1, error: 'KV not configured' });
    }
}
