import { NextResponse } from 'next/server';
import { getRedis } from '../../../../lib/redis';
import { put } from '@vercel/blob';
import { getServiceStatus } from '../../../../lib/services';

const HEARTBEAT_KEY = 'experiments:cron:heartbeat';

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    // On Vercel, Cron invocations include Authorization when CRON_SECRET is set.
    // Without a secret, allow only Vercel Cron user-agent in production-like hosts.
    const ua = request.headers.get('user-agent') ?? '';
    return ua.includes('vercel-cron') || process.env.NODE_ENV !== 'production';
  }
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ranAt = new Date().toISOString();
  const payload = {
    ranAt,
    path: '/api/cron/heartbeat',
    schedule: '0 * * * *',
  };

  let storage: 'redis' | 'blob' | 'ephemeral' = 'ephemeral';

  const redis = getRedis();
  if (redis) {
    await redis.set(HEARTBEAT_KEY, payload, { ex: 60 * 60 * 48 });
    storage = 'redis';
  } else if (getServiceStatus('blob').available) {
    await put('experiments/cron/heartbeat.json', JSON.stringify(payload, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });
    storage = 'blob';
  }

  return NextResponse.json({ ok: true, ...payload, storage });
}

export async function POST(request: Request) {
  return GET(request);
}
