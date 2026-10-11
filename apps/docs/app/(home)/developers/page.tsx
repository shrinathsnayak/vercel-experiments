import type { Metadata } from 'next';
import Link from 'next/link';
import {
  appName,
  docsRoute,
  githubUrl,
  openApiRoute,
  siteUrl,
} from '@/lib/shared';

export const metadata: Metadata = {
  title: 'Developer resources',
  description: `${appName} developer portal: public REST API, OpenAPI, MCP, and agent-facing Markdown.`,
};

const resources = [
  {
    title: 'Public REST API',
    href: `${siteUrl}/api/v1/experiments`,
    body: 'List and fetch published experiment metadata as JSON. Read-only, no auth required.',
  },
  {
    title: 'OpenAPI specification',
    href: openApiRoute,
    body: 'Machine-readable schema with operationIds, typed parameters, and JSON error models for function calling.',
  },
  {
    title: 'MCP server',
    href: `${siteUrl}/api/mcp`,
    body: 'Model Context Protocol endpoint for listing pages, fetching docs, and searching the catalog.',
  },
  {
    title: 'llms.txt',
    href: '/llms.txt',
    body: 'Agent entry file with when-to-use guidance and curated links to Markdown resources.',
  },
  {
    title: 'Markdown negotiation',
    href: '/',
    body: 'Send Accept: text/markdown to the homepage or docs URLs to receive text/markdown with Vary: Accept.',
  },
] as const;

export default function DevelopersPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        {appName} developer resources
      </h1>
      <div className="space-y-4 text-sm leading-relaxed text-fd-muted-foreground sm:text-base">
        <p>
          This page is the developer portal for {appName}: programmatic access to
          the experiment catalog, agent-readable files, and tooling that sits beside
          the HTML docs. Use it when integrating the catalog into scripts, IDEs, or
          AI agents instead of scraping the marketing site.
        </p>
        <p>
          The hub API exposes catalog metadata only. Individual experiment Route
          Handlers remain inside each standalone app under{' '}
          <code className="text-foreground">apps/experiments/&lt;slug&gt;/</code> on{' '}
          <Link
            href={githubUrl}
            className="underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </Link>
          . Start with the{' '}
          <Link href={docsRoute} className="underline underline-offset-4">
            documentation
          </Link>{' '}
          when you need human-oriented guides.
        </p>
      </div>
      <ul className="space-y-4">
        {resources.map((resource) => (
          <li key={resource.title} className="rounded-xl border px-4 py-4">
            <Link
              href={resource.href}
              className="font-medium text-foreground underline-offset-4 hover:underline"
              {...(resource.href.startsWith('http')
                ? { target: '_blank', rel: 'noreferrer' }
                : {})}
            >
              {resource.title}
            </Link>
            <p className="mt-2 text-sm text-fd-muted-foreground">{resource.body}</p>
          </li>
        ))}
      </ul>
      <pre className="overflow-x-auto rounded-xl border bg-fd-card/40 p-4 text-xs leading-relaxed">
        {`curl -sS '${siteUrl}/api/v1/experiments?q=webhook'
curl -sS -H 'Accept: text/markdown' '${siteUrl}/'
curl -sS '${siteUrl}${openApiRoute}'`}
      </pre>
    </div>
  );
}
