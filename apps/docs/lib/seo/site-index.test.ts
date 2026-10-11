import { describe, expect, it } from 'vitest';
import type { Experiment } from '@/lib/experiments';
import {
  buildRobotsConfig,
  buildSitemapEntries,
  collectPublicPaths,
} from './site-index';

function experiment(
  partial: Pick<Experiment, 'slug' | 'documentationPath' | 'lastUpdated' | 'published'>,
): Experiment {
  return {
    title: partial.slug,
    description: 'x'.repeat(20),
    category: 'ai',
    tags: ['test'],
    technologies: ['Next.js'],
    difficulty: 'beginner',
    estimatedMinutes: 10,
    featured: false,
    phase: 1,
    surface: 'mixed',
    requiredEnvironmentVariables: [],
    externalServices: [],
    securityNotes: [],
    relatedSlugs: [],
    ...partial,
  };
}

describe('collectPublicPaths', () => {
  it('keeps marketing + guide docs and only published experiment pages', () => {
    const paths = collectPublicPaths({
      marketingRoutes: ['/', '/about', '/contribute', '/privacy'],
      docsPages: [
        { url: '/docs' },
        { url: '/docs/getting-started' },
        { url: '/docs/experiments/webhook-playground' },
        { url: '/docs/experiments/draft-only' },
      ],
      publishedExperiments: [
        experiment({
          slug: 'webhook-playground',
          documentationPath: '/docs/experiments/webhook-playground',
          lastUpdated: '2026-10-11',
          published: true,
        }),
      ],
    });

    expect(paths).toEqual([
      '/',
      '/about',
      '/contribute',
      '/docs',
      '/docs/experiments/webhook-playground',
      '/docs/getting-started',
      '/privacy',
    ]);
  });
});

describe('buildSitemapEntries', () => {
  it('sets lastModified from experiment lastUpdated', () => {
    const entries = buildSitemapEntries({
      siteUrl: 'https://vercel-experiments.com',
      marketingRoutes: ['/'],
      docsPages: [{ url: '/docs/experiments/webhook-playground' }],
      publishedExperiments: [
        experiment({
          slug: 'webhook-playground',
          documentationPath: '/docs/experiments/webhook-playground',
          lastUpdated: '2026-10-11',
          published: true,
        }),
      ],
    });

    expect(entries).toEqual([
      { url: 'https://vercel-experiments.com' },
      {
        url: 'https://vercel-experiments.com/docs/experiments/webhook-playground',
        lastModified: new Date('2026-10-11'),
      },
    ]);
  });
});

describe('buildRobotsConfig', () => {
  it('allows the site, blocks private trees, and links the sitemap', () => {
    const result = buildRobotsConfig('https://vercel-experiments.com');
    expect(result.sitemap).toBe('https://vercel-experiments.com/sitemap.xml');
    expect(result.host).toBe('https://vercel-experiments.com');
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    expect(rules[0]).toMatchObject({
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/llms.mdx/', '/og/'],
    });
  });
});
