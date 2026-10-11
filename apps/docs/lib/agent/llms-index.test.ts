import { describe, expect, it } from 'vitest';
import { buildLlmsTxtIndex } from './llms-index';

describe('buildLlmsTxtIndex', () => {
  it('includes when-to-use guidance and developer resources', () => {
    const body = buildLlmsTxtIndex('# Documentation\n\n- [Home](/docs)');

    expect(body.startsWith('# Vercel Experiments')).toBe(true);
    expect(body).toContain('## When to use this');
    expect(body).toContain('deployable Next.js / Vercel lab');
    expect(body).toContain('/openapi.json');
    expect(body).toContain('/api/v1/experiments');
    expect(body).not.toContain('vercel-experiments-cli');
    expect(body).toContain('## Docs: Documentation');
  });
});
