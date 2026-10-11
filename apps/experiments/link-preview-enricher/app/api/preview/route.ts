import { generateObject } from 'ai';
import { put } from '@vercel/blob';
import { z } from 'zod';
import { aiProviderAvailable, getServiceStatus } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import {
  clampUrls,
  extractMeta,
  FETCH_TIMEOUT_MS,
  heuristicRewrite,
  isHttpUrl,
  MAX_HTML_BYTES,
  type EnrichedPreview,
} from '../../../logic';

export const maxDuration = 60;

const rewriteSchema = z.object({
  rewrittenTitle: z.string(),
});

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { 'user-agent': 'link-preview-enricher/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  const slice = buf.byteLength > MAX_HTML_BYTES ? buf.slice(0, MAX_HTML_BYTES) : buf;
  return new TextDecoder('utf-8', { fatal: false }).decode(slice);
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const raw = (json as { urls?: unknown }).urls;
  const urls = clampUrls(
    Array.isArray(raw)
      ? raw.filter((u): u is string => typeof u === 'string')
      : typeof (json as { url?: unknown }).url === 'string'
        ? [(json as { url: string }).url]
        : [],
  ).filter(isHttpUrl);

  if (urls.length === 0) {
    return Response.json({ error: 'Provide 1–5 http(s) urls.' }, { status: 400 });
  }

  if (!aiProviderAvailable()) {
    return Response.json(AI_SETUP_BODY, { status: 503 });
  }

  const origin = new URL(request.url).origin;
  const previews: EnrichedPreview[] = [];

  for (const url of urls) {
    let meta;
    try {
      const html = await fetchHtml(url);
      meta = extractMeta(html, url);
    } catch (err) {
      meta = {
        url,
        title: new URL(url).hostname,
        description: err instanceof Error ? err.message : 'fetch failed',
      };
    }

    let rewrittenTitle = heuristicRewrite(meta);
    try {
      const result = await generateObject({
        model: resolveModel(),
        schema: rewriteSchema,
        prompt: `Rewrite this link title for a social card. Max 12 words. Keep meaning.
title: ${meta.title}
description: ${meta.description}
url: ${meta.url}`,
      });
      rewrittenTitle = result.object.rewrittenTitle.trim() || rewrittenTitle;
    } catch {
      /* keep heuristic */
    }

    const ogPath = `/api/og?title=${encodeURIComponent(rewrittenTitle)}&description=${encodeURIComponent(meta.description.slice(0, 120))}`;
    const preview: EnrichedPreview = {
      ...meta,
      rewrittenTitle,
      ogPath,
    };

    if (getServiceStatus('blob').available) {
      try {
        const ogRes = await fetch(`${origin}${ogPath}`);
        if (ogRes.ok) {
          const bytes = await ogRes.arrayBuffer();
          const blob = await put(
            `link-preview/${Date.now()}-${encodeURIComponent(new URL(url).hostname)}.png`,
            Buffer.from(bytes),
            { access: 'public', contentType: 'image/png' },
          );
          preview.blobUrl = blob.url;
        }
      } catch {
        /* optional */
      }
    }

    previews.push(preview);
  }

  return Response.json({
    previews,
    provider: providerLabel(),
    blob: getServiceStatus('blob').available,
    note: !getServiceStatus('blob').available
      ? 'BLOB_READ_WRITE_TOKEN not set - OG cards are ImageResponse-only (not stored).'
      : undefined,
  });
}
