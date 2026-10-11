export const MAX_JSON_CHARS = 80_000;

export type LighthouseFix = {
  priority: 'P0' | 'P1' | 'P2';
  category: string;
  issue: string;
  nextjsFix: string;
};

export type ActionPlan = {
  scoreSummary: string;
  fixes: LighthouseFix[];
};

export const SAMPLE_LIGHTHOUSE = JSON.stringify(
  {
    categories: {
      performance: { score: 0.62, title: 'Performance' },
      accessibility: { score: 0.88, title: 'Accessibility' },
      'best-practices': { score: 0.92, title: 'Best Practices' },
      seo: { score: 0.83, title: 'SEO' },
    },
    audits: {
      'largest-contentful-paint': {
        id: 'largest-contentful-paint',
        title: 'Largest Contentful Paint',
        score: 0.4,
        displayValue: '3.8 s',
      },
      'cumulative-layout-shift': {
        id: 'cumulative-layout-shift',
        title: 'Cumulative Layout Shift',
        score: 0.55,
        displayValue: '0.18',
      },
      'unused-javascript': {
        id: 'unused-javascript',
        title: 'Reduce unused JavaScript',
        score: 0.3,
        displayValue: 'Est savings of 220 KiB',
      },
      'meta-description': {
        id: 'meta-description',
        title: 'Document does not have a meta description',
        score: 0,
      },
    },
  },
  null,
  2,
);

export function truncateText(text: string, max = MAX_JSON_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function extractAuditHints(jsonText: string): {
  categories: Array<{ id: string; score: number | null; title: string }>;
  weakAudits: Array<{ id: string; title: string; score: number | null; displayValue?: string }>;
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { categories: [], weakAudits: [] };
  }
  const root = parsed as {
    categories?: Record<string, { score?: number | null; title?: string }>;
    audits?: Record<
      string,
      { id?: string; title?: string; score?: number | null; displayValue?: string }
    >;
  };
  const categories = Object.entries(root.categories ?? {}).map(([id, c]) => ({
    id,
    score: typeof c.score === 'number' ? c.score : null,
    title: c.title ?? id,
  }));
  const weakAudits = Object.values(root.audits ?? {})
    .filter((a) => typeof a.score === 'number' && a.score < 0.9)
    .slice(0, 20)
    .map((a) => ({
      id: a.id ?? a.title ?? 'audit',
      title: a.title ?? a.id ?? 'audit',
      score: typeof a.score === 'number' ? a.score : null,
      displayValue: a.displayValue,
    }));
  return { categories, weakAudits };
}

export function clampPlan(plan: ActionPlan): ActionPlan {
  return {
    scoreSummary: plan.scoreSummary.trim().slice(0, 400),
    fixes: plan.fixes.slice(0, 12).map((f) => ({
      priority: f.priority,
      category: f.category.trim().slice(0, 40),
      issue: f.issue.trim().slice(0, 200),
      nextjsFix: f.nextjsFix.trim().slice(0, 400),
    })),
  };
}
