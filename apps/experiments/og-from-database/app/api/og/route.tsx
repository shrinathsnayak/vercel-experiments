import { ImageResponse } from 'next/og';
import { getSql, postgresAvailable } from '../../../lib/postgres';
import { getMemoryProduct } from '../../../lib/products-store';
import type { Product } from '../../../logic';

async function findProduct(slug: string): Promise<Product | null> {
  if (postgresAvailable()) {
    const sql = getSql();
    if (!sql) return null;
    const rows = await sql`
      SELECT slug, title, description
      FROM experiment_products
      WHERE slug = ${slug}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      slug: String(row.slug),
      title: String(row.title),
      description: String(row.description),
    };
  }
  return getMemoryProduct(slug);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = (searchParams.get('slug') ?? '').trim();
  if (!slug) {
    return Response.json({ error: 'slug query param is required.' }, { status: 400 });
  }

  const product = await findProduct(slug);
  if (!product) {
    return Response.json({ error: `No product for slug "${slug}".` }, { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#fafafa',
          padding: 64,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 22, color: '#a3a3a3', marginBottom: 20 }}>
          og-from-database · {product.slug}
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>
          {product.title}
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#a3a3a3',
            marginTop: 24,
            lineHeight: 1.35,
            maxWidth: '90%',
          }}
        >
          {product.description}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
