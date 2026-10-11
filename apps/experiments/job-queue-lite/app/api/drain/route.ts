import { getRedis } from '../../../lib/redis';
import { memoryJobs } from '../../../lib/store';
import { advanceJob, clampJobs, pickNextQueued, type Job } from '../../../logic';

const QUEUE_KEY = 'job-queue-lite:jobs';

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    const ua = request.headers.get('user-agent') ?? '';
    return ua.includes('vercel-cron') || process.env.NODE_ENV !== 'production';
  }
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

async function loadJobs(): Promise<{ jobs: Job[]; storage: 'redis' | 'memory' }> {
  const redis = getRedis();
  if (redis) {
    return { jobs: clampJobs((await redis.get<Job[]>(QUEUE_KEY)) ?? []), storage: 'redis' };
  }
  return { jobs: clampJobs(memoryJobs), storage: 'memory' };
}

async function saveJobs(jobs: Job[]) {
  const next = clampJobs(jobs);
  const redis = getRedis();
  if (redis) {
    await redis.set(QUEUE_KEY, next);
    return;
  }
  memoryJobs.length = 0;
  memoryJobs.push(...next);
}

async function drainOnce() {
  const { jobs, storage } = await loadJobs();
  const next = pickNextQueued(jobs);
  if (!next) {
    return Response.json({
      drained: false,
      jobs,
      storage,
      note: 'No queued/running jobs.',
    });
  }
  const advanced = advanceJob(next);
  const updated = jobs.map((j) => (j.id === advanced.id ? advanced : j));
  await saveJobs(updated);
  return Response.json({
    drained: true,
    job: advanced,
    jobs: await loadJobs().then((r) => r.jobs),
    storage,
  });
}

export async function GET(request: Request) {
  const force = new URL(request.url).searchParams.get('run') === '1';
  const ua = request.headers.get('user-agent') ?? '';
  const isVercelCron = ua.includes('vercel-cron');

  if (force || isVercelCron) {
    if (!authorize(request)) {
      return Response.json(
        { error: 'Unauthorized - set Authorization: Bearer CRON_SECRET' },
        { status: 401 },
      );
    }
    return drainOnce();
  }

  const { jobs, storage } = await loadJobs();
  return Response.json({ jobs, storage, hint: 'Add ?run=1 to drain one step.' });
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return Response.json(
      { error: 'Unauthorized - set Authorization: Bearer CRON_SECRET' },
      { status: 401 },
    );
  }
  return drainOnce();
}
