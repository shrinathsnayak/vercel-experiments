export const MAX_FIELD_CHARS = 12_000;

export type TriageResult = {
  labels: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  firstResponse: string;
  clarifyingQuestions: string[];
};

export const SAMPLE_TITLE = 'App Router build fails with Module not found: @/lib/utils';
export const SAMPLE_BODY = `### Description
After upgrading to Next.js 16, \`pnpm build\` fails:

\`\`\`
Module not found: Can't resolve '@/lib/utils'
\`\`\`

### Steps
1. Clone repo
2. pnpm install
3. pnpm build

### Expected
Build succeeds.

### Environment
- Next.js 16.3
- pnpm 10
- macOS
`;

export function truncateText(text: string, max = MAX_FIELD_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function clampTriage(result: TriageResult): TriageResult {
  return {
    labels: result.labels
      .map((s) => s.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter(Boolean)
      .slice(0, 8),
    severity: result.severity,
    firstResponse: result.firstResponse.trim().slice(0, 1200),
    clarifyingQuestions: result.clarifyingQuestions
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6),
  };
}
