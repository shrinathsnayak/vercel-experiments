import { experimentDefinitions } from './data';
import {
  experimentSchema,
  type Experiment,
  type ExperimentDefinition,
  type ExperimentSurface,
} from './schema';

/** Client-only labs - no `app/api` Route Handlers. */
const UI_SURFACE_SLUGS = new Set([
  'cdn-redirects-lab',
  'content-security-policy-builder',
  'env-promotion-checklist',
  'environment-variable-inspector',
  'image-optimization-lab',
  'microfrontends-zones-lab',
  'middleware-routing-lab',
  'streaming-ssr-playground',
  'webhook-signature-verifier',
]);

/**
 * Labs with handlers that are secondary to a UI / local simulator, or ImageResponse
 * URL builders. AI category labs are also treated as mixed (server boundary, not REST).
 */
const MIXED_SURFACE_SLUGS = new Set([
  'cache-behavior-explorer',
  'favicon-brand-kit',
  'rate-limiting-simulator',
  'thumbnail-factory',
  'vercel-flags-lab',
]);

export function resolveExperimentSurface(
  experiment: Pick<ExperimentDefinition, 'slug' | 'category' | 'surface'>,
): ExperimentSurface {
  if (experiment.surface) return experiment.surface;
  if (UI_SURFACE_SLUGS.has(experiment.slug)) return 'ui';
  if (MIXED_SURFACE_SLUGS.has(experiment.slug) || experiment.category === 'ai') {
    return 'mixed';
  }
  return 'route-handlers';
}

const validated: Experiment[] = experimentDefinitions.map((item) => {
  const parsed = experimentSchema.parse(item);
  return {
    ...parsed,
    surface: resolveExperimentSurface(parsed),
  };
});

const bySlug = new Map(validated.map((experiment) => [experiment.slug, experiment]));

export function getAllExperiments(options?: { includeUnpublished?: boolean }): Experiment[] {
  const experiments = [...validated].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
  );

  if (options?.includeUnpublished) return experiments;
  return experiments.filter((experiment) => experiment.published);
}

export function getPublishedExperiments(): Experiment[] {
  return getAllExperiments();
}

export function getExperiment(slug: string): Experiment | undefined {
  const experiment = bySlug.get(slug);
  if (!experiment || !experiment.published) return undefined;
  return experiment;
}

export function getFeaturedExperiments(limit = 6): Experiment[] {
  return getPublishedExperiments()
    .filter((experiment) => experiment.featured)
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, limit);
}

export function getRecentExperiments(limit = 6): Experiment[] {
  return getPublishedExperiments()
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, limit);
}

export function getRelatedExperiments(slug: string, limit = 3): Experiment[] {
  const experiment = getExperiment(slug);
  if (!experiment) return [];

  const related = experiment.relatedSlugs
    .map((relatedSlug) => getExperiment(relatedSlug))
    .filter((item): item is Experiment => Boolean(item));

  if (related.length >= limit) return related.slice(0, limit);

  const fillers = getPublishedExperiments()
    .filter(
      (item) =>
        item.slug !== slug &&
        !related.some((relatedItem) => relatedItem.slug === item.slug) &&
        (item.category === experiment.category ||
          item.tags.some((tag) => experiment.tags.includes(tag))),
    )
    .slice(0, limit - related.length);

  return [...related, ...fillers];
}

export function getExperimentSlugs(): string[] {
  return getPublishedExperiments().map((experiment) => experiment.slug);
}

export function validateRegistry(): Experiment[] {
  return validated;
}
