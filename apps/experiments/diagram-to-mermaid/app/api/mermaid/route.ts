import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import {
  clampMermaid, isImageFilename, MAX_IMAGE_BYTES, truncateDesc,
} from '../../../logic';

export const maxDuration = 60;
const schema = z.object({
  mermaid: z.string(),
  notes: z.array(z.string()).max(8),
  caveat: z.string(),
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  const form = await request.formData();
  const description = truncateDesc(String(form.get('description') || ''));
  const file = form.get('file');
  if (!description && !(file instanceof File)) {
    return Response.json({ error: 'description or file is required.' }, { status: 400 });
  }
  const content: Array<{ type: 'text'; text: string } | { type: 'image'; image: Uint8Array; mediaType: string }> = [
    { type: 'text', text: `Produce Mermaid for this system. Prefer flowchart TD. Include a short caveat that output is a draft.\nDESCRIPTION:\n${description || '(image only)'}` },
  ];
  if (file instanceof File && file.size) {
    if (!isImageFilename(file.name)) return Response.json({ error: 'file must be an image.' }, { status: 400 });
    if (file.size > MAX_IMAGE_BYTES) return Response.json({ error: 'Image too large (max 4MB).' }, { status: 400 });
    content.push({ type: 'image', image: new Uint8Array(await file.arrayBuffer()), mediaType: file.type || 'image/png' });
  }
  const result = await generateObject({
    model: resolveModel(), schema,
    messages: [{ role: 'user', content }],
  });
  return Response.json({ result: clampMermaid(result.object), provider: providerLabel() });
}
