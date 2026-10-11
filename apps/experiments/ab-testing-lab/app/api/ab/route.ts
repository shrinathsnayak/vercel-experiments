import { NextResponse } from 'next/server';
import { z } from 'zod';
import { assignAb } from '../../../logic';
import { reset, snapshot, track } from '../../../lib/ab-store';

const schema = z.object({
  action: z.enum(['assign', 'convert', 'stats', 'reset']),
  existing: z.string().nullable().optional(),
  trafficToB: z.number().min(0).max(1).optional(),
  variant: z.enum(['A', 'B']).optional(),
});

export async function GET() {
  return NextResponse.json(await snapshot());
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  if (parsed.data.action === 'stats') return NextResponse.json(await snapshot());
  if (parsed.data.action === 'reset') {
    await reset();
    return NextResponse.json(await snapshot());
  }
  if (parsed.data.action === 'convert') {
    const variant = parsed.data.variant;
    if (!variant) return NextResponse.json({ error: 'variant required' }, { status: 400 });
    return NextResponse.json(await track(variant, 'conversion'));
  }

  const assignment = assignAb({
    existing: parsed.data.existing,
    random: Math.random(),
    trafficToB: parsed.data.trafficToB,
  });
  const tracked = await track(assignment.variant, 'impression');
  const res = NextResponse.json({ assignment, stats: tracked.stats, backend: tracked.backend });
  res.cookies.set('ve-ab', assignment.variant, { path: '/', maxAge: 60 * 60 * 24 * 30 });
  return res;
}
