import { NextResponse } from 'next/server';
import { buildWebhookEndpoint } from '../../../../logic';
import {
  createSession,
  WEBHOOK_SESSION_TTL_MS,
  webhookStoreBackend,
} from '../../../../lib/webhooks-store';

export async function POST(request: Request) {
  const session = await createSession();
  const origin = new URL(request.url).origin;
  return NextResponse.json({
    sessionId: session.id,
    endpoint: buildWebhookEndpoint(origin, session.id),
    expiresAt: session.expiresAt,
    ttlMs: WEBHOOK_SESSION_TTL_MS,
    backend: webhookStoreBackend(),
  });
}
