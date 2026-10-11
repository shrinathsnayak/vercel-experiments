import { getSql, postgresAvailable } from '../../../lib/postgres';
import {
  type ApprovalItem, applyDecision, canSubmit, clampBody, clampTitle, makeToken,
} from '../../../logic';

function mem(): Map<string, ApprovalItem> {
  const g = globalThis as unknown as { __approvalMemory?: Map<string, ApprovalItem> };
  if (!g.__approvalMemory) g.__approvalMemory = new Map();
  return g.__approvalMemory;
}

async function ensure() {
  const sql = getSql();
  if (!sql) return null;
  await sql`CREATE TABLE IF NOT EXISTS approval_items (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL, status TEXT NOT NULL,
    approve_token TEXT NOT NULL, reject_token TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), decided_at TIMESTAMPTZ
  )`;
  return sql;
}

async function listItems(): Promise<ApprovalItem[]> {
  const sql = await ensure();
  if (sql) {
    const rows = await sql`SELECT * FROM approval_items ORDER BY created_at DESC LIMIT 50`;
    return rows.map((r) => ({
      id: String(r.id), title: String(r.title), body: String(r.body),
      status: r.status as ApprovalItem['status'],
      approveToken: String(r.approve_token), rejectToken: String(r.reject_token),
      createdAt: new Date(String(r.created_at)).toISOString(),
      decidedAt: r.decided_at ? new Date(String(r.decided_at)).toISOString() : undefined,
    }));
  }
  return [...mem().values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function note() {
  return postgresAvailable() ? undefined : 'DATABASE_URL not set - using in-memory approvals (reset on cold start).';
}

export async function GET() {
  return Response.json({ items: await listItems(), storage: postgresAvailable() ? 'neon' : 'memory', note: note() });
}

export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const body = json as Record<string, unknown>;
  const action = typeof body.action === 'string' ? body.action : 'create';

  if (action === 'create') {
    const title = typeof body.title === 'string' ? clampTitle(body.title) : '';
    const text = typeof body.body === 'string' ? clampBody(body.body) : '';
    if (!title) return Response.json({ error: 'title is required.' }, { status: 400 });
    const id = `ap-${Date.now()}`;
    const item: ApprovalItem = {
      id, title, body: text, status: 'draft',
      approveToken: makeToken(`a-${id}`), rejectToken: makeToken(`r-${id}`),
      createdAt: new Date().toISOString(),
    };
    const sql = await ensure();
    if (sql) {
      await sql`INSERT INTO approval_items (id, title, body, status, approve_token, reject_token)
        VALUES (${item.id}, ${item.title}, ${item.body}, ${item.status}, ${item.approveToken}, ${item.rejectToken})`;
    } else mem().set(item.id, item);
    return Response.json({ item, items: await listItems(), storage: postgresAvailable() ? 'neon' : 'memory', note: note() });
  }

  if (action === 'submit') {
    const id = typeof body.id === 'string' ? body.id : '';
    const items = await listItems();
    const item = items.find((i) => i.id === id);
    if (!item) return Response.json({ error: 'Not found' }, { status: 404 });
    if (!canSubmit(item.status)) return Response.json({ error: 'Only drafts can be submitted.' }, { status: 400 });
    item.status = 'pending';
    const sql = await ensure();
    if (sql) await sql`UPDATE approval_items SET status = 'pending' WHERE id = ${id}`;
    else mem().set(id, item);
    return Response.json({ item, items: await listItems(), storage: postgresAvailable() ? 'neon' : 'memory', note: note() });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
}

void applyDecision;
