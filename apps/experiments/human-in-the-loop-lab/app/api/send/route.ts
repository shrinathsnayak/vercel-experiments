import { isHttpUrl, MAX_EMAIL_CHARS, truncateText, type ProposedEmail } from '../../../logic';

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const body = json as { email?: ProposedEmail; webhookUrl?: string };
  const email = body.email;
  const webhookUrl = typeof body.webhookUrl === 'string' ? body.webhookUrl.trim() : '';

  if (!email?.to || !email.subject || !email.body) {
    return Response.json({ error: 'email.to, subject, and body are required.' }, { status: 400 });
  }
  if (!isHttpUrl(webhookUrl)) {
    return Response.json({ error: 'webhookUrl must be http(s).' }, { status: 400 });
  }

  const payload = {
    type: 'email.approved',
    email: {
      to: truncateText(email.to, 200),
      subject: truncateText(email.subject, 300),
      body: truncateText(email.body, MAX_EMAIL_CHARS),
    },
    approvedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5_000),
    });
    return Response.json({
      webhookStatus: res.ok ? 'ok' : `failed:${res.status}`,
      payload,
    });
  } catch {
    return Response.json({ webhookStatus: 'failed', payload });
  }
}
