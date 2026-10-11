import { buildOpenApiDocument } from '@/lib/api/openapi';

export const revalidate = false;

export async function GET() {
  return Response.json(buildOpenApiDocument(), {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
