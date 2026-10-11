import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { clampTicket, isImageFilename, MAX_IMAGE_BYTES } from '../../../logic';

export const maxDuration = 60;
const schema = z.object({
  title: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  summary: z.string(),
  steps: z.array(z.string()).max(10),
  expected: z.string(),
  actual: z.string(),
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) return Response.json(AI_SETUP_BODY, { status: 503 });
  const ct = request.headers.get('content-type') ?? '';
  if (!ct.includes('multipart/form-data')) {
    return Response.json({ error: 'Expected multipart form upload.' }, { status: 400 });
  }
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: 'file is required.' }, { status: 400 });
  }
  if (!isImageFilename(file.name)) {
    return Response.json({ error: 'Upload a PNG, JPEG, WebP, or GIF image.' }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return Response.json({ error: 'Image too large (max 4MB).' }, { status: 400 });
  }
  const mediaType = file.type || 'image/png';
  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = await generateObject({
    model: resolveModel(),
    schema,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Turn this UI screenshot into a bug ticket. Be concrete; if unclear, say so in summary.' },
        { type: 'image', image: bytes, mediaType },
      ],
    }],
  });
  return Response.json({ ticket: clampTicket(result.object), provider: providerLabel() });
}
