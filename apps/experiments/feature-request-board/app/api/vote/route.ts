import { getRedis, redisAvailable } from '../../../lib/redis';
import { voteKey } from '../../../logic';

const memory = new Map<string, number>();

async function readVotes(): Promise<Record<string, number>> {
  const redis = getRedis();
  if (redis) {
    const keys = await redis.keys('frb:votes:*');
    const out: Record<string, number> = {};
    for (const key of keys) {
      const n = await redis.get<number>(key);
      out[String(key).replace('frb:votes:', '')] = Number(n ?? 0);
    }
    return out;
  }
  return Object.fromEntries(memory.entries());
}

export async function GET() {
  return Response.json({
    votes: await readVotes(),
    storage: redisAvailable() ? 'redis' : 'memory',
    note: redisAvailable() ? undefined : 'Redis not configured - votes are in-memory (reset on cold start).',
  });
}

export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const clusterId = typeof (json as Record<string, unknown>).clusterId === 'string'
    ? String((json as Record<string, unknown>).clusterId).trim() : '';
  if (!clusterId) return Response.json({ error: 'clusterId is required.' }, { status: 400 });
  const redis = getRedis();
  if (redis) await redis.incr(voteKey(clusterId));
  else memory.set(clusterId, (memory.get(clusterId) ?? 0) + 1);
  return Response.json({
    votes: await readVotes(),
    storage: redisAvailable() ? 'redis' : 'memory',
    note: redisAvailable() ? undefined : 'Redis not configured - votes are in-memory (reset on cold start).',
  });
}
