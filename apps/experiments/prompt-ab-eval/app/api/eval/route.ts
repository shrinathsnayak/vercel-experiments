import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import {
  clampScore,
  MAX_PROMPT_CHARS,
  MAX_SYSTEM_CHARS,
  truncateText,
} from '../../../logic';

export const maxDuration = 60;

const judgeSchema = z.object({
  clarity: z.number(),
  helpfulness: z.number(),
  concision: z.number(),
  winner: z.enum(['A', 'B', 'tie']),
  rationale: z.string(),
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
  const systemA = typeof body.systemA === 'string' ? truncateText(body.systemA, MAX_SYSTEM_CHARS) : '';
  const systemB = typeof body.systemB === 'string' ? truncateText(body.systemB, MAX_SYSTEM_CHARS) : '';
  const user = typeof body.user === 'string' ? truncateText(body.user, MAX_PROMPT_CHARS) : '';
  if (!systemA || !systemB || !user) {
    return Response.json({ error: 'systemA, systemB, and user are required.' }, { status: 400 });
  }

  const model = resolveModel();
  const [a, b] = await Promise.all([
    generateText({ model, system: systemA, prompt: user }),
    generateText({ model, system: systemB, prompt: user }),
  ]);

  const judged = await generateObject({
    model,
    schema: judgeSchema,
    prompt: `Score outputs A and B from 1-5 for clarity, helpfulness, concision. Pick winner A, B, or tie.\n\nUSER:\n${user}\n\nA:\n${a.text}\n\nB:\n${b.text}`,
  });

  return Response.json({
    outputA: a.text,
    outputB: b.text,
    judge: {
      ...judged.object,
      clarity: clampScore(judged.object.clarity),
      helpfulness: clampScore(judged.object.helpfulness),
      concision: clampScore(judged.object.concision),
    },
    provider: providerLabel(),
  });
}
