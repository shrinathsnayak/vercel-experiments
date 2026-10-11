import { put } from '@vercel/blob';
import { getRedis } from '../../../../lib/redis';
import { getSql, postgresAvailable } from '../../../../lib/postgres';
import { getServiceStatus } from '../../../../lib/services';
import {
  CONTENT_KEY,
  SITEMAP_BLOB_PATH,
  authorizeCron,
  buildSitemapXml,
  defaultContent,
  type ContentUrl,
} from '../../../../logic';

const memoryXml = new Map<string, string>();

async function loadContent(): Promise<{ urls: ContentUrl[]; source: string }> {
  const sql = getSql();
  if (sql) {
    await sql`
      CREATE TABLE IF NOT EXISTS experiment_sitemap_urls (
        path TEXT PRIMARY KEY,
        last_modified TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    const rows = await sql`SELECT path, last_modified FROM experiment_sitemap_urls ORDER BY path LIMIT 200`;
    if (rows.length > 0) {
      return {
        urls: rows.map((r) => ({
          path: String(r.path),
          lastModified: new Date(String(r.last_modified)).toISOString(),
        })),
        source: 'neon',
      };
    }
    const seed = defaultContent();
    for (const u of seed) {
      await sql`
        INSERT INTO experiment_sitemap_urls (path, last_modified)
        VALUES (${u.path}, ${u.lastModified})
        ON CONFLICT (path) DO NOTHING
      `;
    }
    return { urls: seed, source: 'neon' };
  }

  const redis = getRedis();
  if (redis) {
    const cached = await redis.get<ContentUrl[]>(CONTENT_KEY);
    if (Array.isArray(cached) && cached.length) return { urls: cached, source: 'redis' };
    const seed = defaultContent();
    await redis.set(CONTENT_KEY, seed);
    return { urls: seed, source: 'redis' };
  }

  return { urls: defaultContent(), source: 'memory' };
}

async function persistXml(xml: string): Promise<'blob' | 'redis' | 'memory'> {
  if (getServiceStatus('blob').available) {
    await put(SITEMAP_BLOB_PATH, xml, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/xml',
    });
    return 'blob';
  }
  const redis = getRedis();
  if (redis) {
    await redis.set(`${CONTENT_KEY}:xml`, xml, { ex: 60 * 60 * 24 * 7 });
    return 'redis';
  }
  memoryXml.set('sitemap', xml);
  return 'memory';
}

export async function GET(request: Request) {
  return POST(request);
}

export async function POST(request: Request) {
  if (!authorizeCron(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || new URL(request.url).origin;
  const { urls, source } = await loadContent();
  const xml = buildSitemapXml(siteUrl, urls);
  const storage = await persistXml(xml);
  memoryXml.set('sitemap', xml);

  return Response.json({
    ok: true,
    ranAt: new Date().toISOString(),
    urlCount: urls.length,
    contentSource: source,
    storage,
    postgres: postgresAvailable(),
    xml,
  });
}

export function __memorySitemap(): string | undefined {
  return memoryXml.get('sitemap');
}
