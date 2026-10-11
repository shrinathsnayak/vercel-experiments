export type CompareRow = {
  label: string;
  url: string;
  bytes: number | null;
  contentType: string | null;
  note: string;
};

export function formatBytes(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function nextImageUrl(origin: string, path: string, width: number, quality: number): string {
  const base = origin.replace(/\/$/, '');
  const params = new URLSearchParams({
    url: path.startsWith('/') ? path : `/${path}`,
    w: String(width),
    q: String(quality),
  });
  return `${base}/_next/image?${params.toString()}`;
}

export function rawAssetUrl(origin: string, path: string): string {
  const base = origin.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export const SAMPLE_PATH = '/demo-hero.svg';
export const SAMPLE_WIDTHS = [640, 1080, 1920];
