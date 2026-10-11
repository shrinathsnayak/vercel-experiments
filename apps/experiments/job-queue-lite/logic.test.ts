import { describe, expect, it } from 'vitest';
import { advanceJob, clampJobs, pickNextQueued, truncatePayload, type Job } from './logic';

function job(partial: Partial<Job> & Pick<Job, 'id' | 'status' | 'progress'>): Job {
  return {
    payload: 'work',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

describe('job-queue-lite logic', () => {
  it('truncates payload', () => {
    expect(truncatePayload('  hi  ')).toBe('hi');
    expect(truncatePayload('x'.repeat(50), 8).length).toBe(8);
  });

  it('advances progress and completes', () => {
    const a = advanceJob(job({ id: '1', status: 'queued', progress: 0 }), 50);
    expect(a.status).toBe('running');
    expect(a.progress).toBe(50);
    const b = advanceJob(a, 50);
    expect(b.status).toBe('done');
    expect(b.progress).toBe(100);
  });

  it('simulates failure on fail-me payload', () => {
    const failed = advanceJob(
      job({ id: '2', status: 'running', progress: 40, payload: 'fail-me please' }),
      34,
    );
    expect(failed.status).toBe('failed');
    expect(failed.error).toMatch(/fail-me/);
  });

  it('picks oldest unfinished job', () => {
    const jobs = clampJobs([
      job({ id: 'b', status: 'queued', progress: 0, createdAt: '2026-01-02T00:00:00.000Z' }),
      job({ id: 'a', status: 'queued', progress: 0, createdAt: '2026-01-01T00:00:00.000Z' }),
      job({ id: 'c', status: 'done', progress: 100, createdAt: '2026-01-01T00:00:00.000Z' }),
    ]);
    expect(pickNextQueued(jobs)?.id).toBe('a');
  });
});
