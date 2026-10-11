import { getRedis, redisAvailable } from '../../../lib/redis';

const memory = new Map<string, string[]>();

export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const habit = typeof (json as { habit?: unknown })?.habit === 'string' ? (json as { habit: string }).habit.trim() : '';
  if (!habit) return Response.json({ error: 'habit required' }, { status: 400 });
  const day = new Date().toISOString().slice(0, 10);
  const key = `habit:${habit.slice(0, 80)}`;
  if (redisAvailable()) {
    const redis = getRedis()!;
    await redis.sadd(key, day);
    const dates = (await redis.smembers(key)) as string[];
    return Response.json({ storage: 'redis', dates });
  }
  const prev = memory.get(key) ?? [];
  if (!prev.includes(day)) prev.push(day);
  memory.set(key, prev);
  return Response.json({ storage: 'memory', dates: prev });
}
