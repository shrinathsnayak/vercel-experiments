import { describe, expect, it } from 'vitest';
import { clampTicket, isImageFilename } from './logic';

describe('screenshot-to-ticket logic', () => {
  it('checks filenames', () => {
    expect(isImageFilename('a.PNG')).toBe(true);
    expect(isImageFilename('a.txt')).toBe(false);
  });
  it('clamps tickets', () => {
    const t = clampTicket({
      title: '  Bug  ', severity: 'nope' as 'low', summary: 's',
      steps: ['1', '', '2'], expected: 'e', actual: 'a',
    });
    expect(t.title).toBe('Bug');
    expect(t.severity).toBe('medium');
    expect(t.steps).toEqual(['1', '2']);
  });
});
