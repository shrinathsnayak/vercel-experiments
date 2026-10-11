import { z } from 'zod';
import { jsonError, methodNotAllowed } from '@/lib/api/errors';
import { toPublicExperiment } from '@/lib/api/experiments';
import {
  experimentCategorySchema,
  getPublishedExperiments,
} from '@/lib/experiments';

const querySchema = z.object({
  category: experimentCategorySchema.optional(),
  q: z.string().trim().min(1).max(120).optional(),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) =>
      value === undefined ? undefined : value === 'true',
    ),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    category: url.searchParams.get('category') ?? undefined,
    q: url.searchParams.get('q') ?? undefined,
    featured: url.searchParams.get('featured') ?? undefined,
  });

  if (!parsed.success) {
    return jsonError(
      400,
      'invalid_query',
      'Query parameters are invalid.',
      'Use optional category (enum), q (1-120 chars), and featured=true|false. See /openapi.json.',
    );
  }

  const { category, q, featured } = parsed.data;
  const needle = q?.toLowerCase();

  let experiments = getPublishedExperiments().map(toPublicExperiment);

  if (category) {
    experiments = experiments.filter((item) => item.category === category);
  }
  if (featured === true) {
    experiments = experiments.filter((item) => item.featured);
  }
  if (needle) {
    experiments = experiments.filter((item) => {
      const haystack = [
        item.title,
        item.description,
        item.slug,
        ...item.tags,
        ...item.technologies,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }

  return Response.json(
    {
      count: experiments.length,
      experiments,
    },
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
