import { jsonError, methodNotAllowed } from '@/lib/api/errors';
import { openApiRoute, siteUrl } from '@/lib/shared';

export async function GET() {
  return Response.json(
    {
      name: 'Vercel Experiments Catalog API',
      version: '1.0.0',
      openapi: `${siteUrl}${openApiRoute}`,
      endpoints: {
        listExperiments: `${siteUrl}/api/v1/experiments`,
        getExperiment: `${siteUrl}/api/v1/experiments/{slug}`,
      },
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    },
  );
}

export async function POST() {
  return methodNotAllowed(['GET']);
}

export async function PUT() {
  return jsonError(
    405,
    'method_not_allowed',
    'Method not allowed. Allowed: GET.',
    'This is a read-only catalog API.',
  );
}
