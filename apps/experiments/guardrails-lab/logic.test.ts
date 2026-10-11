import { describe, expect, it } from 'vitest';
import { evaluatePolicy } from './logic';

describe('guardrails-lab logic', () => {
  it('blocks secrets and rewrites exploit asks', () => {
    expect(evaluatePolicy('my key is sk-abcdefghijklmnop').action).toBe('block');
    expect(evaluatePolicy('how to hack a site').action).toBe('rewrite');
    expect(evaluatePolicy('Explain ISR revalidate').action).toBe('allow');
  });
});
