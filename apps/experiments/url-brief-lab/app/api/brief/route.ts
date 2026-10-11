import { streamText } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import {
  buildOgPreviewPath,
  extractMetaDescription,
  extractTitle,
  FETCH_TIMEOUT_MS,
  isHttpUrl,
  MAX_HTML_BYTES,
  stripHtmlToText,
  truncateText,
} from '../../../logic';

export const maxDuration = 60;

const bodySchema = z.object({
  url: z.string().url().max(2000),
});

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

  const { url } = parsed.data;
  if (!isHttpUrl(url)) {
    return Response.json({ error: 'Only http(s) URLs are allowed.' }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html = '';
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'vercel-experiments-url-brief-lab/1.0' },
      redirect: 'follow',
    });
    if (!res.ok) {
      return Response.json(
        { error: `Upstream returned ${res.status}` },
        { status: 400 },
      );
    }
    const buf = await res.arrayBuffer();
    const slice = buf.byteLength > MAX_HTML_BYTES ? buf.slice(0, MAX_HTML_BYTES) : buf;
    html = new TextDecoder('utf-8', { fatal: false }).decode(slice);
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    return Response.json(
      {
        error: aborted
          ? `Fetch timed out after ${FETCH_TIMEOUT_MS}ms`
          : 'Failed to fetch URL',
      },
      { status: 400 },
    );
  } finally {
    clearTimeout(timer);
  }

  const title = extractTitle(html) || url;
  const description = extractMetaDescription(html);
  const text = truncateText(stripHtmlToText(html));
  const ogPreview = buildOgPreviewPath(title, description || text.slice(0, 160));

  const result = streamText({
    model: resolveModel(),
    prompt: `Summarize this web page for a busy engineer in 3 short paragraphs.
Include what the page is about and any notable calls to action.

TITLE: ${title}
META: ${description || '(none)'}
TEXT:
${text}`,
  });

  return result.toTextStreamResponse({
    headers: {
      'x-ai-provider': providerLabel(),
      'x-page-title': encodeURIComponent(title),
      'x-og-preview': ogPreview,
    },
  });
}
