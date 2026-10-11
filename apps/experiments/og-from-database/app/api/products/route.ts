import { getSql, postgresAvailable } from '../../../lib/postgres';
import {
  listMemoryProducts,
  upsertMemoryProduct,
} from '../../../lib/products-store';
import {
  normalizeProduct,
  productBodySchema,
  SEED_PRODUCTS,
  type Product,
} from '../../../logic';

async function ensureTable() {
  const sql = getSql();
  if (!sql) return null;
  await sql`
    CREATE TABLE IF NOT EXISTS experiment_products (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  return sql;
}

async function seedIfEmpty() {
  const sql = await ensureTable();
  if (!sql) return;
  const rows = await sql`SELECT COUNT(*)::int AS count FROM experiment_products`;
  const count = Number(rows[0]?.count ?? 0);
  if (count > 0) return;
  for (const product of SEED_PRODUCTS) {
    await sql`
      INSERT INTO experiment_products (slug, title, description)
      VALUES (${product.slug}, ${product.title}, ${product.description})
      ON CONFLICT (slug) DO NOTHING
    `;
  }
}

function storageLabel(): 'neon' | 'memory' {
  return postgresAvailable() ? 'neon' : 'memory';
}

export async function GET() {
  if (postgresAvailable()) {
    await seedIfEmpty();
    const sql = await ensureTable();
    if (!sql) {
      return Response.json({ error: 'Postgres unavailable' }, { status: 503 });
    }
    const rows = await sql`
      SELECT slug, title, description
      FROM experiment_products
      ORDER BY created_at ASC
      LIMIT 50
    `;
    return Response.json({
      products: rows as Product[],
      storage: storageLabel(),
    });
  }

  return Response.json({
    products: listMemoryProducts(),
    storage: 'memory',
    note: 'DATABASE_URL not set - using in-memory seed products.',
  });
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = productBodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = normalizeProduct(parsed.data);
  if (!product) {
    return Response.json({ error: 'Invalid product.' }, { status: 400 });
  }

  if (postgresAvailable()) {
    await seedIfEmpty();
    const sql = await ensureTable();
    if (!sql) {
      return Response.json({ error: 'Postgres unavailable' }, { status: 503 });
    }
    await sql`
      INSERT INTO experiment_products (slug, title, description)
      VALUES (${product.slug}, ${product.title}, ${product.description})
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description
    `;
    return Response.json({ product, storage: 'neon' }, { status: 201 });
  }

  upsertMemoryProduct(product);
  return Response.json({
    product,
    storage: 'memory',
    note: 'DATABASE_URL not set - stored in memory only.',
  }, { status: 201 });
}
