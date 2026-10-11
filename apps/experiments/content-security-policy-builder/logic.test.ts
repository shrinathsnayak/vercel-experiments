import { describe, expect, it } from 'vitest';
import {
  analyzeViolations,
  buildCsp,
  defaultCspDirectives,
  samplePageResources,
} from './logic';

describe('buildCsp', () => {
  it('joins directives in order', () => {
    const policy = buildCsp(defaultCspDirectives);
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("frame-src 'none'");
  });
});

describe('analyzeViolations', () => {
  it('flags blocked external script', () => {
    const violations = analyzeViolations(defaultCspDirectives, samplePageResources);
    expect(violations.some((v) => v.resourceId === 'app-js')).toBe(true);
  });

  it('allows self fetch when connect-src is self', () => {
    const violations = analyzeViolations(defaultCspDirectives, [
      {
        id: 'self-api',
        label: 'Same-origin API',
        directive: 'connect-src',
        source: '/api/health',
        kind: 'host',
      },
    ]);
    expect(violations).toHaveLength(0);
  });
});
