import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import {
  clampDigests,
  clampTopN,
  FETCH_TIMEOUT_MS,
  isHttpUrl,
  MAX_FEED_BYTES,
  parseFeedItems,
} from '../../../logic';

export const maxDuration = 60;

const bodySchema = z.object({
  feedUrl: z.string().url().max(2000),
  topN: z.number().int().min(1).max(10).optional(),
  regenerate: z.boolean().optional(),
});

const digestSchema = z.object({
  digests: z
    .array(
      z.object({
        title: z.string(),
        link: z.string(),
        digest: z.string(),
      }),
    )
    .max(10),
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

  const { feedUrl, regenerate } = parsed.data;
  const topN = clampTopN(parsed.data.topN);
  if (!isHttpUrl(feedUrl)) {
    return Response.json({ error: 'Only http(s) URLs are allowed.' }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let xml = '';
  try {
    const res = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { 'user-agent': 'vercel-experiments-rss-digest-lab/1.0' },
      redirect: 'follow',
      cache: regenerate ? 'no-store' : 'default',
    });
    if (!res.ok) {
      return Response.json({ error: `Upstream returned ${res.status}` }, { status: 400 });
    }
    const buf = await res.arrayBuffer();
    const slice = buf.byteLength > MAX_FEED_BYTES ? buf.slice(0, MAX_FEED_BYTES) : buf;
    xml = new TextDecoder('utf-8', { fatal: false }).decode(slice);
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    return Response.json(
      {
        error: aborted
          ? `Fetch timed out after ${FETCH_TIMEOUT_MS}ms`
          : 'Failed to fetch feed',
      },
      { status: 400 },
    );
  } finally {
    clearTimeout(timer);
  }

  const items = parseFeedItems(xml, topN);
  if (!items.length) {
    return Response.json({ error: 'No feed items found.' }, { status: 400 });
  }

  const result = await generateObject({
    model: resolveModel(),
    schema: digestSchema,
    prompt: `Write a one-sentence digest for each feed item. Keep title and link unchanged.
${regenerate ? 'Regenerate with a fresh angle; avoid copying prior wording if possible.' : ''}

ITEMS:
${items
  .map(
    (item, i) =>
      `${i + 1}. TITLE: ${item.title}\nLINK: ${item.link}\nSUMMARY: ${item.summary}`,
  )
  .join('\n\n')}`,
  });

  return Response.json({
    digests: clampDigests(result.object.digests),
    count: items.length,
    regenerated: Boolean(regenerate),
    provider: providerLabel(),
  });
}
