import { getSql, postgresAvailable } from '../../../lib/postgres';
import {
  assignPosition,
  boostPosition,
  clampEntries,
  isValidEmail,
  makeReferralCode,
  MAX_ENTRIES,
  normalizeEmail,
  type WaitlistEntry,
} from '../../../logic';

const memory = new Map<string, WaitlistEntry>();

async function ensureTable() {
  const sql = getSql();
  if (!sql) return null;
  await sql`
    CREATE TABLE IF NOT EXISTS experiment_waitlist (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      referral_code TEXT NOT NULL UNIQUE,
      referred_by TEXT,
      position INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  return sql;
}

function storageLabel(): 'neon' | 'memory' {
  return postgresAvailable() ? 'neon' : 'memory';
}

async function listEntries(): Promise<WaitlistEntry[]> {
  const sql = await ensureTable();
  if (sql) {
    const rows = await sql`
      SELECT id, email, referral_code, referred_by, position, created_at
      FROM experiment_waitlist
      ORDER BY position ASC
      LIMIT ${MAX_ENTRIES}
    `;
    return clampEntries(
      rows.map((row) => ({
        id: String(row.id),
        email: String(row.email),
        referralCode: String(row.referral_code),
        referredBy: row.referred_by ? String(row.referred_by) : undefined,
        position: Number(row.position),
        createdAt: new Date(String(row.created_at)).toISOString(),
      })),
    );
  }
  return clampEntries([...memory.values()]);
}

async function countByReferrer(code: string): Promise<number> {
  const sql = await ensureTable();
  if (sql) {
    const rows = await sql`
      SELECT COUNT(*)::int AS c FROM experiment_waitlist WHERE referred_by = ${code}
    `;
    return Number(rows[0]?.c ?? 0);
  }
  return [...memory.values()].filter((e) => e.referredBy === code).length;
}

async function findByReferralCode(code: string): Promise<WaitlistEntry | null> {
  const entries = await listEntries();
  return entries.find((e) => e.referralCode === code) ?? null;
}

async function persist(entry: WaitlistEntry) {
  const sql = await ensureTable();
  if (sql) {
    await sql`
      INSERT INTO experiment_waitlist (id, email, referral_code, referred_by, position)
      VALUES (${entry.id}, ${entry.email}, ${entry.referralCode}, ${entry.referredBy ?? null}, ${entry.position})
      ON CONFLICT (email) DO NOTHING
    `;
    return;
  }
  if (![...memory.values()].some((e) => e.email === entry.email)) {
    memory.set(entry.id, entry);
  }
}

export async function GET() {
  const entries = await listEntries();
  return Response.json({
    entries,
    storage: storageLabel(),
    note:
      storageLabel() === 'memory'
        ? 'DATABASE_URL not set - using in-memory waitlist (resets on cold start).'
        : undefined,
  });
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const body = json as Record<string, unknown>;
  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
  const referredByRaw =
    typeof body.referredBy === 'string' ? body.referredBy.trim().toUpperCase() : '';

  if (!email || !isValidEmail(email)) {
    return Response.json({ error: 'Valid email is required.' }, { status: 400 });
  }

  const existing = (await listEntries()).find((e) => e.email === email);
  if (existing) {
    return Response.json({
      entry: existing,
      entries: await listEntries(),
      storage: storageLabel(),
      note: 'Email already on the waitlist.',
    });
  }

  let referredBy: string | undefined;
  if (referredByRaw) {
    const referrer = await findByReferralCode(referredByRaw);
    if (!referrer) {
      return Response.json({ error: 'Unknown referral code.' }, { status: 400 });
    }
    referredBy = referrer.referralCode;
  }

  const base = assignPosition((await listEntries()).length);
  const referralCount = referredBy ? await countByReferrer(referredBy) : 0;
  const position = boostPosition(base, referredBy ? referralCount + 1 : 0);

  const entry: WaitlistEntry = {
    id: `wl-${Date.now()}`,
    email,
    referralCode: makeReferralCode(email),
    referredBy,
    position,
    createdAt: new Date().toISOString(),
  };

  await persist(entry);
  const entries = await listEntries();

  return Response.json({
    entry,
    entries,
    storage: storageLabel(),
    note:
      storageLabel() === 'memory'
        ? 'DATABASE_URL not set - using in-memory waitlist (resets on cold start).'
        : undefined,
  });
}
