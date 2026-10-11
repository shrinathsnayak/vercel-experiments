import { describe, expect, it } from 'vitest';
import { filterExperiments } from './search';
import {
  getExperiment,
  getPublishedExperiments,
  resolveExperimentSurface,
  validateRegistry,
} from './registry';

describe('experiment registry', () => {
  it('validates all registered experiments', () => {
    const experiments = validateRegistry();
    expect(experiments.length).toBe(122);
    const slugs = new Set(experiments.map((experiment) => experiment.slug));
    expect(slugs.size).toBe(experiments.length);
  });

  it('resolves surface for ui, mixed, and route-handler labs', () => {
    expect(resolveExperimentSurface({ slug: 'cdn-redirects-lab', category: 'routing' })).toBe(
      'ui',
    );
    expect(resolveExperimentSurface({ slug: 'vercel-flags-lab', category: 'developer-tools' })).toBe(
      'mixed',
    );
    expect(resolveExperimentSurface({ slug: 'ai-streaming-lab', category: 'ai' })).toBe('mixed');
    expect(resolveExperimentSurface({ slug: 'webhook-playground', category: 'networking' })).toBe(
      'route-handlers',
    );
    expect(
      resolveExperimentSurface({
        slug: 'webhook-playground',
        category: 'networking',
        surface: 'ui',
      }),
    ).toBe('ui');
    for (const experiment of validateRegistry()) {
      expect(['ui', 'route-handlers', 'mixed']).toContain(experiment.surface);
    }
  });

  it('hides unpublished experiments from public getters', () => {
    for (const experiment of getPublishedExperiments()) {
      expect(experiment.published).toBe(true);
    }
  });

  it('returns experiments by slug', () => {
    expect(getExperiment('webhook-playground')?.title).toBe('Webhook Playground');
    expect(getExperiment('does-not-exist')).toBeUndefined();
  });
});

describe('filterExperiments', () => {
  const experiments = getPublishedExperiments();

  it('filters by query', () => {
    const results = filterExperiments(experiments, { query: 'webhook' });
    expect(results.some((item) => item.slug === 'webhook-playground')).toBe(true);
  });

  it('filters by category and sorts by title', () => {
    const results = filterExperiments(experiments, {
      category: 'networking',
      sort: 'title',
    });
    expect(results.every((item) => item.category === 'networking')).toBe(true);
    expect(results.map((item) => item.title)).toEqual(
      [...results].map((item) => item.title).sort((a, b) => a.localeCompare(b)),
    );
  });
});
