import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCapturedRequest, getSession } from '../../../../../lib/webhooks-store';

const replaySchema = z.object({
  requestId: z.string().uuid(),
});

type Params = { params: Promise<{ sessionId: string }> };

export async function POST(request: NextRequest, context: Params) {
  const { sessionId } = await context.params;
  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = replaySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'requestId must be a UUID' }, { status: 400 });
  }

  const captured = await getCapturedRequest(sessionId, parsed.data.requestId);
  if (!captured) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  return NextResponse.json({
    replay: {
      method: captured.method,
      headers: captured.headers,
      query: captured.query,
      body: captured.body,
    },
    hint: 'Re-send this payload to the session endpoint; sensitive headers were redacted at capture time.',
  });
}
