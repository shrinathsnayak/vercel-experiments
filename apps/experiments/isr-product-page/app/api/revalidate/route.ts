import { revalidatePath } from 'next/cache';
import { getProduct, productPath } from '../../../logic';

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const slug = typeof (json as { slug?: unknown })?.slug === 'string' ? (json as { slug: string }).slug : '';
  if (!getProduct(slug)) {
    return Response.json({ error: 'Unknown product slug.' }, { status: 404 });
  }

  const path = productPath(slug);
  revalidatePath(path);
  return Response.json({
    ok: true,
    path,
    revalidatedAt: new Date().toISOString(),
  });
}
