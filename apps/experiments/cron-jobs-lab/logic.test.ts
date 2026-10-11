import { describe, expect, it } from 'vitest';
import { describeCronSchedule } from './logic';

describe('cron-jobs-lab logic', () => {
  it('describes hourly schedule', () => {
    expect(describeCronSchedule('0 * * * *')).toMatch(/hour/i);
  });
});
