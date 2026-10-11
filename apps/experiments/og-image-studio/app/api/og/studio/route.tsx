import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { ogStudioQuerySchema } from '../../../../logic';

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = ogStudioQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const { title, description, theme, layout, width, height } = parsed.data;
  const isDark = theme === 'dark';
  const bg = isDark ? '#0a0a0a' : '#fafafa';
  const fg = isDark ? '#fafafa' : '#171717';
  const muted = isDark ? '#a3a3a3' : '#737373';
  const border = isDark ? '#262626' : '#e5e5e5';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: layout === 'split' ? 'row' : 'column',
          alignItems: layout === 'centered' ? 'center' : 'flex-start',
          justifyContent: layout === 'centered' ? 'center' : 'flex-start',
          background: bg,
          color: fg,
          padding: 64,
          fontFamily: 'system-ui, sans-serif',
          border: `1px solid ${border}`,
        }}
      >
        {layout === 'split' ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '42%',
              paddingRight: 48,
              borderRight: `1px solid ${border}`,
            }}
          >
            <div style={{ fontSize: 22, color: muted, marginBottom: 16 }}>OG Image Studio</div>
            <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
          </div>
        ) : null}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: layout === 'centered' ? 'center' : 'flex-start',
            textAlign: layout === 'centered' ? 'center' : 'left',
            paddingLeft: layout === 'split' ? 48 : 0,
          }}
        >
          {layout !== 'split' ? (
            <>
              <div style={{ fontSize: 20, color: muted, marginBottom: 20 }}>vercel-experiments.com</div>
              <div style={{ fontSize: layout === 'centered' ? 64 : 56, fontWeight: 700, lineHeight: 1.1 }}>
                {title}
              </div>
            </>
          ) : null}
          {description ? (
            <div
              style={{
                fontSize: 28,
                color: muted,
                marginTop: layout === 'split' ? 0 : 24,
                lineHeight: 1.35,
                maxWidth: layout === 'centered' ? '90%' : '100%',
              }}
            >
              {description}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { width, height },
  );
}
