import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { clampCards, MAX_CARDS, MAX_NOTES_CHARS, truncateText } from '../../../logic';

export const maxDuration = 60;

const cardsSchema = z.object({
  cards: z
    .array(
      z.object({
        front: z.string(),
        back: z.string(),
      }),
    )
    .max(MAX_CARDS),
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

  const notes =
    typeof (json as { notes?: unknown })?.notes === 'string'
      ? truncateText((json as { notes: string }).notes)
      : '';

  if (!notes) {
    return Response.json({ error: 'notes is required.' }, { status: 400 });
  }

  const result = await generateObject({
    model: resolveModel(),
    schema: cardsSchema,
    prompt: `Create up to ${MAX_CARDS} flashcards from these notes.
Front is a short question or prompt; back is the answer.
Stay faithful to the notes.

NOTES (max ${MAX_NOTES_CHARS} chars):
${notes}`,
  });

  return Response.json({
    cards: clampCards(result.object.cards),
    provider: providerLabel(),
  });
}
