import { getRedis } from './redis';

const memory = { control: 0, canary: 0, maintenance: 0 };

export async function bump(variant: 'control' | 'canary' | 'maintenance') {
  const redis = getRedis();
  if (redis) {
    const key = `experiments:canary:${variant}`;
    const n = await redis.incr(key);
    return { count: n, backend: 'redis' as const };
  }
  memory[variant] += 1;
  return { count: memory[variant], backend: 'memory' as const };
}

export async function snapshot() {
  const redis = getRedis();
  if (redis) {
    const [control, canary, maintenance] = await Promise.all([
      redis.get<number>('experiments:canary:control'),
      redis.get<number>('experiments:canary:canary'),
      redis.get<number>('experiments:canary:maintenance'),
    ]);
    return {
      control: Number(control ?? 0),
      canary: Number(canary ?? 0),
      maintenance: Number(maintenance ?? 0),
      backend: 'redis' as const,
    };
  }
  return { ...memory, backend: 'memory' as const };
}
