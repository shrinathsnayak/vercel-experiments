import { generateObject } from 'ai';
import { z } from 'zod';
import { aiProviderAvailable } from '../../../lib/services';
import {
  AI_SETUP_BODY,
  providerLabel,
  resolveModel,
} from '../../../lib/ai-model';
import {
  clampBrief,
  FETCH_TIMEOUT_MS,
  normalizePackageName,
  parseRegistryPackage,
  registryDownloadsUrl,
  registryPackageUrl,
  type NpmMeta,
} from '../../../logic';

export const maxDuration = 60;

const bodySchema = z.object({
  packageName: z.string().min(1).max(214),
});

const briefSchema = z.object({
  whenToUse: z.array(z.string()).max(6),
  whenToAvoid: z.array(z.string()).max(6),
  notes: z.array(z.string()).max(6),
});

async function fetchJson(url: string): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'vercel-experiments-npm-package-brief/1.0',
        accept: 'application/json',
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
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

  const name = normalizePackageName(parsed.data.packageName);
  if (!name) {
    return Response.json({ error: 'Invalid npm package name.' }, { status: 400 });
  }

  const [pkgJson, downloadsJson] = await Promise.all([
    fetchJson(registryPackageUrl(name)),
    fetchJson(registryDownloadsUrl(name)),
  ]);

  const base = parseRegistryPackage(pkgJson);
  if (!base) {
    return Response.json({ error: `Package not found: ${name}` }, { status: 404 });
  }

  const weeklyDownloads =
    downloadsJson &&
    typeof downloadsJson === 'object' &&
    typeof (downloadsJson as { downloads?: unknown }).downloads === 'number'
      ? (downloadsJson as { downloads: number }).downloads
      : null;

  const meta: NpmMeta = { ...base, weeklyDownloads };

  const result = await generateObject({
    model: resolveModel(),
    schema: briefSchema,
    prompt: `Given npm registry metadata (no install was performed), advise when to use / avoid this package for a Next.js app.
Stay grounded in the metadata; do not invent APIs.

META:
${JSON.stringify(meta, null, 2)}`,
  });

  return Response.json({
    meta,
    ...clampBrief(result.object),
    provider: providerLabel(),
  });
}
