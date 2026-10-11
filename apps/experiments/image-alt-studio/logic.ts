export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type AltResult = {
  alt: string;
  seoFilename: string;
  caption: string;
};

export function isImageFilename(name: string): boolean {
  return /\.(png|jpe?g|webp|gif)$/i.test(name);
}

export function sanitizeSeoFilename(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return base || 'image';
}
