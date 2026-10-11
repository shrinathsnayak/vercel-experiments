import { NextResponse } from 'next/server';
import { z } from 'zod';
import { WORKFLOW_SETUP_REQUIREMENTS } from '../../../../logic';

const bodySchema = z.object({
  orderId: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .default('order_demo'),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    json = {};
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { orderId } = parsed.data;

  try {
    const { start } = await import('workflow/api');
    const { processDemoOrder } = await import('../../../../workflows/demo-order');
    const run = await start(processDemoOrder, [orderId]);

    return NextResponse.json({
      ok: true,
      mode: 'vercel-workflows',
      runId: run.runId,
      orderId,
      note: 'Workflow started. Inspect with `npx workflow web` or Observability → Workflows.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Workflow start failed';
    return NextResponse.json(
      {
        ok: false,
        mode: 'unavailable',
        orderId,
        error: message,
        setup:
          'Live Workflows need the Workflow SDK (`withWorkflow` in next.config) and a Vercel-linked project. Use the educational timeline below while setting up.',
        requirements: WORKFLOW_SETUP_REQUIREMENTS,
      },
      { status: 503 },
    );
  }
}
