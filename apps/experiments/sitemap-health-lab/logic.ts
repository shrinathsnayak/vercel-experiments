export const MAX_SITEMAP_BYTES = 500_000;
export const FETCH_TIMEOUT_MS = 8_000;
export const LINK_TIMEOUT_MS = 5_000;
export const DEFAULT_SAMPLE = 8;
export const MAX_SAMPLE = 15;
export const MIN_DELAY_MS = 200;

export type LinkCheck = {
  url: string;
  status: number | null;
  ok: boolean;
  error?: string;
  ms: number;
};

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function clampSample(n: unknown): number {
  const num = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(num)) return DEFAULT_SAMPLE;
  return Math.min(MAX_SAMPLE, Math.max(1, Math.floor(num)));
}

export function extractSitemapLocs(xml: string, max = MAX_SAMPLE): string[] {
  const locs: string[] = [];
  const re = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) && locs.length < max) {
    const url = m[1]?.trim();
    if (url && isHttpUrl(url) && !locs.includes(url)) locs.push(url);
  }
  return locs;
}

export function summarizeChecks(checks: LinkCheck[]): {
  ok: number;
  failed: number;
  avgMs: number;
} {
  const ok = checks.filter((c) => c.ok).length;
  const failed = checks.length - ok;
  const avgMs =
    checks.length === 0
      ? 0
      : Math.round(checks.reduce((sum, c) => sum + c.ms, 0) / checks.length);
  return { ok, failed, avgMs };
}

export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export const SAMPLE_SITEMAP = 'https://vercel.com/sitemap.xml';
