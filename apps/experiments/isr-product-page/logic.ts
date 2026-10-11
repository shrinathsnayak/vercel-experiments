export const REVALIDATE_SECONDS = 30;

export type Product = {
  slug: string;
  name: string;
  price: number;
  description: string;
};

export const PRODUCTS: Product[] = [
  {
    slug: 'aurora-mug',
    name: 'Aurora Mug',
    price: 24,
    description: 'Ceramic mug with a soft gradient glaze.',
  },
  {
    slug: 'edge-hoodie',
    name: 'Edge Hoodie',
    price: 68,
    description: 'Midweight hoodie for late-night deploys.',
  },
  {
    slug: 'cache-sticker',
    name: 'Cache Sticker Pack',
    price: 8,
    description: 'Die-cut stickers: HIT, MISS, STALE, REVALIDATING.',
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function productPath(slug: string): string {
  return `/products/${slug}`;
}
