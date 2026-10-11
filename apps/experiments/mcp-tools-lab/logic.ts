export type CatalogExperiment = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  phase: number;
};

/** Minimal registry snapshot for the standalone MCP experiment. */
export const CATALOG: CatalogExperiment[] = [
  {
    slug: 'geolocation-lab',
    title: 'Geolocation Lab',
    description: 'Read Vercel geo headers and demo Intl localization.',
    category: 'platform',
    tags: ['geo', 'edge', 'intl'],
    phase: 5,
  },
  {
    slug: 'bot-protection-lab',
    title: 'Bot Protection Lab',
    description: 'Challenge and rate-limit gate before expensive routes.',
    category: 'security',
    tags: ['bots', 'rate-limit'],
    phase: 5,
  },
  {
    slug: 'maintenance-canary-lab',
    title: 'Maintenance / Canary Lab',
    description: 'Kill switch and percentage canary via proxy.',
    category: 'routing',
    tags: ['canary', 'maintenance'],
    phase: 5,
  },
  {
    slug: 'ab-testing-lab',
    title: 'A/B Testing Lab',
    description: 'Cookie A/B assignment with conversion tracking.',
    category: 'routing',
    tags: ['ab-testing', 'cookies'],
    phase: 5,
  },
  {
    slug: 'websockets-lab',
    title: 'WebSockets Lab',
    description: 'Realtime constraints with SSE playground.',
    category: 'networking',
    tags: ['sse', 'websockets'],
    phase: 5,
  },
  {
    slug: 'cdn-redirects-lab',
    title: 'CDN Redirects Lab',
    description: 'Editable redirects with vercel.json export.',
    category: 'routing',
    tags: ['redirects', 'cdn'],
    phase: 5,
  },
  {
    slug: 'edge-auth-lab',
    title: 'Edge Auth Lab',
    description: 'Short-lived JWT issue/verify with jose.',
    category: 'security',
    tags: ['jwt', 'jose'],
    phase: 5,
  },
  {
    slug: 'microfrontends-zones-lab',
    title: 'Microfrontends Zones Lab',
    description: 'Shell and zone child contract demo.',
    category: 'routing',
    tags: ['microfrontends', 'zones'],
    phase: 5,
  },
  {
    slug: 'mcp-tools-lab',
    title: 'MCP Tools Lab',
    description: 'MCP tools over the experiment catalog.',
    category: 'developer-tools',
    tags: ['mcp', 'tools'],
    phase: 5,
  },
  {
    slug: 'draft-mode-cms-lab',
    title: 'Draft Mode CMS Lab',
    description: 'Markdown drafts with Next.js Draft Mode.',
    category: 'rendering',
    tags: ['draft-mode', 'cms'],
    phase: 5,
  },
];

export function searchCatalog(
  query: string,
  catalog: CatalogExperiment[] = CATALOG,
): CatalogExperiment[] {
  const q = query.trim().toLowerCase();
  if (!q) return catalog;
  return catalog.filter((item) => {
    const hay = [item.slug, item.title, item.description, item.category, ...item.tags]
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}

export function getBySlug(slug: string, catalog: CatalogExperiment[] = CATALOG) {
  return catalog.find((item) => item.slug === slug) ?? null;
}

export function mcpSnippet(): string {
  return `// MCP tools: search_experiments, get_experiment
// Standalone lab mirrors the hub apps/docs/app/api/mcp pattern
// against a copied registry snapshot.`;
}
