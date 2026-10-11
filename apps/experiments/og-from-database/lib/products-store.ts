import { SEED_PRODUCTS, type Product } from '../logic';

const memory = new Map<string, Product>(
  SEED_PRODUCTS.map((p) => [p.slug, p]),
);

export function listMemoryProducts(): Product[] {
  return [...memory.values()];
}

export function getMemoryProduct(slug: string): Product | null {
  return memory.get(slug) ?? null;
}

export function upsertMemoryProduct(product: Product): void {
  memory.set(product.slug, product);
}
