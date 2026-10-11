import { describe, expect, it } from 'vitest';
import { clampSql, isSafeSelect, truncateText } from './logic';

describe('sql-from-question-lab logic', () => {
  it('truncates inputs', () => {
    expect(truncateText('  hi  ', 100)).toBe('hi');
    expect(truncateText('abcdef', 3)).toBe('abc');
  });

  it('allows only single SELECT/WITH/EXPLAIN', () => {
    expect(isSafeSelect('SELECT * FROM products')).toBe(true);
    expect(isSafeSelect('WITH x AS (SELECT 1) SELECT * FROM x')).toBe(true);
    expect(isSafeSelect('DELETE FROM products')).toBe(false);
    expect(isSafeSelect('SELECT 1; DROP TABLE products')).toBe(false);
  });

  it('clamps sql draft', () => {
    const clamped = clampSql({
      sql: ' SELECT 1 ',
      explanation: ' demo ',
      params: [' a ', ''],
      unsafe: false,
    });
    expect(clamped.sql).toBe('SELECT 1');
    expect(clamped.params).toEqual(['a']);
  });
});
