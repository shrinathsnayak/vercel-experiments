import { generateText } from 'ai';
import { aiProviderAvailable } from '../../../lib/services';
import { resolveModel, providerLabel } from '../../../lib/ai-model';
import {
  heuristicRepair,
  lineDiff,
  pretty,
  truncateText,
  tryParseJson,
} from '../../../logic';

export const maxDuration = 60;

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const raw =
    typeof (json as { json?: unknown })?.json === 'string'
      ? truncateText((json as { json: string }).json)
      : '';
  if (!raw) return Response.json({ error: 'json is required.' }, { status: 400 });

  const heuristic = heuristicRepair(raw);
  let repaired = heuristic.repaired;
  let notes = [...heuristic.notes];
  let mode: 'heuristic' | 'ai' | 'passthrough' = 'heuristic';

  let parsed = tryParseJson(repaired);
  if (!parsed.ok && aiProviderAvailable()) {
    const result = await generateText({
      model: resolveModel(),
      prompt: `Repair this into valid JSON only. No markdown fences.\n\n${raw}`,
    });
    const candidate = result.text.trim().replace(/^\`\`\`(?:json)?\n?/i, '').replace(/\n?\`\`\`$/, '');
    const aiParsed = tryParseJson(candidate);
    if (aiParsed.ok) {
      repaired = pretty(aiParsed.value);
      notes.push('AI repair used after heuristics failed');
      mode = 'ai';
      parsed = aiParsed;
    }
  }

  if (parsed.ok) {
    repaired = pretty(parsed.value);
  } else if (!parsed.ok) {
    return Response.json(
      {
        error: 'Could not repair to valid JSON',
        notes,
        repaired,
        parseError: parsed.error,
        mode,
      },
      { status: 422 },
    );
  }

  return Response.json({
    repaired,
    notes,
    diff: lineDiff(raw, repaired),
    mode,
    provider: aiProviderAvailable() ? providerLabel() : null,
  });
}
