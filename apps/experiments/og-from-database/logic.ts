import { z } from 'zod';

export type Product = {
  slug: string;
  title: string;
  description: string;
};

export const SEED_PRODUCTS: Product[] = [
  {
    slug: 'edge-cache',
    title: 'Edge Cache Kit',
    description: 'TTL helpers and Cache-Control presets for Next.js Route Handlers.',
  },
  {
    slug: 'neon-notes',
    title: 'Neon Notes',
    description: 'Serverless Postgres scratchpad with Marketplace DATABASE_URL.',
  },
  {
    slug: 'blob-drop',
    title: 'Blob Drop',
    description: 'Public uploads via @vercel/blob with size caps and prefixes.',
  },
];

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function normalizeProduct(input: {
  slug?: string;
  title: string;
  description: string;
}): Product | null {
  const title = input.title.trim();
  const description = input.description.trim();
  const slug = (input.slug?.trim() || slugify(title)).slice(0, 48);
  if (!title || !description || !slug) return null;
  return { slug, title, description };
}

export const productBodySchema = z.object({
  slug: z.string().min(1).max(48).optional(),
  title: z.string().min(1).max(80),
  description: z.string().min(1).max(200),
});
