import { describe, expect, it } from 'vitest';
import { clampConfidence, heuristicFill, SAMPLE_PROSE } from './logic';

describe('structured-form-filler logic', () => {
  it('extracts email heuristically', () => {
    const fields = heuristicFill(SAMPLE_PROSE);
    expect(fields.find((f) => f.key === 'email')?.value).toContain('@');
    expect(clampConfidence(1.2)).toBe(1);
  });
});
