import { getRedis } from '../../../lib/redis';
import { memoryMessages, setMemoryMessages } from '../../../lib/store';
import {
  clampMessages,
  DIGEST_KEY,
  SEED_MESSAGES,
  type InboxMessage,
} from '../../../logic';

function storageLabel(): 'redis' | 'memory' {
  return getRedis() ? 'redis' : 'memory';
}

export async function POST() {
  const stamp = Date.now();
  const seeded: InboxMessage[] = SEED_MESSAGES.map((m, i) => ({
    ...m,
    id: `msg-${stamp}-${i + 1}`,
    receivedAt: new Date(stamp - i * 60_000).toISOString(),
  }));

  const redis = getRedis();
  if (redis) {
    await redis.set(DIGEST_KEY, seeded);
  } else {
    setMemoryMessages(seeded);
  }

  return Response.json({
    messages: clampMessages(seeded),
    storage: storageLabel(),
    note:
      storageLabel() === 'memory'
        ? 'Redis not configured - seed lives in process memory (resets on cold start).'
        : undefined,
  });
}

export async function GET() {
  const redis = getRedis();
  if (redis) {
    const stored = (await redis.get<InboxMessage[]>(DIGEST_KEY)) ?? [];
    return Response.json({ messages: clampMessages(stored), storage: 'redis' as const });
  }
  return Response.json({
    messages: clampMessages(memoryMessages),
    storage: 'memory' as const,
    note: 'Redis not configured - using in-memory messages.',
  });
}
