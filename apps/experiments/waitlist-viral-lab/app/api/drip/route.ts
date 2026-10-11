import { buildDripPreview, type WaitlistEntry } from '../../../logic';

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    const ua = request.headers.get('user-agent') ?? '';
    return ua.includes('vercel-cron') || process.env.NODE_ENV !== 'production';
  }
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

/**
 * Cron-style drip preview — does not send email; returns the next messages
 * that would go out for a sample or provided waitlist entry.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const force = url.searchParams.get('run') === '1';
  const ua = request.headers.get('user-agent') ?? '';
  const isVercelCron = ua.includes('vercel-cron');

  if ((force || isVercelCron) && !authorize(request)) {
    return Response.json(
      { error: 'Unauthorized - set Authorization: Bearer CRON_SECRET' },
      { status: 401 },
    );
  }

  const email = url.searchParams.get('email')?.trim() || 'demo@example.com';
  const position = Number(url.searchParams.get('position') || '42');
  const referralCode = url.searchParams.get('code')?.trim() || 'DEMOCODE';

  const entry: Pick<WaitlistEntry, 'email' | 'position' | 'referralCode'> = {
    email,
    position: Number.isFinite(position) ? position : 42,
    referralCode,
  };

  return Response.json({
    drips: buildDripPreview(entry),
    mode: 'preview',
    note: 'Preview only — this lab never sends real email.',
  });
}
