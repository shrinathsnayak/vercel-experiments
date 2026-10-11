import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadProduct, listProducts } from '../../../lib/products';

/** Keep literal for Next.js static analysis (matches REVALIDATE_SECONDS in logic.ts). */
export const revalidate = 30;

export function generateStaticParams() {
  return listProducts().map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = loadProduct(slug);
  if (!product) notFound();

  return (
    <article className="space-y-4">
      <p className="text-xs uppercase tracking-wide text-fd-muted-foreground">
        ISR demo · revalidate={revalidate}s
      </p>
      <h1 className="text-2xl font-semibold">{product.name}</h1>
      <p className="text-lg">${product.price}</p>
      <p className="text-sm text-fd-muted-foreground">{product.description}</p>
      <p className="font-mono text-xs">generatedAt: {product.generatedAt}</p>
      <p className="text-xs text-fd-muted-foreground">{product.note}</p>
      <Link href="/" className="text-sm underline">
        ← Back to lab
      </Link>
    </article>
  );
}
