import { nextImageUrl, rawAssetUrl, type CompareRow } from '../../../logic';

async function probe(url: string): Promise<{ bytes: number | null; contentType: string | null }> {
  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store', signal: AbortSignal.timeout(8_000) });
    const buf = await res.arrayBuffer();
    return {
      bytes: buf.byteLength,
      contentType: res.headers.get('content-type'),
    };
  } catch {
    return { bytes: null, contentType: null };
  }
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const body = json as Record<string, unknown>;
  const path = typeof body.path === 'string' && body.path.startsWith('/') ? body.path : '/demo-hero.svg';
  const width = typeof body.width === 'number' ? Math.min(2400, Math.max(64, Math.floor(body.width))) : 1080;
  const quality =
    typeof body.quality === 'number' ? Math.min(100, Math.max(1, Math.floor(body.quality))) : 75;

  const origin = new URL(request.url).origin;
  const raw = rawAssetUrl(origin, path);
  const optimized = nextImageUrl(origin, path, width, quality);

  const [rawProbe, optProbe] = await Promise.all([probe(raw), probe(optimized)]);

  const rows: CompareRow[] = [
    {
      label: 'Raw public URL',
      url: raw,
      bytes: rawProbe.bytes,
      contentType: rawProbe.contentType,
      note: 'Served as uploaded static file.',
    },
    {
      label: 'next/image optimizer',
      url: optimized,
      bytes: optProbe.bytes,
      contentType: optProbe.contentType,
      note: `/_next/image w=${width} q=${quality}`,
    },
  ];

  return Response.json({ rows, path, width, quality });
}
