import { describe, expect, it } from 'vitest';
import { heuristicRepair, lineDiff, tryParseJson } from './logic';

describe('json-repair-lab logic', () => {
  it('repairs trailing commas and bare keys', () => {
    const { repaired } = heuristicRepair("{ name: 'x', tags: [1,], }");
    const parsed = tryParseJson(repaired);
    expect(parsed.ok).toBe(true);
  });

  it('diffs lines', () => {
    const d = lineDiff('a\nb', 'a\nc');
    expect(d.some((x) => x.kind === 'del' && x.text === 'b')).toBe(true);
    expect(d.some((x) => x.kind === 'add' && x.text === 'c')).toBe(true);
  });
});
