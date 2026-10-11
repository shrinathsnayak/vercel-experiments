import { NextRequest, NextResponse } from 'next/server';
import { captureRequest, getSession } from '../../../../lib/webhooks-store';

type Params = { params: Promise<{ sessionId: string }> };

export async function GET(_request: NextRequest, context: Params) {
  const { sessionId } = await context.params;
  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 });
  }
  return NextResponse.json({
    sessionId: session.id,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    requests: session.requests,
  });
}

async function handleCapture(request: NextRequest, sessionId: string) {
  let bodyText: string | null = null;
  try {
    bodyText = await request.text();
    if (bodyText.length === 0) bodyText = null;
  } catch {
    bodyText = null;
  }

  const result = await captureRequest(sessionId, {
    method: request.method,
    headers: request.headers,
    searchParams: request.nextUrl.searchParams,
    bodyText,
  });

  if (!result.ok) {
    const status =
      result.code === 'not_found'
        ? 404
        : result.code === 'rate_limited'
          ? 429
          : result.code === 'body_too_large'
            ? 413
            : 409;
    return NextResponse.json({ error: result.code }, { status });
  }

  return NextResponse.json(
    { ok: true, id: result.request.id, receivedAt: result.request.receivedAt },
    { status: 202 },
  );
}

export async function POST(request: NextRequest, context: Params) {
  const { sessionId } = await context.params;
  return handleCapture(request, sessionId);
}

export async function PUT(request: NextRequest, context: Params) {
  const { sessionId } = await context.params;
  return handleCapture(request, sessionId);
}

export async function PATCH(request: NextRequest, context: Params) {
  const { sessionId } = await context.params;
  return handleCapture(request, sessionId);
}

export async function DELETE(request: NextRequest, context: Params) {
  const { sessionId } = await context.params;
  return handleCapture(request, sessionId);
}
