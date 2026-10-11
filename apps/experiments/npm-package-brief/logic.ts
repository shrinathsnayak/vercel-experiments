export const FETCH_TIMEOUT_MS = 8_000;
export const MAX_README_CHARS = 4_000;

export type NpmMeta = {
  name: string;
  version: string;
  description: string;
  license: string;
  homepage: string;
  repository: string;
  weeklyDownloads: number | null;
  keywords: string[];
};

export type PackageBrief = {
  whenToUse: string[];
  whenToAvoid: string[];
  notes: string[];
};

export function normalizePackageName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 214) return null;
  // scoped or unscoped npm name
  if (!/^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/i.test(trimmed)) {
    return null;
  }
  return trimmed.toLowerCase();
}

export function registryPackageUrl(name: string): string {
  return `https://registry.npmjs.org/${encodeURIComponent(name).replace('%40', '@')}`;
}

export function registryDownloadsUrl(name: string): string {
  return `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name).replace('%40', '@')}`;
}

export function parseRegistryPackage(data: unknown): Omit<NpmMeta, 'weeklyDownloads'> | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  const name = typeof obj.name === 'string' ? obj.name : '';
  if (!name) return null;
  const latest =
    typeof (obj['dist-tags'] as { latest?: string } | undefined)?.latest === 'string'
      ? (obj['dist-tags'] as { latest: string }).latest
      : '';
  const versions = obj.versions as Record<string, Record<string, unknown>> | undefined;
  const ver = latest && versions?.[latest] ? versions[latest] : undefined;
  const repo =
    typeof ver?.repository === 'string'
      ? ver.repository
      : typeof (ver?.repository as { url?: string } | undefined)?.url === 'string'
        ? ((ver?.repository as { url: string }).url as string)
        : '';
  return {
    name,
    version: latest || 'unknown',
    description: typeof ver?.description === 'string' ? ver.description : '',
    license: typeof ver?.license === 'string' ? ver.license : 'unknown',
    homepage: typeof ver?.homepage === 'string' ? ver.homepage : '',
    repository: repo.replace(/^git\+/, '').replace(/\.git$/, ''),
    keywords: Array.isArray(ver?.keywords)
      ? ver.keywords.filter((k): k is string => typeof k === 'string').slice(0, 12)
      : [],
  };
}

export function clampBrief(brief: PackageBrief): PackageBrief {
  const clean = (arr: string[], n: number) =>
    arr
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, n);
  return {
    whenToUse: clean(brief.whenToUse, 6),
    whenToAvoid: clean(brief.whenToAvoid, 6),
    notes: clean(brief.notes, 6),
  };
}

export const SAMPLE_PACKAGE = 'zod';
