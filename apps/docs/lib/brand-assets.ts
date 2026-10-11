import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Absolute public URL for the brand logo (SEO / JSON-LD). */
export const logoPath = '/logo.png';

/** Absolute public URL for the default Open Graph image (App Router image route). */
export const defaultOgImagePath = '/opengraph-image';

let logoDataUrlPromise: Promise<string> | undefined;

/** Data URL for embedding the logo in ImageResponse / OG routes. */
export function getLogoDataUrl() {
  logoDataUrlPromise ??= readFile(join(process.cwd(), 'public', 'logo.png')).then(
    (buffer) => `data:image/png;base64,${buffer.toString('base64')}`,
  );
  return logoDataUrlPromise;
}
