import { z } from 'zod';
import { jsonError, methodNotAllowed } from '@/lib/api/errors';
import { toPublicExperiment } from '@/lib/api/experiments';
import { getExperiment } from '@/lib/experiments';

const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const parsed = slugSchema.safeParse(slug);

  if (!parsed.success) {
    return jsonError(
      400,
      'invalid_slug',
      'Experiment slug must be kebab-case alphanumeric.',
      'Example: webhook-playground. See /openapi.json and GET /api/v1/experiments.',
    );
  }

  const experiment = getExperiment(parsed.data);
  if (!experiment) {
    return jsonError(
      404,
      'not_found',
      `No published experiment found for slug "${parsed.data}".`,
      'List slugs with GET /api/v1/experiments or browse /docs.',
    );
  }

  return Response.json(
    { experiment: toPublicExperiment(experiment) },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=3600',
        'Access-Control-Allow-Origin': '*',
      },
    },
  );
}

export async function POST() {
  return methodNotAllowed(['GET']);
}
