import { generateText } from 'ai';
import { aiProviderAvailable } from '../../../lib/services';
import { resolveModel, providerLabel } from '../../../lib/ai-model';
import { getRedis, redisAvailable } from '../../../lib/redis';
import {
  AUDIT_KEY,
  clampAudit,
  evaluatePolicy,
  RATE_LIMIT_KEY_PREFIX,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_SECONDS,
  truncateText,
  type AuditEntry,
} from '../../../logic';

export const maxDuration = 60;

const memoryAudit: AuditEntry[] = [];

async function rateLimit(): Promise<{ limited: boolean; note?: string }> {
  const redis = getRedis();
  if (!redis) {
    return { limited: false, note: 'Redis not configured — rate limit skipped.' };
  }
  const key = `${RATE_LIMIT_KEY_PREFIX}${Math.floor(Date.now() / (RATE_LIMIT_WINDOW_SECONDS * 1000))}`;
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
  return { limited: n > RATE_LIMIT_MAX };
}

async function loadAudit(): Promise<AuditEntry[]> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get<AuditEntry[]>(AUDIT_KEY);
    return clampAudit(Array.isArray(raw) ? raw : []);
  }
  return clampAudit(memoryAudit);
}

async function saveAudit(entries: AuditEntry[]) {
  const clamped = clampAudit(entries);
  const redis = getRedis();
  if (redis) {
    await redis.set(AUDIT_KEY, clamped, { ex: 60 * 60 * 24 });
    return;
  }
  memoryAudit.length = 0;
  memoryAudit.push(...clamped);
}

export async function POST(request: Request) {
  const rl = await rateLimit();
  if (rl.limited) {
    return Response.json({ error: 'Rate limit exceeded. Try again shortly.' }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const input =
    typeof (json as { input?: unknown })?.input === 'string'
      ? truncateText((json as { input: string }).input)
      : '';
  if (!input) return Response.json({ error: 'input is required.' }, { status: 400 });

  const decision = evaluatePolicy(input);
  let output = '';

  if (decision.action === 'block') {
    output = 'Blocked by policy.';
  } else if (decision.action === 'rewrite') {
    output = decision.rewritten ?? 'Rewritten.';
  } else if (aiProviderAvailable()) {
    const result = await generateText({
      model: resolveModel(),
      prompt: input,
      system: 'Answer helpfully within normal product documentation scope. Never invent secrets.',
    });
    output = result.text;
  } else {
    output = 'Allowed by policy. Configure AI_GATEWAY_API_KEY to generate a model reply.';
  }

  const entry: AuditEntry = {
    at: new Date().toISOString(),
    action: decision.action,
    reason: decision.reason,
    inputPreview: input.slice(0, 120),
    outputPreview: output.slice(0, 120),
  };
  const audit = clampAudit([entry, ...(await loadAudit())]);
  await saveAudit(audit);

  return Response.json({
    action: decision.action,
    reason: decision.reason,
    output,
    audit,
    redis: redisAvailable(),
    provider: aiProviderAvailable() ? providerLabel() : null,
    note: rl.note,
  });
}
