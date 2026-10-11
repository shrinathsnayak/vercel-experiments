export const THEMES = {
  ocean: { bg: '#0c4a6e', fg: '#e0f2fe', accent: '#38bdf8' },
  forest: { bg: '#14532d', fg: '#dcfce7', accent: '#4ade80' },
  dusk: { bg: '#3b0764', fg: '#f3e8ff', accent: '#c084fc' },
  slate: { bg: '#1e293b', fg: '#f8fafc', accent: '#94a3b8' },
} as const;

export type ThemeName = keyof typeof THEMES;
export type ThumbSize = { name: string; width: number; height: number };

export const SIZES: ThumbSize[] = [
  { name: 'square', width: 800, height: 800 },
  { name: 'wide', width: 1200, height: 630 },
  { name: 'story', width: 1080, height: 1920 },
];

export function normalizeTitle(title: string): string {
  return title.trim().slice(0, 80) || 'Untitled';
}

export function normalizeTheme(theme: string): ThemeName {
  return theme in THEMES ? (theme as ThemeName) : 'slate';
}

export function batchUrls(base: string, title: string, theme: ThemeName): Array<{ name: string; url: string }> {
  const t = encodeURIComponent(normalizeTitle(title));
  const th = encodeURIComponent(theme);
  return SIZES.map((s) => ({
    name: s.name,
    url: `${base}/api/thumb?title=${t}&theme=${th}&w=${s.width}&h=${s.height}`,
  }));
}

export const SAMPLE_TITLE = 'Ship the waitlist';
export const SAMPLE_THEME: ThemeName = 'ocean';
