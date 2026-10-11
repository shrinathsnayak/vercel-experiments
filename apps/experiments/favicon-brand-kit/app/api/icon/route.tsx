import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { contrastingInk, normalizeHex, normalizeLetter } from '../../../logic';

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const color = normalizeHex(sp.get('color') || '#0ea5e9');
  if (!color) return Response.json({ error: 'Invalid color' }, { status: 400 });
  const letter = normalizeLetter(sp.get('letter') || 'V');
  const size = Math.min(1024, Math.max(16, Number(sp.get('size') || 32)));
  const ink = contrastingInk(color);
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: color, color: ink, fontSize: Math.floor(size * 0.62), fontWeight: 700,
        fontFamily: 'system-ui, sans-serif',
      }}>
        {letter}
      </div>
    ),
    { width: size, height: size },
  );
}
