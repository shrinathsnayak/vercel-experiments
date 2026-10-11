import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';
import {
  aboutRoute,
  appName,
  changelogRoute,
  contributeRoute,
  docsRoute,
  githubUrl,
  homeRoute,
  portfolioUrl,
  privacyRoute,
} from '@/lib/shared';

const footerColumns = [
  {
    title: 'Explore',
    links: [
      { label: 'Documentation', href: docsRoute },
      { label: 'Getting started', href: `${docsRoute}/getting-started` },
      { label: "What's New", href: changelogRoute },
    ],
  },
  {
    title: 'Docs',
    links: [
      { label: 'Introduction', href: docsRoute },
      { label: 'Local development', href: `${docsRoute}/local-development` },
      { label: 'Adding an experiment', href: `${docsRoute}/adding-an-experiment` },
      { label: 'Contributing', href: `${docsRoute}/contributing` },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'About', href: aboutRoute },
      { label: 'Contribute', href: contributeRoute },
      { label: 'Privacy', href: privacyRoute },
      { label: 'GitHub', href: githubUrl, external: true },
      {
        label: 'License (MIT)',
        href: `${githubUrl}/blob/main/LICENSE`,
        external: true,
      },
      { label: 'Portfolio', href: portfolioUrl, external: true },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-fd-card/30">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))] md:gap-8">
        <div className="max-w-sm">
          <Link
            href={homeRoute}
            className="inline-flex text-foreground transition-opacity hover:opacity-80"
          >
            <BrandMark size={28} variant="badge" />
          </Link>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Deployable Next.js and Vercel product experiments - reference
            implementations across Edge Middleware, ISR, Blob, AI SDK, and more.
            Clone, run, and ship.
          </p>
          <p className="mt-3 text-xs text-muted-foreground/80">
            Not affiliated with or endorsed by Vercel, Inc.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {column.title}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  {'external' in link && link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-muted-foreground transition-colors hover:text-brand"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            {appName}. MIT licensed.
          </p>
          <p>
            Built with{' '}
            <a
              href="https://fumadocs.dev"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-2 hover:text-brand hover:underline"
            >
              Fumadocs
            </a>{' '}
            for Next.js and Vercel platform patterns.
          </p>
        </div>
      </div>
    </footer>
  );
}
