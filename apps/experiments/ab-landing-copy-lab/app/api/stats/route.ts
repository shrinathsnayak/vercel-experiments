import { getRedis } from '../../../lib/redis';
import { memoryStats } from '../../../lib/store';
import { conversionRate, emptyStats, type FunnelStats } from '../../../logic';

const STATS_KEY = 'experiments:ab-landing:stats';

export async function GET() {
  const redis = getRedis();
  const stats: FunnelStats =
    (redis ? await redis.get<FunnelStats>(STATS_KEY) : memoryStats) ?? emptyStats();

  return Response.json({
    stats,
    rates: {
      A: conversionRate(stats, 'A'),
      B: conversionRate(stats, 'B'),
    },
    storage: redis ? 'redis' : 'memory',
  });
}
