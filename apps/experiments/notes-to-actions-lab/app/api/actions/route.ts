import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable, getServiceStatus } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { getSql, postgresAvailable } from '../../../lib/postgres';
import {
  clampActions,
  MAX_ACTIONS,
  MAX_NOTES_CHARS,
  truncateText,
  type ActionItem,
  type ActionStatus,
} from '../../../logic';

export const maxDuration = 60;

const memory = new Map<string, ActionItem>();

const generatedSchema = z.object({
  actions: z
    .array(
      z.object({
        title: z.string(),
        owner: z.string().optional(),
        due: z.string().optional(),
        status: z.enum(['open', 'done']).optional(),
      }),
    )
    .max(MAX_ACTIONS),
});

async function ensureTable() {
  const sql = getSql();
  if (!sql) return null;
  await sql`
    CREATE TABLE IF NOT EXISTS experiment_actions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      owner TEXT,
      due TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  return sql;
}

function storageLabel(): 'neon' | 'memory' {
  return postgresAvailable() ? 'neon' : 'memory';
}

async function listActions(): Promise<ActionItem[]> {
  const sql = await ensureTable();
  if (sql) {
    const rows = await sql`
      SELECT id, title, owner, due, status
      FROM experiment_actions
      ORDER BY created_at DESC
      LIMIT ${MAX_ACTIONS}
    `;
    return clampActions(
      rows.map((row) => ({
        id: String(row.id),
        title: String(row.title),
        owner: row.owner ? String(row.owner) : undefined,
        due: row.due ? String(row.due) : undefined,
        status: (row.status === 'done' ? 'done' : 'open') as ActionStatus,
      })),
    );
  }
  return clampActions([...memory.values()]);
}

async function persistActions(items: ActionItem[]) {
  const sql = await ensureTable();
  if (sql) {
    for (const item of items) {
      await sql`
        INSERT INTO experiment_actions (id, title, owner, due, status)
        VALUES (${item.id}, ${item.title}, ${item.owner ?? null}, ${item.due ?? null}, ${item.status})
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          owner = EXCLUDED.owner,
          due = EXCLUDED.due,
          status = EXCLUDED.status
      `;
    }
    return;
  }
  for (const item of items) memory.set(item.id, item);
}

async function updateStatus(id: string, status: ActionStatus): Promise<ActionItem | null> {
  const sql = await ensureTable();
  if (sql) {
    const rows = await sql`
      UPDATE experiment_actions
      SET status = ${status}
      WHERE id = ${id}
      RETURNING id, title, owner, due, status
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      id: String(row.id),
      title: String(row.title),
      owner: row.owner ? String(row.owner) : undefined,
      due: row.due ? String(row.due) : undefined,
      status: row.status === 'done' ? 'done' : 'open',
    };
  }
  const existing = memory.get(id);
  if (!existing) return null;
  const next = { ...existing, status };
  memory.set(id, next);
  return next;
}

export async function GET() {
  const actions = await listActions();
  return Response.json({
    actions,
    storage: storageLabel(),
    note:
      storageLabel() === 'memory'
        ? 'DATABASE_URL not set - using in-memory session list (resets on cold start).'
        : undefined,
  });
}

export async function POST(request: Request) {
  if (!aiProviderAvailable()) {
    return Response.json(AI_SETUP_BODY, { status: 503 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const notes =
    typeof (json as { notes?: unknown })?.notes === 'string'
      ? truncateText((json as { notes: string }).notes)
      : '';

  if (!notes) {
    return Response.json({ error: 'notes is required.' }, { status: 400 });
  }

  const result = await generateObject({
    model: resolveModel(),
    schema: generatedSchema,
    prompt: `Extract up to ${MAX_ACTIONS} action items from these meeting notes.
Each item needs a clear title. Include owner and due when mentioned.
Default status to "open" unless the notes say the task is done.

NOTES (max ${MAX_NOTES_CHARS} chars):
${notes}`,
  });

  const stamp = Date.now();
  const actions = clampActions(
    result.object.actions.map((item, i) => ({
      id: `a-${stamp}-${i + 1}`,
      title: item.title,
      owner: item.owner,
      due: item.due,
      status: item.status === 'done' ? 'done' : 'open',
    })),
  );

  await persistActions(actions);
  const listed = await listActions();

  return Response.json({
    actions: listed,
    generated: actions.length,
    storage: storageLabel(),
    provider: providerLabel(),
    postgres: getServiceStatus('postgres').available,
    note:
      storageLabel() === 'memory'
        ? 'DATABASE_URL not set - using in-memory session list (resets on cold start).'
        : undefined,
  });
}

export async function PATCH(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const id =
    typeof (json as { id?: unknown })?.id === 'string'
      ? (json as { id: string }).id.trim()
      : '';
  const statusRaw = (json as { status?: unknown })?.status;
  const status: ActionStatus | null =
    statusRaw === 'open' || statusRaw === 'done' ? statusRaw : null;

  if (!id || !status) {
    return Response.json({ error: 'id and status (open|done) are required.' }, { status: 400 });
  }

  const updated = await updateStatus(id, status);
  if (!updated) {
    return Response.json({ error: 'Action not found.' }, { status: 404 });
  }

  return Response.json({
    action: updated,
    storage: storageLabel(),
  });
}
