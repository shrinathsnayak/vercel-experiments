import { getRedis, redisAvailable } from '../../../lib/redis';
import { clampRows, type SheetRow } from '../../../logic';

function store(): { rows: SheetRow[]; last: unknown } {
  const g = globalThis as unknown as { __w2s?: { rows: SheetRow[]; last: unknown } };
  if (!g.__w2s) g.__w2s = { rows: [], last: null };
  return g.__w2s;
}

export async function GET() {
  const redis = getRedis();
  const rows = redis
    ? clampRows((await redis.get<SheetRow[]>('w2s:rows')) ?? [])
    : clampRows(store().rows);
  return Response.json({
    rows, storage: redisAvailable() ? 'redis' : 'memory',
    note: redisAvailable() ? undefined : 'Redis not configured - sheet rows are in-memory.',
  });
}
