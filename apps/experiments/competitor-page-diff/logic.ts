export const MAX_HTML_BYTES = 500_000;
export const FETCH_TIMEOUT_MS = 8_000;
export const MAX_EXTRACT_CHARS = 8_000;

export type PageSnapshot = {
  url: string;
  title: string;
  description: string;
  text: string;
};

export type MessagingDiff = {
  sharedThemes: string[];
  aOnly: string[];
  bOnly: string[];
  positioningNotes: string[];
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

export function extractMetaDescription(html: string): string {
  const m =
    html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
    ) ||
    html.match(
      /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i,
    );
  return (m?.[1] ?? '').replace(/\s+/g, ' ').trim().slice(0, 300);
}

export function stripHtmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncateText(text: string, max = MAX_EXTRACT_CHARS): string {
  return text.length <= max ? text : text.slice(0, max);
}

export function clampDiff(result: MessagingDiff): MessagingDiff {
  const clean = (arr: string[], n: number) =>
    arr
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, n);
  return {
    sharedThemes: clean(result.sharedThemes, 8),
    aOnly: clean(result.aOnly, 8),
    bOnly: clean(result.bOnly, 8),
    positioningNotes: clean(result.positioningNotes, 8),
  };
}

export const SAMPLE_A = 'https://vercel.com';
export const SAMPLE_B = 'https://netlify.com';
