export const MAX_ROBOTS_CHARS = 20_000;
export const MAX_HTML_BYTES = 200_000;
export const FETCH_TIMEOUT_MS = 8_000;

export type RobotsAdvice = {
  allows: string[];
  denies: string[];
  suggestions: string[];
  summary: string;
};

export const SAMPLE_ROBOTS = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Sitemap: https://example.com/sitemap.xml

User-agent: GPTBot
Disallow: /`;

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function truncateText(text: string, max = MAX_ROBOTS_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function normalizeRobotsUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (trimmed.endsWith('/robots.txt')) return trimmed;
  try {
    const u = new URL(trimmed);
    if (u.pathname === '/' || u.pathname === '') {
      u.pathname = '/robots.txt';
      return u.toString();
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}

/** Lightweight local parse for demos / tests (AI still explains). */
export function parseRobotsRules(text: string): {
  allows: string[];
  denies: string[];
  sitemaps: string[];
} {
  const allows: string[] = [];
  const denies: string[] = [];
  const sitemaps: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const [key, ...rest] = line.split(':');
    const value = rest.join(':').trim();
    const k = (key ?? '').toLowerCase();
    if (k === 'allow' && value) allows.push(value);
    if (k === 'disallow' && value) denies.push(value);
    if (k === 'sitemap' && value) sitemaps.push(value);
  }
  return {
    allows: [...new Set(allows)].slice(0, 20),
    denies: [...new Set(denies)].slice(0, 20),
    sitemaps: [...new Set(sitemaps)].slice(0, 10),
  };
}

export function clampAdvice(result: RobotsAdvice): RobotsAdvice {
  const clean = (arr: string[], n: number) =>
    arr
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, n);
  return {
    allows: clean(result.allows, 12),
    denies: clean(result.denies, 12),
    suggestions: clean(result.suggestions, 10),
    summary: result.summary.trim().slice(0, 500),
  };
}
