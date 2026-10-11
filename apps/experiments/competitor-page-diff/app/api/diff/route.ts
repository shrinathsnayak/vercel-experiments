import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import {
  clampDiff,
  extractMetaDescription,
  extractTitle,
  FETCH_TIMEOUT_MS,
  isHttpUrl,
  MAX_HTML_BYTES,
  stripHtmlToText,
  truncateText,
  type PageSnapshot,
} from '../../../logic';

export const maxDuration = 60;

const bodySchema = z.object({
  urlA: z.string().url().max(2000),
  urlB: z.string().url().max(2000),
});

const diffSchema = z.object({
  sharedThemes: z.array(z.string()).max(8),
  aOnly: z.array(z.string()).max(8),
  bOnly: z.array(z.string()).max(8),
  positioningNotes: z.array(z.string()).max(8),
});

async function fetchPage(url: string): Promise<PageSnapshot | { error: string }> {
  if (!isHttpUrl(url)) return { error: 'Only http(s) URLs are allowed.' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'vercel-experiments-competitor-page-diff/1.0' },
      redirect: 'follow',
    });
    if (!res.ok) return { error: `Upstream returned ${res.status} for ${url}` };
    const buf = await res.arrayBuffer();
    const slice = buf.byteLength > MAX_HTML_BYTES ? buf.slice(0, MAX_HTML_BYTES) : buf;
    const html = new TextDecoder('utf-8', { fatal: false }).decode(slice);
    const title = extractTitle(html) || url;
    const description = extractMetaDescription(html);
    const text = truncateText(stripHtmlToText(html));
    return { url, title, description, text };
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    return {
      error: aborted
        ? `Fetch timed out after ${FETCH_TIMEOUT_MS}ms (${url})`
        : `Failed to fetch ${url}`,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  if (!aiProviderAvailable()) {
    return Response.json(AI_SETUP_BODY, { status: 503 });
  }

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

  const [a, b] = await Promise.all([
    fetchPage(parsed.data.urlA),
    fetchPage(parsed.data.urlB),
  ]);
  if ('error' in a) return Response.json({ error: a.error }, { status: 400 });
  if ('error' in b) return Response.json({ error: b.error }, { status: 400 });

  const result = await generateObject({
    model: resolveModel(),
    schema: diffSchema,
    prompt: `Compare marketing/messaging on these two single pages (not whole sites).
Return sharedThemes, aOnly (page A distinct claims), bOnly, and positioningNotes for a PM.
Stay grounded in the extracted text; do not invent features.

PAGE A (${a.url})
TITLE: ${a.title}
META: ${a.description || '(none)'}
TEXT:
${a.text}

PAGE B (${b.url})
TITLE: ${b.title}
META: ${b.description || '(none)'}
TEXT:
${b.text}`,
  });

  return Response.json({
    ...clampDiff(result.object),
    pages: {
      a: { url: a.url, title: a.title, description: a.description },
      b: { url: b.url, title: b.title, description: b.description },
    },
    provider: providerLabel(),
  });
}
