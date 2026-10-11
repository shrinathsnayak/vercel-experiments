import { describe, expect, it } from 'vitest';
import { formatBytes, isAllowedFilename } from './logic';

describe('blob-storage-lab logic', () => {
  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
  });

  it('validates filenames', () => {
    expect(isAllowedFilename('note.txt')).toBe(true);
    expect(isAllowedFilename('../secret')).toBe(false);
  });
});
