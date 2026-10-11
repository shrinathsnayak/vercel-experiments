export const MAX_SOURCE_CHARS = 16_000;

export type ReadmeDraft = {
  title: string;
  overview: string;
  features: string[];
  gettingStarted: string;
  projectStructure: string;
  configuration: string;
  scripts: string[];
};

export function truncateText(text: string, max = MAX_SOURCE_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function clampReadme(draft: ReadmeDraft): ReadmeDraft {
  return {
    title: draft.title.trim() || 'Project',
    overview: draft.overview.trim(),
    features: draft.features.map((f) => f.trim()).filter(Boolean).slice(0, 12),
    gettingStarted: draft.gettingStarted.trim(),
    projectStructure: draft.projectStructure.trim(),
    configuration: draft.configuration.trim(),
    scripts: draft.scripts.map((s) => s.trim()).filter(Boolean).slice(0, 12),
  };
}

export function toMarkdown(draft: ReadmeDraft): string {
  const features = draft.features.map((f) => `- ${f}`).join('\n');
  const scripts = draft.scripts.map((s) => `- \`${s}\``).join('\n');
  return `# ${draft.title}

${draft.overview}

## Features

${features || '- TBD'}

## Getting started

${draft.gettingStarted}

## Project structure

${draft.projectStructure}

## Configuration

${draft.configuration}

## Scripts

${scripts || '- TBD'}
`;
}

export function downloadText(filename: string, content: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const SAMPLE_TREE = `my-app/
  package.json
  app/
    layout.tsx
    page.tsx
    api/health/route.ts
  lib/
    db.ts
  README.md (empty)`;

export const SAMPLE_SNIPPETS = `// package.json scripts
{ "dev": "next dev", "build": "next build", "start": "next start" }

// lib/db.ts
export function getDb() {
  return process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
}

// app/api/health/route.ts
export async function GET() {
  return Response.json({ ok: true });
}`;
