import { describe, expect, it } from 'vitest';
import { extractCandidateTerms } from './logic';
describe('glossary-builder', () => {
  it('extracts candidates', () => {
    const terms = extractCandidateTerms('Edge Middleware and ISR matter.');
    expect(terms.some((t) => t.includes('Middleware') || t.includes('Edge'))).toBe(true);
  });
});