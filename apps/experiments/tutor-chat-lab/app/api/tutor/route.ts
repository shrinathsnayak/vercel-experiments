import { streamText } from 'ai';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { MAX_TOPIC_CHARS, normalizeHistory, truncateText } from '../../../logic';

export const maxDuration = 60;

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const topic = typeof (json as { topic?: unknown })?.topic === 'string'
    ? truncateText((json as { topic: string }).topic, MAX_TOPIC_CHARS) : '';
  const messages = normalizeHistory((json as { messages?: unknown })?.messages);
  if (!topic) return Response.json({ error: 'topic is required.' }, { status: 400 });
  if (!messages.length) return Response.json({ error: 'messages are required.' }, { status: 400 });
  const result = streamText({
    model: resolveModel(),
    system: `You are a patient tutor for: ${topic}. Be clear and educational.`,
    messages,
  });
  return result.toTextStreamResponse({
    headers: { 'x-ai-provider': providerLabel(), 'cache-control': 'no-store' },
  });
}
