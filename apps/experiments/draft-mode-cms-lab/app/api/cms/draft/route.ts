import { NextResponse } from 'next/server';
import { z } from 'zod';
import { readDraft, saveDraft } from '../../../../lib/cms-store';

const schema = z.object({
  markdown: z.string().min(1).max(20_000),
  slug: z.string().max(64).optional(),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  const doc = await saveDraft(parsed.data.markdown, parsed.data.slug);
  return NextResponse.json(doc);
}

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get('slug') || 'untitled';
  const doc = await readDraft(slug);
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(doc);
}
