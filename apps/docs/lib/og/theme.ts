import type { ExperimentCategory, ExperimentDifficulty } from '@/lib/experiments';

export const ogSize = { width: 1200, height: 630 } as const;

export const ogBrand = {
  blue: '#0070F3',
  blueSoft: 'rgba(0, 112, 243, 0.55)',
  blueGlow: 'rgba(0, 112, 243, 0.28)',
  ink: '#05070C',
  panel: '#0E121A',
  line: 'rgba(255, 255, 255, 0.10)',
  text: '#F8FAFC',
  muted: 'rgba(248, 250, 252, 0.68)',
  chipBg: 'rgba(255, 255, 255, 0.08)',
} as const;

export const categoryOgColors: Record<
  ExperimentCategory,
  { bg: string; text: string; glow: string }
> = {
  ai: { bg: 'rgba(139, 92, 246, 0.18)', text: '#C4B5FD', glow: 'rgba(139, 92, 246, 0.35)' },
  performance: { bg: 'rgba(245, 158, 11, 0.18)', text: '#FCD34D', glow: 'rgba(245, 158, 11, 0.35)' },
  networking: { bg: 'rgba(14, 165, 233, 0.18)', text: '#7DD3FC', glow: 'rgba(14, 165, 233, 0.35)' },
  security: { bg: 'rgba(244, 63, 94, 0.18)', text: '#FDA4AF', glow: 'rgba(244, 63, 94, 0.35)' },
  rendering: { bg: 'rgba(16, 185, 129, 0.18)', text: '#6EE7B7', glow: 'rgba(16, 185, 129, 0.35)' },
  routing: { bg: 'rgba(249, 115, 22, 0.18)', text: '#FDBA74', glow: 'rgba(249, 115, 22, 0.35)' },
  platform: { bg: 'rgba(0, 112, 243, 0.18)', text: '#93C5FD', glow: 'rgba(0, 112, 243, 0.40)' },
  'developer-tools': {
    bg: 'rgba(148, 163, 184, 0.18)',
    text: '#CBD5E1',
    glow: 'rgba(148, 163, 184, 0.30)',
  },
};

export const difficultyOgLabels: Record<ExperimentDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/** Keep OG copy from overflowing ImageResponse layouts. */
export function truncateOgText(value: string, maxChars: number): string {
  const trimmed = value.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}
