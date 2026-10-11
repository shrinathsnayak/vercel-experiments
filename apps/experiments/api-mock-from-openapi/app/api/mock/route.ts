import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import { clampBundle, MAX_OPENAPI_CHARS, MAX_ROUTES, truncateText } from '../../../logic';

export const maxDuration = 60;

const mockSchema = z.object({
  summary: z.string(),
  downloadText: z.string(),
  routes: z
    .array(
      z.object({
        method: z.string(),
        path: z.string(),
        handlerFilename: z.string(),
        stubSource: z.string(),
      }),
    )
    .max(MAX_ROUTES),
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

  const openapi =
    typeof (json as { openapi?: unknown })?.openapi === 'string'
      ? truncateText((json as { openapi: string }).openapi)
      : '';

  if (!openapi) {
    return Response.json({ error: 'openapi is required.' }, { status: 400 });
  }

  const result = await generateObject({
    model: resolveModel(),
    schema: mockSchema,
    prompt: `From this OpenAPI snippet, generate Next.js App Router Route Handler mock stubs.
Each route: method, path, handlerFilename (e.g. app/api/products/route.ts), stubSource with export async function METHOD.
Use Response.json with plausible mock bodies. Cap at ${MAX_ROUTES} operations.
downloadText: a single downloadable file concatenating all stubs with path comments.
Stay within the OpenAPI paths - do not invent unrelated endpoints.

OPENAPI (max ${MAX_OPENAPI_CHARS} chars):
${openapi}`,
  });

  return Response.json({
    ...clampBundle(result.object),
    provider: providerLabel(),
  });
}
