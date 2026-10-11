import { buildLlmsTxtIndex } from '@/lib/agent/llms-index';
import { markdownResponseHeaders } from '@/lib/agent/vary';
import { docsLlms } from '@/lib/source';

export const revalidate = false;

export async function GET() {
  const body = buildLlmsTxtIndex(await docsLlms.index());
  return new Response(body, {
    headers: {
      ...markdownResponseHeaders,
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
    },
  });
}
