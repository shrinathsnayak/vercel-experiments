import { getSql, postgresAvailable } from '../../../lib/postgres';
import { progressPercent } from '../../../logic';

const memory = new Map<string, boolean>();

export async function PATCH(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const id = typeof (json as { id?: unknown })?.id === 'string' ? (json as { id: string }).id : '';
  const done = Boolean((json as { done?: unknown })?.done);
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });

  if (postgresAvailable()) {
    const sql = getSql()!;
    await sql`create table if not exists onboarding_progress (id text primary key, done boolean not null)`;
    await sql`insert into onboarding_progress (id, done) values (${id}, ${done})
      on conflict (id) do update set done = excluded.done`;
    const rows = await sql`select done from onboarding_progress`;
    const total = rows.length;
    const finished = rows.filter((r: { done: boolean }) => r.done).length;
    return Response.json({ storage: 'neon', percent: progressPercent(finished, total) });
  }
  memory.set(id, done);
  const vals = [...memory.values()];
  return Response.json({
    storage: 'memory',
    percent: progressPercent(vals.filter(Boolean).length, vals.length || 1),
  });
}
