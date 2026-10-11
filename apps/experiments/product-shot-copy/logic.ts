export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type ProductCopy = {
  title: string;
  bullets: string[];
  tagline: string;
};

export function isImageFilename(name: string): boolean {
  return /\.(png|jpe?g|webp|gif)$/i.test(name);
}

export function clampCopy(c: ProductCopy): ProductCopy {
  return {
    title: c.title.trim().slice(0, 80),
    tagline: c.tagline.trim().slice(0, 120),
    bullets: c.bullets.map((b) => b.trim()).filter(Boolean).slice(0, 6),
  };
}

export function ogQuery(c: ProductCopy): string {
  const params = new URLSearchParams({
    title: c.title,
    tagline: c.tagline,
  });
  return `/api/og?${params}`;
}
