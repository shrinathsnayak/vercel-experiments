import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'Vercel Experiments';
export const appDescription =
  'Independent open-source playground for Next.js and Vercel platform experiments. Not affiliated with or endorsed by Vercel.';
export const siteBanner = {
  text: 'This site is not affiliated with or endorsed by Vercel, Inc. Read the docs, then deploy or run each experiment yourself.',
};
export const homeRoute = '/';
export const docsRoute = '/docs';
export const aboutRoute = '/about';
export const contactRoute = '/contact';
export const contributeRoute = '/contribute';
export const developersRoute = '/developers';
export const changelogRoute = '/docs/changelog';
export const privacyRoute = '/privacy';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';
export const openApiRoute = '/openapi.json';
export const markdownInternalRoute = '/markdown';

export const gitConfig = {
  user: 'vercel-experiments',
  repo: 'vercel-experiments.com',
  branch: 'main',
};

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'https://vercel-experiments.com';

export const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;
export const githubIssuesUrl = `${githubUrl}/issues`;
export const portfolioUrl = 'https://snayak.dev';

/** Optional public contact email for Organization schema and the contact page. */
export function getContactEmail(): string | undefined {
  const fromEnv = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  return fromEnv || undefined;
}

export const organizationAddress = {
  addressLocality: 'Bengaluru',
  addressCountry: 'IN',
} as const;

export function getBuyMeACoffeeUrl(): string | undefined {
  const fromEnv = process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL?.trim();
  return fromEnv || undefined;
}

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
