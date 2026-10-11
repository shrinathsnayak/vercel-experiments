import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  QUEUE_TOPIC,
  QUEUES_SETUP_REQUIREMENTS,
  TopicSimulator,
} from '../../../../logic';
import { listProcessed, recordProcessed } from '../../../../lib/memory-log';

const bodySchema = z.object({
  orderId: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .default('order_123'),
  idempotencyKey: z.string().min(1).max(128).optional(),
  mode: z.enum(['live', 'simulator']).default('live'),
});

const simulator = new TopicSimulator(['fulfillment', 'analytics']);

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

  const { orderId, idempotencyKey, mode } = parsed.data;
  const payload = { orderId, status: 'ready' as const };

  if (mode === 'simulator') {
    const published = simulator.publish({
      topic: QUEUE_TOPIC,
      payload,
      idempotencyKey,
    });
    for (const messageId of published.messageIds) {
      recordProcessed({
        messageId,
        orderId,
        receivedAt: new Date().toISOString(),
        source: 'simulator',
      });
    }
    return NextResponse.json({
      ok: true,
      mode: 'simulator',
      topic: QUEUE_TOPIC,
      ...published,
      recent: listProcessed(),
      note: 'Educational in-memory fan-out. Switch to live mode on a Vercel-linked project.',
    });
  }

  try {
    const { send } = await import('@vercel/queue');
    const result = await send(
      QUEUE_TOPIC,
      payload,
      idempotencyKey ? { idempotencyKey } : undefined,
    );

    return NextResponse.json({
      ok: true,
      mode: 'vercel-queues',
      topic: QUEUE_TOPIC,
      messageId: result.messageId,
      note: 'Published to Vercel Queues. The private fulfill consumer runs via queue/v2beta trigger.',
      recent: listProcessed(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Queue publish failed';
    return NextResponse.json(
      {
        ok: false,
        mode: 'unavailable',
        topic: QUEUE_TOPIC,
        error: message,
        setup:
          'Live Queues need OIDC (vercel link && vercel env pull, or a Vercel deployment). Use simulator mode to explore fan-out and retries locally.',
        requirements: QUEUES_SETUP_REQUIREMENTS,
        recent: listProcessed(),
      },
      { status: 503 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    topic: QUEUE_TOPIC,
    recent: listProcessed(),
    simulator: simulator.list(),
  });
}
