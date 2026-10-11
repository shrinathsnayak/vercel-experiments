import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { clampVoiceResult, MAX_TRANSCRIPT_CHARS, truncateText } from '../../../logic';

export const maxDuration = 60;

const schema = z.object({
  summary: z.string(),
  chapters: z
    .array(
      z.object({
        title: z.string(),
        startHint: z.string(),
        summary: z.string(),
      }),
    )
    .max(8),
  actions: z.array(z.string()).max(10),
});

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

  const body = json as Record<string, unknown>;
  const transcript =
    typeof body.transcript === 'string' ? truncateText(body.transcript) : '';
  const audioStub = body.audioStub === true;

  if (!transcript) {
    return Response.json({ error: 'transcript is required.' }, { status: 400 });
  }

  const result = await generateObject({
    model: resolveModel(),
    schema,
    prompt: `You are structuring a voice note transcript into chapters, a short summary, and action items.
Stay faithful to the transcript. startHint can be approximate timestamps or "early/mid/late".
${audioStub ? 'Note: audio upload is a stub in this demo; only the pasted transcript is authoritative.' : ''}

TRANSCRIPT (max ${MAX_TRANSCRIPT_CHARS} chars):
${transcript}`,
  });

  return Response.json({
    result: clampVoiceResult(result.object),
    provider: providerLabel(),
    audioStub,
  });
}
