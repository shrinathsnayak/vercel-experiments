import { describe, expect, it } from 'vitest';
import {
  clampClauses,
  isTextLikeFilename,
  MAX_ROWS,
  truncateText,
  type ClauseRow,
} from './logic';

describe('contract-clause-finder logic', () => {
  it('truncates contract text', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    expect(truncateText('x'.repeat(50), 8).length).toBe(8);
  });

  it('accepts text-like filenames', () => {
    expect(isTextLikeFilename('a.pdf')).toBe(true);
    expect(isTextLikeFilename('a.txt')).toBe(true);
    expect(isTextLikeFilename('a.png')).toBe(false);
  });

  it('clamps clause rows', () => {
    const rows: ClauseRow[] = Array.from({ length: MAX_ROWS + 3 }, (_, i) => ({
      kind: 'risk',
      title: ` t${i} `,
      summary: ` s${i} `,
      excerpt: ` e${i} `,
    }));
    const clamped = clampClauses(rows);
    expect(clamped).toHaveLength(MAX_ROWS);
    expect(clamped[0].title).toBe('t0');
  });
});
