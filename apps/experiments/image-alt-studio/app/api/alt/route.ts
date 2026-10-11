import { put } from '@vercel/blob';
import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable, getServiceStatus } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import {
  isImageFilename,
  MAX_IMAGE_BYTES,
  sanitizeSeoFilename,
} from '../../../logic';

export const maxDuration = 60;

const altSchema = z.object({
  alt: z.string(),
  seoFilename: z.string(),
  caption: z.string(),
});

export async function POST(request: Request) {
  if (!aiProviderAvailable()) {
    return Response.json(AI_SETUP_BODY, { status: 503 });
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return Response.json({ error: 'Expected multipart form upload.' }, { status: 400 });
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: 'file is required.' }, { status: 400 });
  }
  if (!isImageFilename(file.name)) {
    return Response.json(
      { error: 'Upload a PNG, JPEG, WebP, or GIF image.' },
      { status: 400 },
    );
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return Response.json({ error: 'Image too large (max 4MB).' }, { status: 400 });
  }

  const mediaType = file.type || 'image/png';
  const bytes = new Uint8Array(await file.arrayBuffer());

  const result = await generateObject({
    model: resolveModel(),
    schema: altSchema,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              'Describe this image for accessibility and SEO. ' +
              'alt: concise accessible alt text. ' +
              'seoFilename: kebab-case filename stem (no extension). ' +
              'caption: one short social/caption sentence.',
          },
          { type: 'image', image: bytes, mediaType },
        ],
      },
    ],
  });

  const seoFilename = sanitizeSeoFilename(result.object.seoFilename);
  let blobUrl: string | undefined;
  let blobNote: string | undefined;

  const blob = getServiceStatus('blob');
  if (blob.available) {
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const pathname = `experiments/image-alt-studio/${Date.now()}-${seoFilename}.${ext}`;
    const uploaded = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: mediaType,
    });
    blobUrl = uploaded.url;
  } else {
    blobNote = 'BLOB_READ_WRITE_TOKEN not set - skipped Blob upload.';
  }

  return Response.json({
    alt: result.object.alt.trim(),
    seoFilename,
    caption: result.object.caption.trim(),
    blobUrl,
    blobStored: Boolean(blobUrl),
    provider: providerLabel(),
    note: blobNote,
  });
}
