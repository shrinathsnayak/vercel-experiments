import { getRedis } from '../../../lib/redis';
import { memoryHistory } from '../../../lib/store';
import {
  clampHistory,
  HISTORY_KEY,
  overallFromHistory,
  uptimePercent,
  type CheckResult,
} from '../../../logic';

export async function GET() {
  const redis = getRedis();
  const history = clampHistory(
    (redis ? await redis.get<CheckResult[]>(HISTORY_KEY) : memoryHistory) ?? [],
  );

  return Response.json({
    status: overallFromHistory(history),
    uptimePercent: uptimePercent(history),
    history,
    storage: redis ? 'redis' : 'memory',
    note: redis
      ? undefined
      : 'Redis not configured - history is process-local (resets on cold start).',
  });
}
