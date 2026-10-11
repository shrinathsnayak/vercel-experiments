import { NextResponse } from 'next/server';
import { getRedis } from '../../../../lib/redis';
import { getServiceStatus } from '../../../../lib/services';

const HEARTBEAT_KEY = 'experiments:cron:heartbeat';

export async function GET() {
  const redis = getRedis();
  if (redis) {
    const last = await redis.get<{ ranAt: string; path: string; schedule: string }>(
      HEARTBEAT_KEY,
    );
    return NextResponse.json({
      configured: true,
      storage: 'redis',
      last,
      schedule: '0 * * * *',
      route: '/api/cron/heartbeat',
    });
  }

  return NextResponse.json({
    configured: Boolean(getServiceStatus('blob').available || process.env.CRON_SECRET),
    storage: getServiceStatus('blob').available ? 'blob' : 'none',
    last: null,
    schedule: '0 * * * *',
    route: '/api/cron/heartbeat',
    note: 'Heartbeat persists to Redis when available. Trigger manually with GET /api/cron/heartbeat in development.',
  });
}
