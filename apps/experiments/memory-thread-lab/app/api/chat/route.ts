import { generateText } from 'ai';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { getRedis } from '../../../lib/redis';
import { memoryThreads } from '../../../lib/store';
import {
  clampMessages,
  newThreadId,
  THREAD_KEY_PREFIX,
  THREAD_TTL_SECONDS,
  truncateText,
  ttlVisualization,
  type ChatMessage,
  type ThreadState,
} from '../../../logic';

export const maxDuration = 60;

async function loadMessages(id: string): Promise<ChatMessage[]> {
  const redis = getRedis();
  if (redis) {
    return (await redis.get<ChatMessage[]>(`${THREAD_KEY_PREFIX}${id}`)) ?? [];
  }
  return memoryThreads.get(id)?.messages ?? [];
}

async function saveMessages(id: string, messages: ChatMessage[]): Promise<ThreadState> {
  const clamped = clampMessages(messages);
  const redis = getRedis();
  if (redis) {
    const key = `${THREAD_KEY_PREFIX}${id}`;
    await redis.set(key, clamped, { ex: THREAD_TTL_SECONDS });
    const expiresAt = new Date(Date.now() + THREAD_TTL_SECONDS * 1000).toISOString();
    return {
      id,
      messages: clamped,
      storage: 'redis',
      ttlSeconds: THREAD_TTL_SECONDS,
      expiresAt,
    };
  }
  memoryThreads.set(id, { messages: clamped, createdAt: Date.now() });
  return {
    id,
    messages: clamped,
    storage: 'memory',
    ttlSeconds: null,
    expiresAt: null,
  };
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

  const message =
    typeof (json as { message?: unknown })?.message === 'string'
      ? truncateText((json as { message: string }).message)
      : '';
  const threadId =
    typeof (json as { threadId?: unknown })?.threadId === 'string'
      ? (json as { threadId: string }).threadId.trim()
      : '';

  if (!message) {
    return Response.json({ error: 'message is required.' }, { status: 400 });
  }

  const id = threadId || newThreadId();
  const prior = await loadMessages(id);
  const userMsg: ChatMessage = {
    role: 'user',
    content: message,
    at: new Date().toISOString(),
  };
  const withUser = [...prior, userMsg];

  const result = await generateText({
    model: resolveModel(),
    system:
      'You are a concise assistant in a multi-turn demo. Use prior messages as memory. Keep replies under 80 words.',
    messages: withUser.map((m) => ({ role: m.role, content: m.content })),
  });

  const assistantMsg: ChatMessage = {
    role: 'assistant',
    content: result.text.trim(),
    at: new Date().toISOString(),
  };

  const thread = await saveMessages(id, [...withUser, assistantMsg]);
  const viz = ttlVisualization(thread.ttlSeconds, thread.expiresAt);

  return Response.json({
    thread,
    reply: assistantMsg.content,
    provider: providerLabel(),
    ttl: viz,
    note:
      thread.storage === 'memory'
        ? 'Redis not configured - thread lives in process memory (no TTL).'
        : undefined,
  });
}
