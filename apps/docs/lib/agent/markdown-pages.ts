import {
  aboutRoute,
  appDescription,
  appName,
  contactRoute,
  contributeRoute,
  developersRoute,
  docsRoute,
  githubIssuesUrl,
  githubUrl,
  homeRoute,
  openApiRoute,
  privacyRoute,
  siteUrl,
} from '@/lib/shared';
import { getPublishedExperiments } from '@/lib/experiments';

const discoveryLinks = [
  `- [Documentation](${siteUrl}${docsRoute})`,
  `- [llms.txt](${siteUrl}/llms.txt)`,
  `- [OpenAPI](${siteUrl}${openApiRoute})`,
  `- [Sitemap](${siteUrl}/sitemap.xml)`,
].join('\n');

export function buildNotFoundMarkdown(pathname: string): string {
  return `# Page not found

The path \`${pathname}\` does not exist on ${appName}.

Use one of these entry points:

${discoveryLinks}

If you followed a stale link, start from the [homepage](${siteUrl}/) or search the docs catalog.
`;
}

export function buildHomeMarkdown(): string {
  const published = getPublishedExperiments();
  const featured = published
    .filter((experiment) => experiment.featured)
    .slice(0, 6)
    .map(
      (experiment) =>
        `- [${experiment.title}](${siteUrl}${experiment.documentationPath}): ${experiment.description}`,
    )
    .join('\n');

  return `# ${appName}

> ${appDescription}

${appName} is an independent open-source catalog of deployable Next.js and Vercel platform experiments. Each experiment is a standalone app with docs, tests, and a one-click Deploy button. Use it when you need a concrete reference implementation for Edge Middleware, ISR, Blob, Redis, Neon, Cron, Queues, Workflows, Flags, AI SDK patterns, or related developer tools.

## When to use this

- You are building with Next.js App Router and want a working lab for a specific Vercel platform feature.
- You need copy-paste Route Handler or UI patterns with honest setup and failure modes.
- An agent should discover experiments, OpenAPI, MCP tools, or Markdown docs before inventing APIs.

## Catalog

There are **${published.length}** published experiments (MIT licensed).

### Featured

${featured || '- See the docs catalog for published labs.'}

## Developer resources

- [Developer portal](${siteUrl}${developersRoute}): API, OpenAPI, MCP, and agent files
- [REST API](${siteUrl}/api/v1/experiments): public experiment catalog
- [OpenAPI specification](${siteUrl}${openApiRoute})
- [MCP server](${siteUrl}/api/mcp)
- [Full docs for LLMs](${siteUrl}/llms-full.txt)
- [GitHub repository](${githubUrl})

## Site pages

- [About](${siteUrl}${aboutRoute})
- [Contact](${siteUrl}${contactRoute})
- [Contribute](${siteUrl}${contributeRoute})
- [Privacy](${siteUrl}${privacyRoute})
- [Documentation](${siteUrl}${docsRoute})
`;
}

export function buildAboutMarkdown(): string {
  return `# About ${appName}

${appName} is an independent open-source project for developers who want to explore modern Next.js patterns and Vercel platform capabilities through small, useful, interactive experiments.

It is inspired by the idea behind Cloudflare Experiments, but focused on the Vercel and Next.js ecosystem. This project is not affiliated with, endorsed by, or sponsored by Vercel.

Every published experiment should teach something concrete: a working demo, a visual explanation, a developer utility, a reusable pattern, or a reproducible comparison.

Source code and contribution docs live on [GitHub](${githubUrl}).
`;
}

export function buildContactMarkdown(): string {
  return `# Contact ${appName}

Use these channels to reach the maintainers of ${appName}:

- Open a [GitHub issue](${githubIssuesUrl}) for questions, bugs, and experiment proposals.
- Prefer private reports for security vulnerabilities (see SECURITY.md in the repository).
- Portfolio and maintainer context: https://snayak.dev

The project does not offer paid support. Community help happens in GitHub issues and pull requests.
`;
}

export function buildContributeMarkdown(): string {
  return `# Contribute to ${appName}

Contributions are welcome. The fastest path is to add a focused experiment with a working demo, validated registry metadata, documentation, and tests.

1. Read the [adding an experiment](${siteUrl}${docsRoute}/adding-an-experiment) guide.
2. Follow [experiment conventions](${siteUrl}${docsRoute}/experiment-conventions).
3. Open a pull request on [GitHub](${githubUrl}).
`;
}

export function buildPrivacyMarkdown(): string {
  return `# Privacy Policy

${appName} is an educational open-source site. We aim to collect as little data as possible.

Stateful demos such as the Webhook Playground may temporarily store request metadata and payloads in memory for short-lived sessions. Those sessions expire automatically and are not intended as durable storage.

Do not send production secrets, personal data, or credentials into public demos. Sensitive headers are redacted when possible, but you remain responsible for what you submit.

If analytics or speed insights are enabled in a deployment, they are used only to understand aggregate performance and traffic.
`;
}

export function buildDevelopersMarkdown(): string {
  return `# ${appName} developer resources

Programmatic and agent-facing surfaces for the ${appName} catalog.

## REST API

- \`GET ${siteUrl}/api/v1/experiments\` — list published experiments
- \`GET ${siteUrl}/api/v1/experiments/{slug}\` — fetch one experiment
- OpenAPI: [${openApiRoute}](${siteUrl}${openApiRoute})

## Agents

- [llms.txt](${siteUrl}/llms.txt)
- [llms-full.txt](${siteUrl}/llms-full.txt)
- Markdown negotiation: send \`Accept: text/markdown\` to HTML pages
- MCP: \`POST ${siteUrl}/api/mcp\`
`;
}

const marketingMarkdown: Record<string, () => string> = {
  [homeRoute]: buildHomeMarkdown,
  [aboutRoute]: buildAboutMarkdown,
  [contactRoute]: buildContactMarkdown,
  [contributeRoute]: buildContributeMarkdown,
  [privacyRoute]: buildPrivacyMarkdown,
  [developersRoute]: buildDevelopersMarkdown,
};

/** Normalize a request pathname for marketing markdown lookup. */
export function normalizeMarketingPath(pathname: string): string {
  if (pathname === '' || pathname === '/') return homeRoute;
  const trimmed = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return trimmed || homeRoute;
}

export function getMarketingMarkdown(pathname: string): string | null {
  const path = normalizeMarketingPath(pathname);
  const builder = marketingMarkdown[path];
  return builder ? builder() : null;
}
