import { describe, expect, it } from 'vitest';
import { buildDisclaimer } from './logic';
describe('legal-hold-notice', () => {
  it('disclaimer mentions not legal advice', () => {
    expect(buildDisclaimer().toLowerCase()).toContain('not legal advice');
  });
});