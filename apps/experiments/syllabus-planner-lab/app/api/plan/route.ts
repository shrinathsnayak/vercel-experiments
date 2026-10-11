import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { clampPlan, MAX_SYLLABUS_CHARS, MAX_WEEKS, truncateText } from '../../../logic';

export const maxDuration = 60;

const planSchema = z.object({
  courseTitle: z.string(),
  tips: z.array(z.string()).max(8),
  weeks: z
    .array(
      z.object({
        week: z.number().int().min(1),
        focus: z.string(),
        topics: z.array(z.string()).max(8),
        tasks: z.array(z.string()).max(8),
        estimatedHours: z.number(),
      }),
    )
    .max(MAX_WEEKS),
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

  const syllabus =
    typeof (json as { syllabus?: unknown })?.syllabus === 'string'
      ? truncateText((json as { syllabus: string }).syllabus)
      : '';

  if (!syllabus) {
    return Response.json({ error: 'syllabus is required.' }, { status: 400 });
  }

  const result = await generateObject({
    model: resolveModel(),
    schema: planSchema,
    prompt: `Turn this syllabus into a weekly study plan JSON.
Infer week count from the syllabus (cap ${MAX_WEEKS}).
Each week: focus, topics, concrete tasks, estimatedHours.
tips: short study advice. Stay faithful to listed topics and due dates.

SYLLABUS (max ${MAX_SYLLABUS_CHARS} chars):
${syllabus}`,
  });

  return Response.json({
    ...clampPlan(result.object),
    provider: providerLabel(),
  });
}
