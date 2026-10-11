export const MAX_URLS = 5;
export const FETCH_TIMEOUT_MS = 8_000;
export const MAX_HTML_BYTES = 512_000;

export type UrlMeta = {
  url: string;
  title: string;
  description: string;
  siteName?: string;
};

export type EnrichedPreview = UrlMeta & {
  rewrittenTitle: string;
  ogPath: string;
  blobUrl?: string;
};

export function isHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function clampUrls(urls: string[]): string[] {
  return [...new Set(urls.map((u) => u.trim()).filter(Boolean))].slice(0, MAX_URLS);
}

export function extractMeta(html: string, url: string): UrlMeta {
  const pick = (prop: string) => {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
      'i',
    );
    const alt = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
      'i',
    );
    return html.match(re)?.[1] ?? html.match(alt)?.[1] ?? '';
  };
  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? '';
  const title = decodeEntities(pick('og:title') || titleTag || new URL(url).hostname);
  const description = decodeEntities(
    pick('og:description') || pick('description') || 'No description found.',
  );
  const siteName = decodeEntities(pick('og:site_name')) || undefined;
  return { url, title: title.slice(0, 160), description: description.slice(0, 280), siteName };
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function heuristicRewrite(meta: UrlMeta): string {
  const host = (() => {
    try {
      return new URL(meta.url).hostname.replace(/^www\./, '');
    } catch {
      return 'link';
    }
  })();
  const base = meta.title.trim() || host;
  return `${base} - via ${host}`;
}

export const SAMPLE_URLS = ['https://example.com', 'https://vercel.com'];
