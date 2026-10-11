import { logoPath, defaultOgImagePath } from '@/lib/brand-assets';
import {
  appDescription,
  appName,
  contactRoute,
  getContactEmail,
  githubUrl,
  organizationAddress,
  portfolioUrl,
  siteUrl,
} from '@/lib/shared';

export function buildOrganizationJsonLd() {
  const email = getContactEmail();

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: appName,
    url: siteUrl,
    description: appDescription,
    logo: `${siteUrl}${logoPath}`,
    sameAs: [githubUrl, portfolioUrl],
    address: {
      '@type': 'PostalAddress',
      addressLocality: organizationAddress.addressLocality,
      addressCountry: organizationAddress.addressCountry,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'community support',
        url: `${siteUrl}${contactRoute}`,
        ...(email ? { email } : {}),
        availableLanguage: ['English'],
      },
    ],
  };
}

export function buildSoftwareApplicationJsonLd(experimentCount: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: appName,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    url: siteUrl,
    description: appDescription,
    image: `${siteUrl}${defaultOgImagePath}`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: appName,
      url: siteUrl,
    },
    featureList: [
      `${experimentCount} deployable Next.js and Vercel experiments`,
      'Public REST catalog API and OpenAPI specification',
      'Markdown content negotiation and llms.txt for agents',
      'MCP server for docs search and page retrieval',
    ],
  };
}

export function buildHomepageJsonLd(experimentCount: number) {
  return [
    buildOrganizationJsonLd(),
    buildSoftwareApplicationJsonLd(experimentCount),
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: appName,
      url: siteUrl,
      description: appDescription,
      publisher: {
        '@type': 'Organization',
        name: appName,
        url: siteUrl,
      },
    },
  ];
}
