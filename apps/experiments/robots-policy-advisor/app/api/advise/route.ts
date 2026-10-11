import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import {
  clampAdvice,
  FETCH_TIMEOUT_MS,
  isHttpUrl,
  MAX_HTML_BYTES,
  normalizeRobotsUrl,
  parseRobotsRules,
  truncateText,
} from '../../../logic';

export const maxDuration = 60;

const bodySchema = z.object({
  robotsText: z.string().max(20_000).optional(),
  url: z.string().url().max(2000).optional(),
});

const adviceSchema = z.object({
  allows: z.array(z.string()).max(12),
  denies: z.array(z.string()).max(12),
  suggestions: z.array(z.string()).max(10),
  summary: z.string(),
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

  let robotsText = truncateText(parsed.data.robotsText ?? '');
  const url = parsed.data.url ? normalizeRobotsUrl(parsed.data.url) : '';

  if (!robotsText && url) {
    if (!isHttpUrl(url)) {
      return Response.json({ error: 'Only http(s) URLs are allowed.' }, { status: 400 });
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'user-agent': 'vercel-experiments-robots-policy-advisor/1.0' },
        redirect: 'follow',
      });
      if (!res.ok) {
        return Response.json({ error: `Upstream returned ${res.status}` }, { status: 400 });
      }
      const buf = await res.arrayBuffer();
      const slice = buf.byteLength > MAX_HTML_BYTES ? buf.slice(0, MAX_HTML_BYTES) : buf;
      robotsText = truncateText(
        new TextDecoder('utf-8', { fatal: false }).decode(slice),
      );
    } catch (err) {
      const aborted = err instanceof Error && err.name === 'AbortError';
      return Response.json(
        {
          error: aborted
            ? `Fetch timed out after ${FETCH_TIMEOUT_MS}ms`
            : 'Failed to fetch robots.txt',
        },
        { status: 400 },
      );
    } finally {
      clearTimeout(timer);
    }
  }

  if (!robotsText) {
    return Response.json(
      { error: 'Provide robotsText or a url to fetch robots.txt.' },
      { status: 400 },
    );
  }

  const local = parseRobotsRules(robotsText);

  const result = await generateObject({
    model: resolveModel(),
    schema: adviceSchema,
    prompt: `Explain this robots.txt for a Next.js site owner.
Return allows (paths bots may crawl), denies (blocked paths), suggestions (concrete improvements), and a short summary.
Stay grounded in the file; mention sitemaps if present.

LOCAL PARSE HINTS:
allows=${JSON.stringify(local.allows)}
denies=${JSON.stringify(local.denies)}
sitemaps=${JSON.stringify(local.sitemaps)}

ROBOTS.TXT:
${robotsText}`,
  });

  return Response.json({
    ...clampAdvice(result.object),
    local,
    sourceUrl: url || null,
    provider: providerLabel(),
  });
}
