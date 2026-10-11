import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const title = (request.nextUrl.searchParams.get('title') || 'Product').slice(0, 80);
  const tagline = (request.nextUrl.searchParams.get('tagline') || '').slice(0, 120);
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: 64, background: '#0f172a', color: '#f8fafc',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ fontSize: 20, color: '#94a3b8', marginBottom: 16 }}>Product shot copy</div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
        {tagline ? <div style={{ fontSize: 28, color: '#cbd5e1', marginTop: 24 }}>{tagline}</div> : null}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
