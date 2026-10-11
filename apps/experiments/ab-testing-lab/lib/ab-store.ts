import { getRedis } from './redis';
import { emptyFunnel, type AbVariant, type FunnelStats } from '../logic';

let memory = emptyFunnel();

async function redisIncr(field: string) {
  const redis = getRedis();
  if (!redis) return null;
  return redis.hincrby('experiments:ab:funnel', field, 1);
}

export async function track(variant: AbVariant, type: 'impression' | 'conversion') {
  const field = `${type}:${variant}`;
  const redis = getRedis();
  if (redis) {
    await redisIncr(field);
    return { backend: 'redis' as const, stats: await snapshot() };
  }
  if (type === 'impression') memory.impressions[variant] += 1;
  else memory.conversions[variant] += 1;
  return { backend: 'memory' as const, stats: memory };
}

export async function snapshot(): Promise<FunnelStats & { backend: 'redis' | 'memory' }> {
  const redis = getRedis();
  if (!redis) return { ...memory, backend: 'memory' };
  const all = (await redis.hgetall<Record<string, string>>('experiments:ab:funnel')) ?? {};
  const stats = emptyFunnel();
  for (const v of ['A', 'B'] as const) {
    stats.impressions[v] = Number(all[`impression:${v}`] ?? 0);
    stats.conversions[v] = Number(all[`conversion:${v}`] ?? 0);
  }
  return { ...stats, backend: 'redis' };
}

export async function reset() {
  const redis = getRedis();
  if (redis) await redis.del('experiments:ab:funnel');
  memory = emptyFunnel();
}
