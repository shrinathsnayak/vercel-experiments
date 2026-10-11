import { describe, expect, it } from 'vitest';
import { heuristicEmail, isHttpUrl, truncateText } from './logic';

describe('human-in-the-loop-lab logic', () => {
  it('truncates and validates urls', () => {
    expect(truncateText('  x  ', 10)).toBe('x');
    expect(isHttpUrl('https://example.com/hook')).toBe(true);
    expect(isHttpUrl('ftp://x')).toBe(false);
  });

  it('builds heuristic email', () => {
    const e = heuristicEmail('Ship tomorrow');
    expect(e.subject).toMatch(/Ship/);
    expect(e.body).toContain('Ship tomorrow');
  });
});
