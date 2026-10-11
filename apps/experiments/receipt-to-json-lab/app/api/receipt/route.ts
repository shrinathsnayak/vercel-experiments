import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import {
  isImageFilename,
  MAX_IMAGE_BYTES,
  MAX_RECEIPT_TEXT,
  truncateText,
} from '../../../logic';

export const maxDuration = 60;

const expenseSchema = z.object({
  merchant: z.string(),
  date: z.string(),
  currency: z.string(),
  total: z.number(),
  lineItems: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      total: z.number(),
    }),
  ),
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) {
    return Response.json(AI_SETUP_BODY, { status: 503 });
  }

  const contentType = request.headers.get('content-type') ?? '';
  let text = '';
  let image: { data: Uint8Array; mediaType: string } | null = null;

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    text = String(form.get('text') ?? '');
    const file = form.get('file');
    if (file instanceof File && file.size > 0) {
      if (!isImageFilename(file.name)) {
        return Response.json(
          { error: 'Upload a PNG, JPEG, WebP, or GIF image, or paste receipt text.' },
          { status: 400 },
        );
      }
      if (file.size > MAX_IMAGE_BYTES) {
        return Response.json({ error: 'Image too large (max 4MB).' }, { status: 400 });
      }
      const mediaType = file.type || 'image/png';
      image = { data: new Uint8Array(await file.arrayBuffer()), mediaType };
    }
  } else {
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    text =
      typeof (json as { text?: unknown })?.text === 'string'
        ? (json as { text: string }).text
        : '';
  }

  text = truncateText(text, MAX_RECEIPT_TEXT);
  if (!text && !image) {
    return Response.json(
      { error: 'Provide receipt text or an image.' },
      { status: 400 },
    );
  }

  const instruction =
    'Extract structured expense data from the receipt. Use ISO date when possible. ' +
    'currency should be a 3-letter code when known (USD, EUR, …). ' +
    'If a field is unknown, use empty string or 0 as appropriate.';

  const result = image
    ? await generateObject({
        model: resolveModel(),
        schema: expenseSchema,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: `${instruction}\n\nOCR / text hint:\n${text || '(none)'}` },
              { type: 'image', image: image.data, mediaType: image.mediaType },
            ],
          },
        ],
      })
    : await generateObject({
        model: resolveModel(),
        schema: expenseSchema,
        prompt: `${instruction}\n\nRECEIPT TEXT:\n${text}`,
      });

  return Response.json({ ...result.object, provider: providerLabel(), usedVision: Boolean(image) });
}
