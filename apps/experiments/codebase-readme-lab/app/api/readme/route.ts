import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { clampReadme, MAX_SOURCE_CHARS, truncateText } from '../../../logic';

export const maxDuration = 60;

const readmeSchema = z.object({
  title: z.string(),
  overview: z.string(),
  features: z.array(z.string()).max(12),
  gettingStarted: z.string(),
  projectStructure: z.string(),
  configuration: z.string(),
  scripts: z.array(z.string()).max(12),
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

  const tree =
    typeof (json as { tree?: unknown })?.tree === 'string'
      ? truncateText((json as { tree: string }).tree, MAX_SOURCE_CHARS / 2)
      : '';
  const snippets =
    typeof (json as { snippets?: unknown })?.snippets === 'string'
      ? truncateText((json as { snippets: string }).snippets, MAX_SOURCE_CHARS / 2)
      : '';

  if (!tree && !snippets) {
    return Response.json({ error: 'tree or snippets is required.' }, { status: 400 });
  }

  const result = await generateObject({
    model: resolveModel(),
    schema: readmeSchema,
    prompt: `Draft README sections from a file tree and code snippets.
Do not invent APIs, env vars, or scripts that are not evidenced.
gettingStarted and projectStructure may use short markdown.
scripts: package script names when visible.

TREE:
${tree || '(none)'}

SNIPPETS:
${snippets || '(none)'}`,
  });

  return Response.json({
    ...clampReadme(result.object),
    provider: providerLabel(),
  });
}
