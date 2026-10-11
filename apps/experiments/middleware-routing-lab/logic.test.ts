import { describe, expect, it } from 'vitest';
import { evaluateRequest, type RoutingRule } from './logic';

describe('evaluateRequest', () => {
  it('rewrites matching paths', () => {
    const rules: RoutingRule[] = [
      { id: 'r1', type: 'rewrite', match: '/docs*', value: '/content/docs', enabled: true },
    ];
    const decision = evaluateRequest(rules, {
      pathname: '/docs/guide',
      headers: {},
      cookies: {},
    });
    expect(decision.action).toBe('rewrite');
    expect(decision.pathname).toBe('/content/docs');
  });

  it('blocks when feature flag is off', () => {
    const rules: RoutingRule[] = [
      { id: 'f', type: 'feature-flag', match: '*', value: 'off', enabled: true },
    ];
    const decision = evaluateRequest(rules, { pathname: '/', headers: {}, cookies: {} });
    expect(decision.action).toBe('block');
  });
});
