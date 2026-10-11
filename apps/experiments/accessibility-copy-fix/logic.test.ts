import { describe, expect, it } from 'vitest';
import { findLocalA11yFlags } from './logic';
describe('accessibility-copy-fix', () => {
  it('flags vague links', () => {
    expect(findLocalA11yFlags('CLICK HERE for more!!!')).toContain('Vague link text: "click here"');
  });
});