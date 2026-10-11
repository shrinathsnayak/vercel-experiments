export const MAX_FEED_BYTES = 500_000;
export const FETCH_TIMEOUT_MS = 8_000;
export const DEFAULT_TOP_N = 5;
export const MAX_TOP_N = 10;
export const MAX_ITEM_CHARS = 1_200;

export type FeedItem = {
  title: string;
  link: string;
  summary: string;
};

export type DigestItem = {
  title: string;
  link: string;
  digest: string;
};

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function clampTopN(n: unknown): number {
  const num = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(num)) return DEFAULT_TOP_N;
  return Math.min(MAX_TOP_N, Math.max(1, Math.floor(num)));
}

function decodeXml(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function tagContent(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m?.[1] ? decodeXml(m[1]).slice(0, MAX_ITEM_CHARS) : '';
}

export function parseFeedItems(xml: string, topN = DEFAULT_TOP_N): FeedItem[] {
  const items: FeedItem[] = [];
  const entryRe = /<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/gi;
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(xml)) && items.length < topN) {
    const block = m[0];
    const title = tagContent(block, 'title') || '(untitled)';
    const linkHref = block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1];
    const link = tagContent(block, 'link') || (linkHref ? decodeXml(linkHref) : '');
    const summary =
      tagContent(block, 'description') ||
      tagContent(block, 'summary') ||
      tagContent(block, 'content') ||
      '';
    items.push({ title, link, summary });
  }
  return items;
}

export function clampDigests(items: DigestItem[]): DigestItem[] {
  return items.slice(0, MAX_TOP_N).map((item) => ({
    title: item.title.trim().slice(0, 200),
    link: item.link.trim().slice(0, 2000),
    digest: item.digest.trim().slice(0, 400),
  }));
}

export const SAMPLE_FEED = 'https://nextjs.org/feed.xml';
