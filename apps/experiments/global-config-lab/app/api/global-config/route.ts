import { get, getAll } from '@vercel/global-config';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceStatus } from '../../../lib/services';

export async function GET(request: Request) {
  const status = getServiceStatus('global-config');
  if (!status.available) {
    return NextResponse.json(
      {
        error: 'Global Config is not configured',
        setup:
          'Create a Global Config store in the Vercel dashboard (Storage → Global Config) and pull GLOBAL_CONFIG with `vercel env pull`.',
        demoDefaults: {
          maintenanceMode: false,
          greeting: 'hello from local fallback',
          featureCheckoutV2: true,
        },
      },
      { status: 503 },
    );
  }

  const key = new URL(request.url).searchParams.get('key');
  if (key) {
    const value = await get(key);
    return NextResponse.json({ key, value, source: 'global-config' });
  }

  const all = await getAll();
  return NextResponse.json({ items: all, source: 'global-config' });
}

const readSchema = z.object({
  keys: z.array(z.string().min(1).max(64)).max(20).optional(),
});

export async function POST(request: Request) {
  const status = getServiceStatus('global-config');
  if (!status.available) {
    return NextResponse.json({ error: 'Global Config is not configured' }, { status: 503 });
  }

  let json: unknown = {};
  try {
    json = await request.json();
  } catch {
    json = {};
  }

  const parsed = readSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  if (parsed.data.keys?.length) {
    const entries: Record<string, unknown> = {};
    for (const key of parsed.data.keys) {
      entries[key] = await get(key);
    }
    return NextResponse.json({ entries, source: 'global-config' });
  }

  const all = await getAll();
  return NextResponse.json({ items: all, source: 'global-config' });
}
