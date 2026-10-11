import { getRedis } from '../../../lib/redis';
import { prependMemory, memoryHistory } from '../../../lib/store';
import {
  CHECK_TIMEOUT_MS,
  clampHistory,
  DEFAULT_CHECK_URL,
  HISTORY_KEY,
  isHttpUrl,
  MAX_HISTORY,
  type CheckResult,
} from '../../../logic';

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    const ua = request.headers.get('user-agent') ?? '';
    return ua.includes('vercel-cron') || process.env.NODE_ENV !== 'production';
  }
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

async function runCheck(url: string): Promise<CheckResult> {
  const started = Date.now();
  const id = `chk-${started}`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
      headers: { 'user-agent': 'status-page-lab/1.0' },
    });
    return {
      id,
      url,
      ok: res.ok,
      status: res.status,
      latencyMs: Date.now() - started,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      id,
      url,
      ok: false,
      status: null,
      latencyMs: Date.now() - started,
      checkedAt: new Date().toISOString(),
      error: err instanceof Error ? err.message : 'fetch failed',
    };
  }
}

async function persist(check: CheckResult) {
  const redis = getRedis();
  if (redis) {
    const prev = (await redis.get<CheckResult[]>(HISTORY_KEY)) ?? [];
    const next = clampHistory([check, ...prev]);
    await redis.set(HISTORY_KEY, next);
    return next;
  }
  prependMemory(check, MAX_HISTORY);
  return clampHistory(memoryHistory);
}

export async function GET(request: Request) {
  const urlParam = new URL(request.url).searchParams.get('url');
  const manual = new URL(request.url).searchParams.get('manual') === '1';
  if (!manual && !authorize(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = (urlParam?.trim() || process.env.STATUS_CHECK_URL?.trim() || DEFAULT_CHECK_URL);
  if (!isHttpUrl(url)) {
    return Response.json({ error: 'Invalid http(s) URL' }, { status: 400 });
  }

  const check = await runCheck(url);
  const history = await persist(check);

  return Response.json({
    check,
    history,
    storage: getRedis() ? 'redis' : 'memory',
    note: getRedis()
      ? undefined
      : 'Redis not configured - history is process-local (resets on cold start).',
  });
}

export async function POST(request: Request) {
  let url = process.env.STATUS_CHECK_URL?.trim() || DEFAULT_CHECK_URL;
  try {
    const json = await request.json();
    if (typeof (json as { url?: unknown })?.url === 'string') {
      url = (json as { url: string }).url.trim();
    }
  } catch {
    /* empty body ok for cron */
  }

  const synthetic = new Request(
    `${new URL(request.url).origin}/api/check?manual=1&url=${encodeURIComponent(url)}`,
    { headers: request.headers },
  );
  return GET(synthetic);
}
