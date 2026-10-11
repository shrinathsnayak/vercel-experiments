import { getRedis } from '../../../lib/redis';
import { memoryStats, setMemoryStats } from '../../../lib/store';
import { emptyStats, record, type Bucket, type FunnelStats } from '../../../logic';

const STATS_KEY = 'experiments:ab-landing:stats';

async function loadStats(): Promise<FunnelStats> {
  const redis = getRedis();
  if (redis) {
    return (await redis.get<FunnelStats>(STATS_KEY)) ?? emptyStats();
  }
  return memoryStats;
}

async function saveStats(stats: FunnelStats) {
  const redis = getRedis();
  if (redis) await redis.set(STATS_KEY, stats);
  else setMemoryStats(stats);
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const bucket = (json as { bucket?: unknown }).bucket;
  const type = (json as { type?: unknown }).type;
  if ((bucket !== 'A' && bucket !== 'B') || (type !== 'impression' && type !== 'conversion')) {
    return Response.json(
      { error: 'bucket (A|B) and type (impression|conversion) required.' },
      { status: 400 },
    );
  }

  const next = record(await loadStats(), bucket as Bucket, type);
  await saveStats(next);

  return Response.json({
    stats: next,
    storage: getRedis() ? 'redis' : 'memory',
  });
}
