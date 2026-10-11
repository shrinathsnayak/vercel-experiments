export const CONTENT_KEY = 'experiments:cron-sitemap:content';
export const SITEMAP_BLOB_PATH = 'experiments/cron-sitemap/sitemap.xml';
export const MAX_URLS = 200;

export type ContentUrl = {
  path: string;
  lastModified: string;
};

export function defaultContent(): ContentUrl[] {
  const now = new Date().toISOString();
  return [
    { path: '/', lastModified: now },
    { path: '/docs', lastModified: now },
    { path: '/docs/experiments', lastModified: now },
    { path: '/products/aurora-mug', lastModified: now },
  ];
}

export function buildSitemapXml(siteUrl: string, urls: ContentUrl[]): string {
  const base = siteUrl.replace(/\/$/, '');
  const body = urls
    .slice(0, MAX_URLS)
    .map(
      (u) => `  <url>
    <loc>${base}${u.path.startsWith('/') ? u.path : `/${u.path}`}</loc>
    <lastmod>${u.lastModified.slice(0, 10)}</lastmod>
  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

export function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    const ua = request.headers.get('user-agent') ?? '';
    return ua.includes('vercel-cron') || process.env.NODE_ENV !== 'production';
  }
  return request.headers.get('authorization') === `Bearer ${secret}`;
}
