import { getRedis, redisAvailable } from '../../../lib/redis';
import { evaluateMeter, HARD_LIMIT, normalizeSession } from '../../../logic';

function mem(): Map<string, number> {
  const g = globalThis as unknown as { __meter?: Map<string, number> };
  if (!g.__meter) g.__meter = new Map();
  return g.__meter;
}

async function getCount(sessionId: string): Promise<number> {
  const redis = getRedis();
  if (redis) return Number((await redis.get<number>(`meter:${sessionId}`)) ?? 0);
  return mem().get(sessionId) ?? 0;
}

async function incr(sessionId: string): Promise<number> {
  const redis = getRedis();
  if (redis) return Number(await redis.incr(`meter:${sessionId}`));
  const next = (mem().get(sessionId) ?? 0) + 1;
  mem().set(sessionId, next);
  return next;
}

function storageNote() {
  return redisAvailable() ? undefined : 'Redis not configured - meters are in-memory.';
}

export async function GET(request: Request) {
  const sessionId = normalizeSession(new URL(request.url).searchParams.get('sessionId') || '');
  const count = await getCount(sessionId);
  return Response.json({
    meter: evaluateMeter(count, sessionId),
    storage: redisAvailable() ? 'redis' : 'memory',
    note: storageNote(),
  });
}

export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const sessionId = normalizeSession(
    typeof (json as Record<string, unknown>).sessionId === 'string'
      ? String((json as Record<string, unknown>).sessionId) : '',
  );
  const current = await getCount(sessionId);
  if (current >= HARD_LIMIT) {
    return Response.json({
      error: 'Hard usage limit reached for this session.',
      meter: evaluateMeter(current, sessionId),
      storage: redisAvailable() ? 'redis' : 'memory',
      note: storageNote(),
    }, { status: 429 });
  }
  const count = await incr(sessionId);
  const meter = evaluateMeter(count, sessionId);
  return Response.json({
    meter,
    storage: redisAvailable() ? 'redis' : 'memory',
    note: meter.softExceeded
      ? `Soft limit reached (still allowed until ${HARD_LIMIT}). ${storageNote() || ''}`.trim()
      : storageNote(),
  });
}
