import {
  aboutRoute,
  appDescription,
  appName,
  contactRoute,
  contributeRoute,
  developersRoute,
  docsRoute,
  githubUrl,
  openApiRoute,
  privacyRoute,
  siteUrl,
} from '@/lib/shared';

/**
 * Build a root `/llms.txt` with when-to-use guidance plus curated file lists.
 * Follows https://llmstxt.org/ (H1, blockquote, free-form notes, then H2 lists).
 */
export function buildLlmsTxtIndex(docsIndex: string): string {
  const whenToUse = `## When to use this

Reach for ${appName} when an agent or developer needs a concrete, deployable Next.js / Vercel lab rather than abstract docs:

- Implementing Edge Middleware, ISR, Blob, Redis, Neon, Cron, Queues, Workflows, Flags, webhooks, or AI SDK patterns on Vercel
- Looking up an experiment by slug, category, or tag via the public REST API / OpenAPI spec
- Preferring Markdown (\`Accept: text/markdown\`) or MCP tools over scraping HTML
- Scaffolding a new experiment that matches the catalog conventions

Do **not** treat this catalog as an official Vercel product API. Experiment Route Handlers live in each experiment app; the hub API only exposes catalog metadata.`;

  const curated = `## Developer resources

- [Developer portal](${siteUrl}${developersRoute}): API, OpenAPI, MCP, and agent entry points for ${appName}
- [OpenAPI specification](${siteUrl}${openApiRoute}): machine-readable REST catalog schema
- [List experiments API](${siteUrl}/api/v1/experiments): public JSON catalog
- [MCP server](${siteUrl}/api/mcp): list_pages, get_page, and search tools
- [Full docs export](${siteUrl}/llms-full.txt): concatenated Markdown documentation

## Trust and project pages

- [About](${siteUrl}${aboutRoute}): project identity and affiliation disclaimer
- [Contact](${siteUrl}${contactRoute}): how to reach maintainers
- [Privacy](${siteUrl}${privacyRoute}): data practices for demos and analytics
- [Contribute](${siteUrl}${contributeRoute}): how to add experiments
- [GitHub repository](${githubUrl}): source monorepo

## Optional

- [Sitemap](${siteUrl}/sitemap.xml)
- [Documentation home](${siteUrl}${docsRoute})
`;

  // docsIndex already starts with "# Documentation" from Fumadocs; keep it as a section.
  const docsSection = docsIndex.replace(/^#\s+/, '## Docs: ');

  return `# ${appName}

> ${appDescription}

${appName} publishes deployable Next.js and Vercel platform experiments with docs, tests, and one-click Deploy buttons. Markdown negotiation is available on the homepage and docs (\`Accept: text/markdown\`).

${whenToUse}

${curated}

${docsSection}
`;
}
