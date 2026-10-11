import { getSql, postgresAvailable } from '../../../lib/postgres';
import { clampNote, resolveTenant, type Note } from '../../../logic';

function mem(): Map<string, Note[]> {
  const g = globalThis as unknown as { __mtNotes?: Map<string, Note[]> };
  if (!g.__mtNotes) g.__mtNotes = new Map();
  return g.__mtNotes;
}

async function ensure() {
  const sql = getSql();
  if (!sql) return null;
  await sql`CREATE TABLE IF NOT EXISTS mt_notes (
    id TEXT PRIMARY KEY, tenant TEXT NOT NULL, text TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  return sql;
}

async function listFor(tenant: string): Promise<Note[]> {
  const sql = await ensure();
  if (sql) {
    const rows = await sql`SELECT * FROM mt_notes WHERE tenant = ${tenant} ORDER BY created_at DESC LIMIT 50`;
    return rows.map((r) => ({
      id: String(r.id), tenant: String(r.tenant), text: String(r.text),
      createdAt: new Date(String(r.created_at)).toISOString(),
    }));
  }
  return mem().get(tenant) ?? [];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tenant = resolveTenant({
    header: request.headers.get('x-tenant-id'),
    query: url.searchParams.get('tenant'),
  });
  if (!tenant) return Response.json({ error: 'tenant required (header x-tenant-id or ?tenant=)' }, { status: 400 });
  return Response.json({
    tenant, notes: await listFor(tenant),
    storage: postgresAvailable() ? 'neon' : 'memory',
    note: postgresAvailable() ? undefined : 'DATABASE_URL not set - notes are in-memory per tenant.',
  });
}

export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const body = json as Record<string, unknown>;
  const tenant = resolveTenant({
    header: request.headers.get('x-tenant-id'),
    body: typeof body.tenant === 'string' ? body.tenant : null,
  });
  const text = typeof body.text === 'string' ? clampNote(body.text) : '';
  if (!tenant) return Response.json({ error: 'tenant required' }, { status: 400 });
  if (!text) return Response.json({ error: 'text required' }, { status: 400 });
  const item: Note = { id: `n-${Date.now()}`, tenant, text, createdAt: new Date().toISOString() };
  const sql = await ensure();
  if (sql) {
    await sql`INSERT INTO mt_notes (id, tenant, text) VALUES (${item.id}, ${item.tenant}, ${item.text})`;
  } else {
    const list = mem().get(tenant) ?? [];
    list.unshift(item);
    mem().set(tenant, list.slice(0, 50));
  }
  return Response.json({
    noteItem: item, notes: await listFor(tenant), tenant,
    storage: postgresAvailable() ? 'neon' : 'memory',
    note: postgresAvailable() ? undefined : 'DATABASE_URL not set - notes are in-memory per tenant.',
  });
}
