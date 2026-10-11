import { describe, expect, it } from 'vitest';
import { applyDecision, canSubmit, clampTitle, makeToken } from './logic';

describe('approval-workflow-lab logic', () => {
  it('clamps title', () => {
    expect(clampTitle('  hi  ')).toBe('hi');
    expect(clampTitle('x'.repeat(200)).length).toBe(120);
  });
  it('state machine', () => {
    expect(canSubmit('draft')).toBe(true);
    expect(canSubmit('pending')).toBe(false);
    expect(applyDecision('pending', 'approve')).toBe('approved');
    expect(applyDecision('draft', 'approve')).toBeNull();
  });
  it('makes tokens', () => {
    expect(makeToken('a').length).toBeGreaterThan(4);
  });
});
