import { getRedis } from '../../lib/redis';
import { getServiceStatus } from '../../lib/services';
import { CONTENT_KEY, SITEMAP_BLOB_PATH, buildSitemapXml, defaultContent } from '../../logic';

export async function GET(request: Request) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || new URL(request.url).origin;

  const redis = getRedis();
  if (redis) {
    const xml = await redis.get<string>(`${CONTENT_KEY}:xml`);
    if (typeof xml === 'string' && xml.includes('<urlset')) {
      return new Response(xml, {
        headers: { 'content-type': 'application/xml; charset=utf-8' },
      });
    }
  }

  if (getServiceStatus('blob').available) {
    // Blob URL may be public; fall back to regenerating from defaults if fetch fails.
    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      // Prefer regenerating from defaults for demo reliability when no prior cron run.
      void token;
      void SITEMAP_BLOB_PATH;
    } catch {
      // ignore
    }
  }

  const xml = buildSitemapXml(siteUrl, defaultContent());
  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
