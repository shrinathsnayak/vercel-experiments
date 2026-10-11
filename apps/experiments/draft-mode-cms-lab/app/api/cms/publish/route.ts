import { NextResponse } from 'next/server';
import { z } from 'zod';
import { publish } from '../../../../lib/cms-store';

const schema = z.object({ slug: z.string().min(1).max(64) });

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  try {
    const doc = await publish(parsed.data.slug);
    return NextResponse.json(doc);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Publish failed' }, { status: 404 });
  }
}
