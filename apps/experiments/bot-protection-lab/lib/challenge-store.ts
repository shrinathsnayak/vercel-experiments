type Entry = { answer: number; expiresAt: number; used: boolean };

const memory = new Map<string, Entry>();

export function storeChallenge(id: string, answer: number, expiresAt: number) {
  memory.set(id, { answer, expiresAt, used: false });
}

export function consumeChallenge(id: string, answer: number, now: number): 'ok' | 'missing' | 'expired' | 'bad' | 'replay' {
  const entry = memory.get(id);
  if (!entry) return 'missing';
  if (entry.used) return 'replay';
  if (now > entry.expiresAt) return 'expired';
  if (entry.answer !== answer) return 'bad';
  entry.used = true;
  return 'ok';
}

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number, now: number) {
  const cur = buckets.get(key);
  if (!cur || now >= cur.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  if (cur.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: cur.resetAt - now };
  }
  cur.count += 1;
  return { allowed: true, remaining: limit - cur.count };
}
