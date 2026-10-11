import type { Metadata } from 'next';
import Link from 'next/link';
import { appName, developersRoute, githubUrl } from '@/lib/shared';

export const metadata: Metadata = {
  title: 'About',
  description: `About ${appName}, an independent community playground for Next.js and Vercel developer tools.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">About {appName}</h1>
      <div className="space-y-4 text-sm leading-relaxed text-fd-muted-foreground sm:text-base">
        <p>
          {appName} is an independent open-source project for developers who want to
          explore modern Next.js patterns and Vercel platform capabilities through
          small, useful, interactive experiments. It is a catalog of developer tools
          you can deploy or run locally, not a hosted SaaS product.
        </p>
        <p>
          It is inspired by the idea behind Cloudflare Experiments, but focused on
          the Vercel and Next.js ecosystem. This project is not affiliated with,
          endorsed by, or sponsored by Vercel, Inc. Branding and naming refer to the
          platform the labs target, not to an official Vercel property.
        </p>
        <p>
          Every published experiment should teach something concrete: a working demo,
          a visual explanation, a developer utility, a reusable pattern, or a
          reproducible comparison. Labs prefer honest failure modes when Redis, Blob,
          Neon, or AI keys are missing, so you can evaluate the pattern before you
          provision infrastructure.
        </p>
        <p>
          Agents and integrators can use the{' '}
          <Link href={developersRoute} className="underline underline-offset-4">
            developer portal
          </Link>
          , public REST API, OpenAPI specification, MCP server, and Markdown
          negotiation without scraping the HTML UI. Source code and contribution docs
          live on{' '}
          <Link href={githubUrl} className="underline underline-offset-4" target="_blank" rel="noreferrer">
            GitHub
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
