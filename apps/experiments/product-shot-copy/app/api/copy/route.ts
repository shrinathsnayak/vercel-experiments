import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { clampCopy, isImageFilename, MAX_IMAGE_BYTES } from '../../../logic';

export const maxDuration = 60;
const schema = z.object({
  title: z.string(),
  tagline: z.string(),
  bullets: z.array(z.string()).max(6),
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File) || !file.size) return Response.json({ error: 'file is required.' }, { status: 400 });
  if (!isImageFilename(file.name)) return Response.json({ error: 'Upload an image.' }, { status: 400 });
  if (file.size > MAX_IMAGE_BYTES) return Response.json({ error: 'Image too large (max 4MB).' }, { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = await generateObject({
    model: resolveModel(), schema,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Write concise ecommerce copy for this product photo: title, tagline, up to 6 bullets.' },
        { type: 'image', image: bytes, mediaType: file.type || 'image/png' },
      ],
    }],
  });
  return Response.json({ copy: clampCopy(result.object), provider: providerLabel() });
}
