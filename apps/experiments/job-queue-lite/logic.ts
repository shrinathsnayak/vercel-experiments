export const MAX_PAYLOAD_CHARS = 2_000;
export const MAX_JOBS = 100;

export type JobStatus = 'queued' | 'running' | 'done' | 'failed';

export type Job = {
  id: string;
  payload: string;
  status: JobStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
};

export function truncatePayload(text: string, max = MAX_PAYLOAD_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function clampJobs(jobs: Job[]): Job[] {
  return jobs
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, MAX_JOBS);
}

/** Pure step: advance one job by a fixed progress chunk. */
export function advanceJob(job: Job, chunk = 34): Job {
  if (job.status === 'done' || job.status === 'failed') return job;
  const nextProgress = Math.min(100, job.progress + chunk);
  const failed = job.payload.toLowerCase().includes('fail-me') && nextProgress >= 68;
  if (failed) {
    return {
      ...job,
      status: 'failed',
      progress: nextProgress,
      error: 'Simulated failure (payload contained fail-me).',
      updatedAt: new Date().toISOString(),
    };
  }
  return {
    ...job,
    status: nextProgress >= 100 ? 'done' : 'running',
    progress: nextProgress,
    updatedAt: new Date().toISOString(),
  };
}

export function pickNextQueued(jobs: Job[]): Job | undefined {
  return jobs
    .filter((j) => j.status === 'queued' || (j.status === 'running' && j.progress < 100))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
}

export const SAMPLE_PAYLOAD = 'resize-avatar:user-42';
