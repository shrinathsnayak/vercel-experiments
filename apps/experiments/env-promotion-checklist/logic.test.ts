import { describe, expect, it } from 'vitest';
import {
  compareEnvChecklists,
  redactValue,
  SAMPLE_PREVIEW,
  SAMPLE_PRODUCTION,
  SAMPLE_REQUIRED,
} from './logic';

describe('env-promotion-checklist logic', () => {
  it('redacts and flags missing production keys', () => {
    expect(redactValue('abcdef')).toMatch(/…/);
    const rows = compareEnvChecklists(
      SAMPLE_PREVIEW,
      SAMPLE_PRODUCTION,
      SAMPLE_REQUIRED.split('\n'),
    );
    expect(rows.find((r) => r.key === 'CRON_SECRET')?.status).toBe('missing-preview');
    expect(rows.find((r) => r.key === 'AI_GATEWAY_API_KEY')?.status).toBe('value-differs');
  });
});
