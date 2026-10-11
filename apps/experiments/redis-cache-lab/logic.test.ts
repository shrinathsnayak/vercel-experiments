import { describe, expect, it } from 'vitest';
import { clampTtl } from './logic';

describe('redis-cache-lab logic', () => {
  it('clamps ttl', () => {
    expect(clampTtl(0)).toBe(1);
    expect(clampTtl(99999)).toBe(3600);
    expect(clampTtl(30)).toBe(30);
  });
});
