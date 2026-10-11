import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const title = (request.nextUrl.searchParams.get('title') ?? 'URL Brief').slice(0, 80);
  const description = (request.nextUrl.searchParams.get('description') ?? '').slice(0, 160);

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
          padding: 56,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 18, color: '#a3a3a3', marginBottom: 16 }}>url-brief-lab</div>
        <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.15 }}>{title}</div>
        {description ? (
          <div style={{ fontSize: 24, color: '#a3a3a3', marginTop: 20, lineHeight: 1.35 }}>
            {description}
          </div>
        ) : null}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
