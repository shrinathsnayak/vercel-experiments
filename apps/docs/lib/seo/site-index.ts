import type { MetadataRoute } from 'next';
import type { Experiment } from '@/lib/experiments';

export type DocsPageRef = {
  url: string;
};

export function collectPublicPaths(options: {
  marketingRoutes: readonly string[];
  docsPages: DocsPageRef[];
  publishedExperiments: Experiment[];
}): string[] {
  const publishedByPath = new Map(
    options.publishedExperiments.map((experiment) => [
      experiment.documentationPath,
      experiment,
    ]),
  );
  const docsUrls = new Set(options.docsPages.map((page) => page.url));

  const docsRoutes = options.docsPages
    .map((page) => page.url)
    .filter((url) => {
      if (!url.startsWith('/docs/experiments/')) return true;
      return publishedByPath.has(url);
    });

  for (const path of publishedByPath.keys()) {
    if (docsUrls.has(path) && !docsRoutes.includes(path)) {
      docsRoutes.push(path);
    }
  }

  return [...new Set([...options.marketingRoutes, ...docsRoutes])].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function buildSitemapEntries(options: {
  siteUrl: string;
  marketingRoutes: readonly string[];
  docsPages: DocsPageRef[];
  publishedExperiments: Experiment[];
}): MetadataRoute.Sitemap {
  const lastUpdatedByPath = new Map(
    options.publishedExperiments.map((experiment) => [
      experiment.documentationPath,
      experiment.lastUpdated,
    ]),
  );

  return collectPublicPaths(options).map((path) => {
    const lastUpdated = lastUpdatedByPath.get(path);
    const url = path === '/' ? options.siteUrl : `${options.siteUrl}${path}`;
    return {
      url,
      ...(lastUpdated ? { lastModified: new Date(lastUpdated) } : {}),
    };
  });
}

export function buildRobotsConfig(siteUrl: string): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/llms.mdx/', '/og/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
