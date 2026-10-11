import { describe, expect, it } from 'vitest';
import { clampBundle, MAX_ROUTES, truncateText, type MockBundle } from './logic';

describe('api-mock-from-openapi logic', () => {
  it('truncates openapi', () => {
    expect(truncateText('  hi  ')).toBe('hi');
    expect(truncateText('abcdef', 3)).toBe('abc');
  });

  it('clamps routes and builds download text', () => {
    const bundle: MockBundle = {
      summary: ' Demo ',
      downloadText: '',
      routes: Array.from({ length: MAX_ROUTES + 2 }, (_, i) => ({
        method: 'get',
        path: `/api/${i}`,
        handlerFilename: `route-${i}.ts`,
        stubSource: `export async function GET() { return Response.json({ i: ${i} }) }`,
      })),
    };
    const clamped = clampBundle(bundle);
    expect(clamped.routes).toHaveLength(MAX_ROUTES);
    expect(clamped.routes[0].method).toBe('GET');
    expect(clamped.downloadText).toContain('/api/0');
  });
});
