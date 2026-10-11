import { describe, expect, it } from 'vitest';
import { evaluateLocalFlag, hashBucket } from './logic';

describe('hashBucket', () => {
  it('is sticky for the same seed', () => {
    expect(hashBucket('marketing-banner:user-1')).toBe(
      hashBucket('marketing-banner:user-1'),
    );
  });
});

describe('evaluateLocalFlag', () => {
  it('honors plan targeting', () => {
    const result = evaluateLocalFlag(
      {
        key: 'marketing-banner',
        type: 'boolean',
        defaultValue: false,
        enabled: true,
        rolloutPercent: 0,
        plans: ['enterprise'],
      },
      { user: { id: 'u1', plan: 'enterprise' } },
    );
    expect(result.value).toBe(true);
    expect(result.reason).toContain('enterprise');
  });

  it('uses sticky rollout for boolean flags', () => {
    const def = {
      key: 'marketing-banner',
      type: 'boolean' as const,
      defaultValue: false,
      enabled: true,
      rolloutPercent: 100,
      plans: [] as string[],
    };
    expect(evaluateLocalFlag(def, { user: { id: 'anyone' } }).value).toBe(true);
  });

  it('returns off when disabled', () => {
    const result = evaluateLocalFlag(
      {
        key: 'marketing-banner',
        type: 'boolean',
        defaultValue: false,
        enabled: false,
        rolloutPercent: 100,
        plans: ['enterprise'],
      },
      { user: { id: 'u1', plan: 'enterprise' } },
    );
    expect(result.value).toBe(false);
  });
});
