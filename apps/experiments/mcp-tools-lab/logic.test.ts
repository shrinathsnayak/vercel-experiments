import { describe, expect, it } from 'vitest';
import { getBySlug, searchCatalog } from './logic';

describe('mcp-tools-lab', () => {
  it('searches catalog', () => {
    const hits = searchCatalog('jwt');
    expect(hits.some((h) => h.slug === 'edge-auth-lab')).toBe(true);
  });

  it('gets by slug', () => {
    expect(getBySlug('mcp-tools-lab')?.title).toBe('MCP Tools Lab');
  });
});
