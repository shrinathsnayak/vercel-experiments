import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import { AI_SETUP_BODY, providerLabel, resolveModel } from '../../../lib/ai-model';
import { clampTasks, isImageFilename, MAX_IMAGE_BYTES } from '../../../logic';

export const maxDuration = 60;
const schema = z.object({
  tasks: z.array(z.object({
    title: z.string(),
    owner: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']),
    dueHint: z.string().optional(),
  })).max(20),
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
        { type: 'text', text: 'Extract actionable tasks from this whiteboard photo. Prefer short titles.' },
        { type: 'image', image: bytes, mediaType: file.type || 'image/png' },
      ],
    }],
  });
  return Response.json({ tasks: clampTasks(result.object.tasks), provider: providerLabel() });
}
