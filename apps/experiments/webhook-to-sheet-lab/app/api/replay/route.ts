import { getRedis, redisAvailable } from '../../../lib/redis';
import { clampRows, flattenPayload, type SheetRow } from '../../../logic';

function store(): { rows: SheetRow[]; last: unknown } {
  const g = globalThis as unknown as { __w2s?: { rows: SheetRow[]; last: unknown } };
  if (!g.__w2s) g.__w2s = { rows: [], last: null };
  return g.__w2s;
}

export async function POST() {
  const redis = getRedis();
  let last: unknown = null;
  let rows: SheetRow[] = [];
  if (redis) {
    last = await redis.get('w2s:last');
    rows = clampRows((await redis.get<SheetRow[]>('w2s:rows')) ?? []);
  } else {
    last = store().last;
    rows = store().rows;
  }
  if (last === null || last === undefined) {
    return Response.json({ error: 'No payload to replay yet.' }, { status: 400 });
  }
  const row: SheetRow = {
    id: `replay-${Date.now()}`, receivedAt: new Date().toISOString(), columns: flattenPayload(last),
  };
  const next = clampRows([row, ...rows]);
  if (redis) await redis.set('w2s:rows', next);
  else store().rows = next;
  return Response.json({
    row, rows: next, storage: redisAvailable() ? 'redis' : 'memory',
    note: 'Replayed last captured payload as a new row.',
  });
}
