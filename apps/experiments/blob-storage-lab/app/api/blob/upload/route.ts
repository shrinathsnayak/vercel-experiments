import { put, list, del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceStatus } from '../../../../lib/services';

const MAX_BYTES = 256 * 1024;

const metaSchema = z.object({
  filename: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-zA-Z0-9._-]+$/),
});

export async function GET() {
  const status = getServiceStatus('blob');
  if (!status.available) {
    return NextResponse.json(
      {
        error: 'Vercel Blob is not configured',
        setup: 'Add BLOB_READ_WRITE_TOKEN or deploy with the Blob store in one click.',
      },
      { status: 503 },
    );
  }

  const { blobs } = await list({ prefix: 'experiments/blob-lab/', limit: 20 });
  return NextResponse.json({
    blobs: blobs.map((b) => ({
      url: b.url,
      pathname: b.pathname,
      size: b.size,
      uploadedAt: b.uploadedAt,
    })),
  });
}

export async function POST(request: Request) {
  const status = getServiceStatus('blob');
  if (!status.available) {
    return NextResponse.json(
      {
        error: 'Vercel Blob is not configured',
        setup: 'Provision Blob via Storage or the Deploy button stores parameter.',
      },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const file = form.get('file');
  const filenameRaw = form.get('filename');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `Max upload size is ${MAX_BYTES} bytes` }, { status: 413 });
  }

  const parsed = metaSchema.safeParse({
    filename: typeof filenameRaw === 'string' ? filenameRaw : file.name || 'upload.txt',
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
  }

  const pathname = `experiments/blob-lab/${Date.now()}-${parsed.data.filename}`;
  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: false,
  });

  return NextResponse.json({
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType,
    size: file.size,
  });
}

export async function DELETE(request: Request) {
  const status = getServiceStatus('blob');
  if (!status.available) {
    return NextResponse.json({ error: 'Vercel Blob is not configured' }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const url = z.object({ url: z.string().url() }).safeParse(json);
  if (!url.success) {
    return NextResponse.json({ error: 'url required' }, { status: 400 });
  }

  if (!url.data.url.includes('/experiments/blob-lab/')) {
    return NextResponse.json({ error: 'Can only delete blob-lab uploads' }, { status: 403 });
  }

  await del(url.data.url);
  return NextResponse.json({ ok: true });
}
