import { z } from 'zod';
import {
  clampSample,
  extractSitemapLocs,
  FETCH_TIMEOUT_MS,
  isHttpUrl,
  LINK_TIMEOUT_MS,
  MAX_SITEMAP_BYTES,
  MIN_DELAY_MS,
  sleep,
  summarizeChecks,
  type LinkCheck,
} from '../../../logic';

export const maxDuration = 60;

const bodySchema = z.object({
  sitemapUrl: z.string().url().max(2000),
  sample: z.number().int().min(1).max(15).optional(),
});

async function checkUrl(url: string): Promise<LinkCheck> {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LINK_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'user-agent': 'vercel-experiments-sitemap-health-lab/1.0' },
      redirect: 'follow',
    });
    return {
      url,
      status: res.status,
      ok: res.ok,
      ms: Date.now() - start,
    };
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    return {
      url,
      status: null,
      ok: false,
      error: aborted ? 'timeout' : 'fetch_failed',
      ms: Date.now() - start,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { sitemapUrl } = parsed.data;
  const sample = clampSample(parsed.data.sample);
  if (!isHttpUrl(sitemapUrl)) {
    return Response.json({ error: 'Only http(s) URLs are allowed.' }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let xml = '';
  try {
    const res = await fetch(sitemapUrl, {
      signal: controller.signal,
      headers: { 'user-agent': 'vercel-experiments-sitemap-health-lab/1.0' },
      redirect: 'follow',
    });
    if (!res.ok) {
      return Response.json({ error: `Upstream returned ${res.status}` }, { status: 400 });
    }
    const buf = await res.arrayBuffer();
    const slice = buf.byteLength > MAX_SITEMAP_BYTES ? buf.slice(0, MAX_SITEMAP_BYTES) : buf;
    xml = new TextDecoder('utf-8', { fatal: false }).decode(slice);
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    return Response.json(
      {
        error: aborted
          ? `Sitemap fetch timed out after ${FETCH_TIMEOUT_MS}ms`
          : 'Failed to fetch sitemap',
      },
      { status: 400 },
    );
  } finally {
    clearTimeout(timer);
  }

  const locs = extractSitemapLocs(xml, sample);
  if (!locs.length) {
    return Response.json({ error: 'No <loc> URLs found in sitemap.' }, { status: 400 });
  }

  const checks: LinkCheck[] = [];
  for (const url of locs) {
    checks.push(await checkUrl(url));
    await sleep(MIN_DELAY_MS);
  }

  return Response.json({
    sitemapUrl,
    sampled: locs.length,
    delayMs: MIN_DELAY_MS,
    summary: summarizeChecks(checks),
    checks,
  });
}
