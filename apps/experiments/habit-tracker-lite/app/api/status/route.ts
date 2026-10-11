import { getRedis, redisAvailable } from '../../../lib/redis';
import { computeStreak } from '../../../logic';

export async function GET() {
  return Response.json({
    redis: redisAvailable(),
    sampleStreak: computeStreak(['2026-10-10', '2026-10-11', '2026-10-12']),
    note: redisAvailable() ? 'Redis configured' : 'Using memory fallback for check-ins',
    redisPing: redisAvailable() ? await getRedis()!.ping() : null,
  });
}
