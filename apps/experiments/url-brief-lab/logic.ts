export const MAX_HTML_BYTES = 500_000;
export const FETCH_TIMEOUT_MS = 8_000;
export const MAX_EXTRACT_CHARS = 12_000;

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

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function buildOgPreviewPath(title: string, description: string): string {
  const params = new URLSearchParams({
    title: title.slice(0, 80),
    description: description.slice(0, 160),
  });
  return `/api/og?${params.toString()}`;
}
