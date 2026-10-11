import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { normalizeTheme, normalizeTitle, THEMES } from '../../../logic';

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const title = normalizeTitle(sp.get('title') || 'Untitled');
  const theme = normalizeTheme(sp.get('theme') || 'slate');
  const colors = THEMES[theme];
  const width = Math.min(1600, Math.max(200, Number(sp.get('w') || 800)));
  const height = Math.min(2000, Math.max(200, Number(sp.get('h') || 800)));
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: 48, background: colors.bg, color: colors.fg,
        fontFamily: 'system-ui, sans-serif', borderBottom: `16px solid ${colors.accent}`,
      }}>
        <div style={{ fontSize: 18, color: colors.accent, marginBottom: 16 }}>thumbnail-factory</div>
        <div style={{ fontSize: Math.min(64, Math.floor(width / 16)), fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
      </div>
    ),
    { width, height },
  );
}
