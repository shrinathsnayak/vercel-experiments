import { getSql, postgresAvailable } from '../../../lib/postgres';
import { type ApprovalItem, applyDecision } from '../../../logic';

const memory = new Map<string, ApprovalItem>();

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
  // share process memory with workflow route via global
  const g = globalThis as unknown as { __approvalMemory?: Map<string, ApprovalItem> };
  if (!g.__approvalMemory) g.__approvalMemory = memory;
  return [...g.__approvalMemory.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const body = json as Record<string, unknown>;
  const token = typeof body.token === 'string' ? body.token.trim() : '';
  const decision = body.decision === 'reject' ? 'reject' : body.decision === 'approve' ? 'approve' : null;
  if (!token || !decision) return Response.json({ error: 'token and decision required.' }, { status: 400 });

  const sql = await ensure();
  let item: ApprovalItem | undefined;
  if (sql) {
    const rows = await sql`SELECT * FROM approval_items WHERE approve_token = ${token} OR reject_token = ${token} LIMIT 1`;
    const r = rows[0];
    if (!r) return Response.json({ error: 'Unknown token' }, { status: 404 });
    item = {
      id: String(r.id), title: String(r.title), body: String(r.body),
      status: r.status as ApprovalItem['status'],
      approveToken: String(r.approve_token), rejectToken: String(r.reject_token),
      createdAt: new Date(String(r.created_at)).toISOString(),
    };
    const expected = decision === 'approve' ? item.approveToken : item.rejectToken;
    if (token !== expected) return Response.json({ error: 'Token does not match decision.' }, { status: 400 });
    const next = applyDecision(item.status, decision);
    if (!next) return Response.json({ error: 'Item is not pending.' }, { status: 400 });
    await sql`UPDATE approval_items SET status = ${next}, decided_at = NOW() WHERE id = ${item.id}`;
    item.status = next;
  } else {
    const g = globalThis as unknown as { __approvalMemory?: Map<string, ApprovalItem> };
    if (!g.__approvalMemory) g.__approvalMemory = new Map();
    item = [...g.__approvalMemory.values()].find(
      (i) => i.approveToken === token || i.rejectToken === token,
    );
    if (!item) return Response.json({ error: 'Unknown token' }, { status: 404 });
    const expected = decision === 'approve' ? item.approveToken : item.rejectToken;
    if (token !== expected) return Response.json({ error: 'Token does not match decision.' }, { status: 400 });
    const next = applyDecision(item.status, decision);
    if (!next) return Response.json({ error: 'Item is not pending.' }, { status: 400 });
    item.status = next;
    item.decidedAt = new Date().toISOString();
    g.__approvalMemory.set(item.id, item);
  }

  return Response.json({
    item,
    items: await listItems(),
    storage: postgresAvailable() ? 'neon' : 'memory',
    note: postgresAvailable() ? undefined : 'DATABASE_URL not set - using in-memory approvals (reset on cold start).',
  });
}
