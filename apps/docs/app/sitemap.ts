import type { MetadataRoute } from 'next';
import { getPublishedExperiments } from '@/lib/experiments';
import { buildSitemapEntries } from '@/lib/seo/site-index';
import { source } from '@/lib/source';
import {
  aboutRoute,
  contributeRoute,
  homeRoute,
  privacyRoute,
  siteUrl,
} from '@/lib/shared';

const MARKETING_ROUTES = [
  homeRoute,
  aboutRoute,
  contributeRoute,
  privacyRoute,
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries({
    siteUrl,
    marketingRoutes: MARKETING_ROUTES,
    docsPages: source.getPages().map((page) => ({ url: page.url })),
    publishedExperiments: getPublishedExperiments(),
  });
}
