import { generateText } from 'ai';
import { aiProviderAvailable } from '../../../lib/services';
import { providerLabel, resolveModel } from '../../../lib/ai-model';
import { getRedis } from '../../../lib/redis';
import {
  memoryDigest,
  memoryMessages,
  setMemoryDigest,
} from '../../../lib/store';
import {
  clampMessages,
  deterministicDigest,
  DIGEST_KEY,
  LAST_DIGEST_KEY,
  type DigestResult,
  type InboxMessage,
} from '../../../logic';

export const maxDuration = 60;

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    const ua = request.headers.get('user-agent') ?? '';
    return ua.includes('vercel-cron') || process.env.NODE_ENV !== 'production';
  }
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

async function loadMessages(): Promise<{ messages: InboxMessage[]; storage: 'redis' | 'memory' }> {
  const redis = getRedis();
  if (redis) {
    const stored = (await redis.get<InboxMessage[]>(DIGEST_KEY)) ?? [];
    return { messages: clampMessages(stored), storage: 'redis' };
  }
  return { messages: clampMessages(memoryMessages), storage: 'memory' };
}

async function buildDigest(messages: InboxMessage[]): Promise<DigestResult> {
  const generatedAt = new Date().toISOString();
  if (aiProviderAvailable() && messages.length > 0) {
    const result = await generateText({
      model: resolveModel(),
      prompt: `Summarize this inbox into a short daily digest (bullets, max 8 lines). Stay faithful.

MESSAGES:
${messages.map((m) => `- From ${m.from}: ${m.subject} - ${m.body}`).join('\n')}`,
    });
    return {
      summary: result.text.trim(),
      messageCount: messages.length,
      mode: 'ai',
      generatedAt,
    };
  }
  return {
    summary: deterministicDigest(messages),
    messageCount: messages.length,
    mode: 'deterministic',
    generatedAt,
  };
}

async function runDigest() {
  const { messages, storage } = await loadMessages();
  const digest = await buildDigest(messages);
  const redis = getRedis();
  if (redis) {
    await redis.set(LAST_DIGEST_KEY, digest);
  } else {
    setMemoryDigest(digest);
  }

  return Response.json({
    digest,
    storage,
    provider: digest.mode === 'ai' ? providerLabel() : null,
    note:
      digest.mode === 'deterministic'
        ? 'No AI provider - used deterministic join of subjects/bodies.'
        : undefined,
  });
}

export async function GET(request: Request) {
  const force = new URL(request.url).searchParams.get('run') === '1';
  const ua = request.headers.get('user-agent') ?? '';
  const isVercelCron = ua.includes('vercel-cron');

  if (force || isVercelCron) {
    if (!authorize(request)) {
      return Response.json(
        { error: 'Unauthorized - set Authorization: Bearer CRON_SECRET' },
        { status: 401 },
      );
    }
    return runDigest();
  }

  const redis = getRedis();
  if (redis) {
    const last = await redis.get<DigestResult>(LAST_DIGEST_KEY);
    return Response.json({
      digest: last,
      storage: 'redis' as const,
      provider: aiProviderAvailable() ? providerLabel() : null,
    });
  }
  return Response.json({
    digest: memoryDigest,
    storage: 'memory' as const,
    note: 'Redis not configured - digest is process-local.',
    provider: aiProviderAvailable() ? providerLabel() : null,
  });
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runDigest();
}
