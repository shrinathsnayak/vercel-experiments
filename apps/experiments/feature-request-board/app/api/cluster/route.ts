import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { clampClusters, parseIdeaLines } from '../../../logic';

export const maxDuration = 60;
const schema = z.object({
  clusters: z.array(z.object({
    id: z.string(), theme: z.string(), summary: z.string(),
    ideaIndexes: z.array(z.number()).max(40),
  })).max(8),
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const ideas = typeof (json as Record<string, unknown>).ideas === 'string' ? String((json as Record<string, unknown>).ideas) : '';
  const lines = parseIdeaLines(ideas);
  if (!lines.length) return Response.json({ error: 'ideas is required.' }, { status: 400 });
  const numbered = lines.map((l, i) => `${i}. ${l}`).join('\n');
  const result = await generateObject({
    model: resolveModel(), schema,
    prompt: `Cluster these product ideas into up to 8 themes. Use short ids like c1.\nIDEAS:\n${numbered}`,
  });
  return Response.json({ clusters: clampClusters(result.object.clusters), ideaCount: lines.length, provider: providerLabel() });
}
