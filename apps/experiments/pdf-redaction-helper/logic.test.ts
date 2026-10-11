import { describe, expect, it } from 'vitest';
import { clampSpans, heuristicSpans, truncateText } from './logic';

describe('pdf-redaction-helper logic', () => {
  it('truncates', () => {
    expect(truncateText('  hi  ')).toBe('hi');
  });
  it('finds heuristic emails', () => {
    const spans = heuristicSpans('mail a@b.co please');
    expect(spans[0]?.type).toBe('email');
  });
  it('clamps spans', () => {
    const spans = clampSpans([{ type: 'x', text: 'a', start: -1, end: 99 }], 'hello');
    expect(spans[0]?.start).toBe(0);
    expect(spans[0]?.end).toBe(5);
  });
});
