export const MAX_HTML_BYTES = 500_000;
export const FETCH_TIMEOUT_MS = 8_000;

export type MetaSnapshot = {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  robots: string;
};

export type MetaAudit = {
  gaps: string[];
  suggestions: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
};

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return (m?.[1] ?? '').replace(/\s+/g, ' ').trim().slice(0, 200);
}

function metaByName(html: string, name: string): string {
  const re1 = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`,
    'i',
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["']`,
    'i',
  );
  const m = html.match(re1) || html.match(re2);
  return (m?.[1] ?? '').replace(/\s+/g, ' ').trim().slice(0, 300);
}

function linkRel(html: string, rel: string): string {
  const re = new RegExp(
    `<link[^>]+rel=["']${rel}["'][^>]+href=["']([^"']+)["']`,
    'i',
  );
  const re2 = new RegExp(
    `<link[^>]+href=["']([^"']+)["'][^>]+rel=["']${rel}["']`,
    'i',
  );
  const m = html.match(re) || html.match(re2);
  return (m?.[1] ?? '').trim().slice(0, 2000);
}

export function extractMetaSnapshot(html: string): MetaSnapshot {
  return {
    title: extractTitle(html),
    description: metaByName(html, 'description'),
    canonical: linkRel(html, 'canonical'),
    ogTitle: metaByName(html, 'og:title'),
    ogDescription: metaByName(html, 'og:description'),
    ogImage: metaByName(html, 'og:image'),
    robots: metaByName(html, 'robots'),
  };
}

export function findMetaGaps(meta: MetaSnapshot): string[] {
  const gaps: string[] = [];
  if (!meta.title) gaps.push('missing-title');
  else if (meta.title.length < 15) gaps.push('title-too-short');
  else if (meta.title.length > 60) gaps.push('title-too-long');
  if (!meta.description) gaps.push('missing-description');
  else if (meta.description.length < 50) gaps.push('description-too-short');
  else if (meta.description.length > 160) gaps.push('description-too-long');
  if (!meta.canonical) gaps.push('missing-canonical');
  if (!meta.ogTitle) gaps.push('missing-og-title');
  if (!meta.ogDescription) gaps.push('missing-og-description');
  if (!meta.ogImage) gaps.push('missing-og-image');
  return gaps;
}

export function buildOgPreviewPath(title: string, description: string): string {
  const params = new URLSearchParams({
    title: title.slice(0, 80),
    description: description.slice(0, 160),
  });
  return `/api/og?${params.toString()}`;
}

export function clampAudit(audit: MetaAudit): MetaAudit {
  return {
    gaps: audit.gaps
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 12),
    suggestions: {
      title: audit.suggestions.title.trim().slice(0, 70),
      description: audit.suggestions.description.trim().slice(0, 170),
      ogTitle: audit.suggestions.ogTitle.trim().slice(0, 70),
      ogDescription: audit.suggestions.ogDescription.trim().slice(0, 170),
    },
  };
}

export const SAMPLE_URL = 'https://vercel.com/docs';
