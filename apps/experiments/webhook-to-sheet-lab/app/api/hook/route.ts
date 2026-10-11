import { getRedis, redisAvailable } from '../../../lib/redis';
import { clampRows, flattenPayload, MAX_PAYLOAD_CHARS, type SheetRow } from '../../../logic';

function store(): { rows: SheetRow[]; last: unknown } {
  const g = globalThis as unknown as { __w2s?: { rows: SheetRow[]; last: unknown } };
  if (!g.__w2s) g.__w2s = { rows: [], last: null };
  return g.__w2s;
}

async function load(): Promise<{ rows: SheetRow[]; last: unknown }> {
  const redis = getRedis();
  if (redis) {
    const rows = (await redis.get<SheetRow[]>('w2s:rows')) ?? [];
    const last = (await redis.get('w2s:last')) ?? null;
    return { rows: clampRows(rows), last };
  }
  return store();
}

async function save(rows: SheetRow[], last: unknown) {
  const redis = getRedis();
  if (redis) {
    await redis.set('w2s:rows', clampRows(rows));
    await redis.set('w2s:last', last);
    return;
  }
  const s = store();
  s.rows = clampRows(rows);
  s.last = last;
}

export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const raw = JSON.stringify(json);
  if (raw.length > MAX_PAYLOAD_CHARS) return Response.json({ error: 'Payload too large' }, { status: 400 });
  const { rows } = await load();
  const row: SheetRow = {
    id: `r-${Date.now()}`, receivedAt: new Date().toISOString(), columns: flattenPayload(json),
  };
  const next = clampRows([row, ...rows]);
  await save(next, json);
  return Response.json({
    row, rows: next, storage: redisAvailable() ? 'redis' : 'memory',
    note: redisAvailable() ? undefined : 'Redis not configured - sheet rows are in-memory.',
  });
}
