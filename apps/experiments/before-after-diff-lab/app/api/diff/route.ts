import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { clampDiff, isImageFilename, MAX_IMAGE_BYTES } from '../../../logic';

export const maxDuration = 60;
const schema = z.object({
  summary: z.string(),
  changes: z.array(z.string()).max(12),
  risks: z.array(z.string()).max(8),
});

async function readImage(file: FormDataEntryValue | null, label: string) {
  if (!(file instanceof File) || !file.size) throw new Error(`${label} image is required.`);
  if (!isImageFilename(file.name)) throw new Error(`${label} must be an image.`);
  if (file.size > MAX_IMAGE_BYTES) throw new Error(`${label} too large (max 4MB).`);
  return { bytes: new Uint8Array(await file.arrayBuffer()), mediaType: file.type || 'image/png' };
}

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  const form = await request.formData();
  try {
    const before = await readImage(form.get('before'), 'before');
    const after = await readImage(form.get('after'), 'after');
    const result = await generateObject({
      model: resolveModel(), schema,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Compare BEFORE then AFTER screenshots. List concrete UI/content changes and any UX risks.' },
          { type: 'text', text: 'BEFORE:' },
          { type: 'image', image: before.bytes, mediaType: before.mediaType },
          { type: 'text', text: 'AFTER:' },
          { type: 'image', image: after.bytes, mediaType: after.mediaType },
        ],
      }],
    });
    return Response.json({ result: clampDiff(result.object), provider: providerLabel() });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Invalid upload' }, { status: 400 });
  }
}
