import { NextResponse } from 'next/server';
import { z } from 'zod';
import { assignVariant, clampPercent } from '../../../logic';
import { bump, snapshot } from '../../../lib/counters';

const postSchema = z.object({
  action: z.enum(['assign', 'hit', 'snapshot']),
  maintenanceMode: z.boolean().optional(),
  canaryPercent: z.number().optional(),
  existingCookie: z.string().nullable().optional(),
  variant: z.enum(['control', 'canary', 'maintenance']).optional(),
});

export async function GET() {
  const envMaintenance = process.env.MAINTENANCE_MODE === 'true';
  const envPercent = clampPercent(Number(process.env.CANARY_PERCENT ?? '10'));
  const counts = await snapshot();
  return NextResponse.json({
    env: { MAINTENANCE_MODE: envMaintenance, CANARY_PERCENT: envPercent },
    counts,
    note: 'Set MAINTENANCE_MODE / CANARY_PERCENT env, or simulate below. Redis optional for durable counters.',
  });
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const body = parsed.data;
  if (body.action === 'snapshot') {
    return NextResponse.json(await snapshot());
  }
  if (body.action === 'hit') {
    const variant = body.variant ?? 'control';
    const result = await bump(variant);
    return NextResponse.json(result);
  }
  const assignment = assignVariant({
    config: {
      maintenanceMode: body.maintenanceMode ?? false,
      canaryPercent: clampPercent(body.canaryPercent ?? 10),
    },
    existingCookie: body.existingCookie,
    random: Math.random(),
  });
  if (assignment.reason === 'maintenance') {
    await bump('maintenance');
  } else {
    await bump(assignment.variant);
  }
  return NextResponse.json({ assignment, counts: await snapshot() });
}
