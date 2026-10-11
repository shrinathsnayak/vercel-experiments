import { describe, expect, it } from 'vitest';
import { heuristicTriage, truncateText } from './logic';

describe('support-triage-lab logic', () => {
  it('heuristics category and priority', () => {
    const r = heuristicTriage('Urgent bug: app crash on login');
    expect(r.category).toBe('bug');
    expect(r.priority).toBe('high');
    expect(r.reply).toMatch(/bug/);
  });

  it('truncates ticket', () => {
    expect(truncateText('  hi  ')).toBe('hi');
  });
});
