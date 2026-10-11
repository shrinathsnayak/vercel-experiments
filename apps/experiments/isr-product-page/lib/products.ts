import { getProduct, PRODUCTS, type Product } from '../logic';

export type ProductPayload = Product & {
  generatedAt: string;
  note: string;
};

export function listProducts(): Product[] {
  return PRODUCTS;
}

export function loadProduct(slug: string): ProductPayload | null {
  const product = getProduct(slug);
  if (!product) return null;
  return {
    ...product,
    generatedAt: new Date().toISOString(),
    note: 'Payload generated at request/revalidate time for ISR demo.',
  };
}
