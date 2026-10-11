import { cookies } from 'next/headers';
import { assignBucket, COOKIE_NAME, FALLBACK_HEADLINES, type Headlines } from '../../../logic';
import { getRedis } from '../../../lib/redis';
import { memoryHeadlines } from '../../../lib/store';

const HEADLINES_KEY = 'experiments:ab-landing:headlines';

export async function GET() {
  const jar = await cookies();
  const existing = jar.get(COOKIE_NAME)?.value ?? null;
  const { bucket, sticky } = assignBucket(existing, Math.random());

  const redis = getRedis();
  const headlines =
    (redis ? await redis.get<Headlines>(HEADLINES_KEY) : memoryHeadlines) ??
    FALLBACK_HEADLINES;

  const res = Response.json({
    bucket,
    sticky,
    headline: headlines[bucket],
    headlines,
    storage: redis ? 'redis' : 'memory',
  });

  if (!sticky) {
    res.headers.append(
      'Set-Cookie',
      `${COOKIE_NAME}=${bucket}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`,
    );
  }

  return res;
}
