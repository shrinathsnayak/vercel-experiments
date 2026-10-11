import { getRedis } from '../../../lib/redis';
import { memoryJobs } from '../../../lib/store';
import {
  clampJobs,
  MAX_JOBS,
  truncatePayload,
  type Job,
} from '../../../logic';

const QUEUE_KEY = 'job-queue-lite:jobs';

function storageLabel(): 'redis' | 'memory' {
  return getRedis() ? 'redis' : 'memory';
}

async function loadJobs(): Promise<Job[]> {
  const redis = getRedis();
  if (redis) {
    const stored = (await redis.get<Job[]>(QUEUE_KEY)) ?? [];
    return clampJobs(stored);
  }
  return clampJobs(memoryJobs);
}

async function saveJobs(jobs: Job[]) {
  const next = clampJobs(jobs).slice(0, MAX_JOBS);
  const redis = getRedis();
  if (redis) {
    await redis.set(QUEUE_KEY, next);
    return;
  }
  memoryJobs.length = 0;
  memoryJobs.push(...next);
}

export async function GET() {
  const jobs = await loadJobs();
  return Response.json({
    jobs,
    storage: storageLabel(),
    note:
      storageLabel() === 'memory'
        ? 'Redis not configured - queue is process-local (resets on cold start).'
        : undefined,
  });
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const payload =
    typeof (json as { payload?: unknown })?.payload === 'string'
      ? truncatePayload((json as { payload: string }).payload)
      : '';

  if (!payload) {
    return Response.json({ error: 'payload is required.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const job: Job = {
    id: `job-${Date.now()}`,
    payload,
    status: 'queued',
    progress: 0,
    createdAt: now,
    updatedAt: now,
  };

  const jobs = await loadJobs();
  jobs.unshift(job);
  await saveJobs(jobs);

  return Response.json({
    job,
    jobs: await loadJobs(),
    storage: storageLabel(),
    note:
      storageLabel() === 'memory'
        ? 'Redis not configured - queue is process-local (resets on cold start).'
        : undefined,
  });
}
