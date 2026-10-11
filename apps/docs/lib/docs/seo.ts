import type { Metadata } from 'next';
import {
  categoryLabels,
  difficultyLabels,
  getExperiment,
  type Experiment,
} from '@/lib/experiments';
import { logoPath } from '@/lib/brand-assets';
import { appName, getPageImageUrl, siteUrl } from '@/lib/shared';

type DocsPageLike = {
  url: string;
  slugs: string[];
  locale?: string;
  data: {
    title: string;
    description?: string;
  };
};

export function getExperimentSlugFromDocsPage(page: DocsPageLike): string | undefined {
  if (page.slugs[0] !== 'experiments' || page.slugs.length !== 2) return undefined;
  return page.slugs[1];
}

export function getExperimentForDocsPage(page: DocsPageLike): Experiment | undefined {
  const slug = getExperimentSlugFromDocsPage(page);
  if (!slug) return undefined;
  return getExperiment(slug);
}

export function buildDocsPageMetadata(page: DocsPageLike): Metadata {
  const experiment = getExperimentForDocsPage(page);
  const title = experiment?.title ?? page.data.title;
  const description = experiment?.description ?? page.data.description ?? appName;
  const canonical = `${siteUrl}${page.url}`;
  const image = getPageImageUrl(page).url;
  const keywords = experiment
    ? [
      ...experiment.tags,
      ...experiment.technologies,
      categoryLabels[experiment.category],
      difficultyLabels[experiment.difficulty],
      'Next.js',
      'Vercel',
    ]
    : undefined;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      siteName: appName,
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export function buildExperimentDocsJsonLd(page: DocsPageLike) {
  const experiment = getExperimentForDocsPage(page);
  if (!experiment) return null;

  const canonical = `${siteUrl}${page.url}`;
  const image = `${siteUrl}${getPageImageUrl(page).url}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: experiment.title,
    description: experiment.description,
    dateModified: experiment.lastUpdated,
    url: canonical,
    mainEntityOfPage: canonical,
    keywords: experiment.tags.join(', '),
    image,
    about: {
      '@type': 'SoftwareApplication',
      name: experiment.title,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      url: canonical,
      description: experiment.description,
    },
    isPartOf: {
      '@type': 'WebSite',
      name: appName,
      url: siteUrl,
    },
    author: {
      '@type': 'Organization',
      name: appName,
      url: siteUrl,
      logo: `${siteUrl}${logoPath}`,
    },
  };
}
