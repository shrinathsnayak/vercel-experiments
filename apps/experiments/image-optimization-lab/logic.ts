export type ImageFormat = 'avif' | 'webp' | 'jpeg';

const FORMAT_FACTOR: Record<ImageFormat, number> = {
  avif: 0.07,
  webp: 0.11,
  jpeg: 0.22,
};

/** Heuristic byte estimate for education - not measured CDN output. */
export function estimateBytes(
  width: number,
  format: ImageFormat,
  quality: number,
  aspectRatio = 16 / 9,
): number {
  const w = Math.max(1, Math.floor(width));
  const h = Math.max(1, Math.floor(w / aspectRatio));
  const q = Math.min(100, Math.max(1, quality)) / 100;
  const pixels = w * h;
  return Math.round(pixels * FORMAT_FACTOR[format] * q);
}

export function computeSrcSet(basePath: string, widths: number[]): string {
  const sorted = [...widths].filter((w) => w > 0).sort((a, b) => a - b);
  return sorted.map((w) => `${basePath}?w=${w} ${w}w`).join(', ');
}

export function buildSizesAttribute(breakpoints: { minWidth: number; size: string }[]): string {
  const parts = breakpoints
    .filter((b) => b.minWidth >= 0)
    .sort((a, b) => b.minWidth - a.minWidth)
    .map((b) => `(min-width: ${b.minWidth}px) ${b.size}`);
  parts.push('100vw');
  return parts.join(', ');
}

export function compareFormats(
  width: number,
  quality: number,
): { format: ImageFormat; estimatedBytes: number }[] {
  return (['avif', 'webp', 'jpeg'] as const).map((format) => ({
    format,
    estimatedBytes: estimateBytes(width, format, quality),
  }));
}

export function nextImageExample(width: number, quality: number): string {
  return `import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={${width}}
  height={${Math.round(width / (16 / 9))}}
  quality={${quality}}
  sizes="(min-width: 768px) 50vw, 100vw"
/>`;
}
