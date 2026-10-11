import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSql, postgresAvailable } from '../../../../lib/postgres';

const noteSchema = z.object({
  body: z.string().min(1).max(280),
});

async function ensureTable() {
  const sql = getSql();
  if (!sql) return null;
  await sql`
    CREATE TABLE IF NOT EXISTS experiment_notes (
      id SERIAL PRIMARY KEY,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  return sql;
}

export async function GET() {
  if (!postgresAvailable()) {
    return NextResponse.json(
      {
        error: 'Postgres is not configured',
        setup:
          'Add Neon via the Vercel Marketplace (included in the platform Deploy button) so DATABASE_URL is injected.',
      },
      { status: 503 },
    );
  }

  const sql = await ensureTable();
  if (!sql) {
    return NextResponse.json({ error: 'Postgres unavailable' }, { status: 503 });
  }

  const rows = await sql`
    SELECT id, body, created_at AS "createdAt"
    FROM experiment_notes
    ORDER BY created_at DESC
    LIMIT 20
  `;

  return NextResponse.json({ notes: rows, backend: 'neon-postgres' });
}

export async function POST(request: Request) {
  if (!postgresAvailable()) {
    return NextResponse.json({ error: 'Postgres is not configured' }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = noteSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'body must be 1–280 characters' }, { status: 400 });
  }

  const sql = await ensureTable();
  if (!sql) {
    return NextResponse.json({ error: 'Postgres unavailable' }, { status: 503 });
  }

  const rows = await sql`
    INSERT INTO experiment_notes (body)
    VALUES (${parsed.data.body})
    RETURNING id, body, created_at AS "createdAt"
  `;

  return NextResponse.json({ note: rows[0], backend: 'neon-postgres' }, { status: 201 });
}
