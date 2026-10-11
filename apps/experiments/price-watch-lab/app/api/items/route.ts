import { getRedis, redisAvailable } from '../../../lib/redis';

const memory: unknown[] = [];
const KEY = 'price-watch:items';

export async function GET() {
  if (redisAvailable()) {
    const raw = await getRedis()!.get<unknown[]>(KEY);
    return Response.json({ storage: 'redis', items: raw ?? [] });
  }
  return Response.json({ storage: 'memory', items: memory });
}

export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const item = { ...(json as object), at: new Date().toISOString() };
  if (redisAvailable()) {
    const redis = getRedis()!;
    const prev = (await redis.get<unknown[]>(KEY)) ?? [];
    const next = [...prev, item].slice(-50);
    await redis.set(KEY, next);
    return Response.json({ storage: 'redis', items: next });
  }
  memory.push(item);
  return Response.json({ storage: 'memory', items: memory.slice(-50) });
}
