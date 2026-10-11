import { markdownResponseHeaders } from '@/lib/agent/vary';
import { docsLlms } from '@/lib/source';

export const revalidate = false;

export async function GET() {
  return new Response(await docsLlms.full(), {
    headers: {
      ...markdownResponseHeaders,
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
    },
  });
}
