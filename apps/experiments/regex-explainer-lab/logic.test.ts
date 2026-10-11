import { describe, expect, it } from 'vitest';
import {
  highlightMatches,
  normalizeFlags,
  renderHighlightedHtml,
  truncateText,
} from './logic';

describe('regex-explainer-lab logic', () => {
  it('truncates inputs', () => {
    expect(truncateText('  hi  ', 10)).toBe('hi');
    expect(truncateText('abcdef', 3)).toBe('abc');
  });

  it('normalizes flags and always includes g', () => {
    expect(normalizeFlags('i')).toContain('g');
    expect(normalizeFlags('gi')).toBe('gi');
    expect(normalizeFlags('xz')).toBe('g');
  });

  it('highlights matches in test string', () => {
    const result = highlightMatches(String.raw`\d+`, 'a12b34c', 'g');
    expect(result.ok).toBe(true);
    expect(result.matches).toHaveLength(2);
    expect(result.matches[0].text).toBe('12');
    const html = renderHighlightedHtml('a12b34c', result.matches);
    expect(html).toContain('<mark');
    expect(html).toContain('12');
  });

  it('reports invalid regex', () => {
    const result = highlightMatches('(', 'abc', 'g');
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
