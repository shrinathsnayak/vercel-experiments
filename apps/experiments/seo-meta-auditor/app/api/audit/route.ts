import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import {
  buildOgPreviewPath,
  clampAudit,
  extractMetaSnapshot,
  FETCH_TIMEOUT_MS,
  findMetaGaps,
  isHttpUrl,
  MAX_HTML_BYTES,
} from '../../../logic';

export const maxDuration = 60;

const bodySchema = z.object({
  url: z.string().url().max(2000),
});

const auditSchema = z.object({
  gaps: z.array(z.string()).max(12),
  suggestions: z.object({
    title: z.string(),
    description: z.string(),
    ogTitle: z.string(),
    ogDescription: z.string(),
  }),
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
      headers: { 'user-agent': 'vercel-experiments-seo-meta-auditor/1.0' },
      redirect: 'follow',
    });
    if (!res.ok) {
      return Response.json({ error: `Upstream returned ${res.status}` }, { status: 400 });
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

  const meta = extractMetaSnapshot(html);
  const localGaps = findMetaGaps(meta);

  const result = await generateObject({
    model: resolveModel(),
    schema: auditSchema,
    prompt: `Audit SEO/social meta for this page. Merge localGaps with your own findings.
Rewrite title/description/og fields as suggestions (do not invent product claims).

URL: ${url}
META: ${JSON.stringify(meta, null, 2)}
LOCAL_GAPS: ${JSON.stringify(localGaps)}`,
  });

  const audit = clampAudit(result.object);
  const ogPreview = buildOgPreviewPath(
    audit.suggestions.ogTitle || audit.suggestions.title || meta.title || 'SEO audit',
    audit.suggestions.ogDescription || audit.suggestions.description || meta.description,
  );

  return Response.json({
    url,
    meta,
    localGaps,
    ...audit,
    ogPreview,
    provider: providerLabel(),
  });
}
