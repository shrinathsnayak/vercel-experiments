import { getRedis } from '../../../lib/redis';
import { memoryThreads } from '../../../lib/store';
import {
  clampMessages,
  THREAD_KEY_PREFIX,
  THREAD_TTL_SECONDS,
  ttlVisualization,
  type ChatMessage,
  type ThreadState,
} from '../../../logic';

async function load(id: string): Promise<ThreadState | null> {
  const redis = getRedis();
  if (redis) {
    const key = `${THREAD_KEY_PREFIX}${id}`;
    const messages = await redis.get<ChatMessage[]>(key);
    if (!messages) return null;
    const ttl = await redis.ttl(key);
    const ttlSeconds = ttl > 0 ? ttl : THREAD_TTL_SECONDS;
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    return {
      id,
      messages: clampMessages(messages),
      storage: 'redis',
      ttlSeconds: THREAD_TTL_SECONDS,
      expiresAt,
    };
  }
  const mem = memoryThreads.get(id);
  if (!mem) return null;
  return {
    id,
    messages: clampMessages(mem.messages),
    storage: 'memory',
    ttlSeconds: null,
    expiresAt: null,
  };
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id')?.trim() ?? '';
  if (!id) {
    return Response.json({ error: 'id query param required.' }, { status: 400 });
  }
  const thread = await load(id);
  if (!thread) {
    return Response.json({ error: 'Thread not found or expired.' }, { status: 404 });
  }
  const viz = ttlVisualization(thread.ttlSeconds, thread.expiresAt);
  return Response.json({ thread, ttl: viz });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get('id')?.trim() ?? '';
  if (!id) {
    return Response.json({ error: 'id query param required.' }, { status: 400 });
  }
  const redis = getRedis();
  if (redis) await redis.del(`${THREAD_KEY_PREFIX}${id}`);
  else memoryThreads.delete(id);
  return Response.json({ ok: true, id });
}
