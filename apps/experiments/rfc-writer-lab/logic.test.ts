import { describe, expect, it } from 'vitest';
import { scaffoldSections, truncateText } from './logic';
describe('rfc-writer-lab', () => {
  it('scaffolds sections', () => {
    expect(scaffoldSections(['Motivation', 'Proposal'])).toHaveLength(2);
    expect(truncateText('abcdef', 3)).toBe('abc');
  });
});