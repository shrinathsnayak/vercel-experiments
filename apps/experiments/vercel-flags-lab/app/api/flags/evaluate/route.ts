import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  DEFAULT_FLAG_KEY,
  FLAGS_SETUP_REQUIREMENTS,
  type FlagEntity,
} from '../../../../logic';

const bodySchema = z.object({
  key: z.string().min(1).max(64).default(DEFAULT_FLAG_KEY),
  userId: z.string().min(1).max(64).default('user-7f3a'),
  plan: z.enum(['standard', 'enterprise', 'beta']).default('standard'),
});

/** Live Flags evaluation only - local sticky simulation runs in the demo UI via logic.ts. */
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

  const { key, userId, plan } = parsed.data;
  const entities: FlagEntity = {
    user: { id: userId, plan, email: `${userId}@example.com` },
  };

  try {
    const { flagsClient } = await import('@vercel/flags-core');
    const result = await flagsClient.evaluate<boolean>(key, false, entities);
    return NextResponse.json({
      ok: true,
      source: 'vercel-flags',
      key,
      value: result.value,
      reason: String(result.reason ?? 'Evaluated via @vercel/flags-core'),
      entities,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Flags evaluation failed';
    return NextResponse.json(
      {
        ok: false,
        source: 'unavailable',
        key,
        error: message,
        setup:
          'Create the flag in the Vercel Dashboard and pull OIDC with vercel env pull. Falling back guidance below.',
        requirements: FLAGS_SETUP_REQUIREMENTS,
      },
      { status: 503 },
    );
  }
}
