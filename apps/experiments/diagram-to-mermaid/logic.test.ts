import { describe, expect, it } from 'vitest';
import { clampMermaid, MERMAID_CAVEAT, truncateDesc } from './logic';

describe('diagram-to-mermaid logic', () => {
  it('truncates and clamps', () => {
    expect(truncateDesc('  hi  ')).toBe('hi');
    const r = clampMermaid({ mermaid: ' graph TD ', caveat: 'x', notes: ['a', ''] });
    expect(r.mermaid).toBe('graph TD');
    expect(r.caveat).toBe(MERMAID_CAVEAT);
  });
});
