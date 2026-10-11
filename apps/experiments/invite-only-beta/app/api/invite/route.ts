import { getRedis, redisAvailable } from '../../../lib/redis';
import { isSeedCode, isValidEmail, normalizeCode, normalizeEmail } from '../../../logic';

function mem(): { used: Set<string>; members: Set<string> } {
  const g = globalThis as unknown as { __invite?: { used: Set<string>; members: Set<string> } };
  if (!g.__invite) g.__invite = { used: new Set(), members: new Set() };
  return g.__invite;
}

async function load() {
  const redis = getRedis();
  if (redis) {
    const used = new Set((await redis.smembers('invite:used')) as string[]);
    const members = new Set((await redis.smembers('invite:members')) as string[]);
    return { used, members };
  }
  return mem();
}

async function saveMember(code: string, email: string) {
  const redis = getRedis();
  if (redis) {
    await redis.sadd('invite:used', code);
    await redis.sadd('invite:members', email);
    return;
  }
  const m = mem();
  m.used.add(code);
  m.members.add(email);
}

export async function GET(request: Request) {
  const email = normalizeEmail(new URL(request.url).searchParams.get('email') || '');
  const { members } = await load();
  return Response.json({
    allowed: email ? members.has(email) : false,
    members: [...members].slice(0, 50),
    storage: redisAvailable() ? 'redis' : 'memory',
    note: redisAvailable() ? undefined : 'Redis not configured - allowlist is in-memory.',
  });
}

export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const body = json as Record<string, unknown>;
  const code = typeof body.code === 'string' ? normalizeCode(body.code) : '';
  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
  if (!isSeedCode(code)) return Response.json({ error: 'Unknown invite code.' }, { status: 400 });
  if (!email || !isValidEmail(email)) return Response.json({ error: 'Valid email required.' }, { status: 400 });
  const { used, members } = await load();
  if (used.has(code) && !members.has(email)) {
    return Response.json({ error: 'Invite code already redeemed.' }, { status: 400 });
  }
  await saveMember(code, email);
  const next = await load();
  return Response.json({
    allowed: true,
    members: [...next.members].slice(0, 50),
    storage: redisAvailable() ? 'redis' : 'memory',
    note: redisAvailable() ? undefined : 'Redis not configured - allowlist is in-memory.',
  });
}
