export const MAX_FIELD_CHARS = 10_000;

export type FitResult = {
  matchScore: number;
  missingSkills: string[];
  strengths: string[];
  rewrittenBullets: string[];
};

export function truncateText(text: string, max = MAX_FIELD_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function normalizeFitResult(raw: FitResult): FitResult {
  return {
    matchScore: clampScore(raw.matchScore),
    missingSkills: raw.missingSkills.slice(0, 12),
    strengths: raw.strengths.slice(0, 12),
    rewrittenBullets: raw.rewrittenBullets.slice(0, 8),
  };
}

export const SAMPLE_JD = `We need a full-stack engineer with React, Next.js, TypeScript, and Postgres experience. Familiarity with Vercel deployments and AI SDK is a plus.`;

export const SAMPLE_RESUME = `Built React dashboards in TypeScript. Deployed Next.js apps on Vercel. Used Postgres with Prisma. Mentored juniors on accessibility.`;
