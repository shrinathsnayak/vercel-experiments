import type { Job } from '../logic';

/** Process-local fallback when Redis is not configured. */
export const memoryJobs: Job[] = [];
