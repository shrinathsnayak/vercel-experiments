import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Brain,
  FlaskConical,
  GitBranch,
  Globe,
  Layers,
  Lock,
  Route,
  Gauge,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { BrandMark } from '@/components/brand-mark';
import { ExperimentCard } from '@/components/experiment-card';
import { HeroBackdrop } from '@/components/hero-backdrop';
import { HomeSearchTrigger } from '@/components/home-search-trigger';
import { GitHubIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  categoryAccents,
  categoryLabels,
  getFeaturedExperiments,
  getPublishedExperiments,
  getRecentExperiments,
  type ExperimentCategory,
} from '@/lib/experiments';
import { buildHomepageJsonLd } from '@/lib/seo/json-ld';
import {
  appDescription,
  appName,
  changelogRoute,
  githubUrl,
} from '@/lib/shared';
import { platformDeployUrl } from '@/lib/vercel/deploy';
import { cn } from '@/lib/utils';

const categoryIcons: Record<ExperimentCategory, LucideIcon> = {
  ai: Brain,
  performance: Gauge,
  networking: Globe,
  security: Lock,
  rendering: Layers,
  routing: Route,
  platform: FlaskConical,
  'developer-tools': Wrench,
};

export default function HomePage() {
  const published = getPublishedExperiments();
  const featured = getFeaturedExperiments(4);
  const recent = getRecentExperiments(4);
  const heroPreview = featured.slice(0, 3);
  const categories = [
    ...new Set(published.map((experiment) => experiment.category)),
  ] as ExperimentCategory[];
  const categoryCounts = categories.map((category) => {
    const inCategory = published.filter(
      (experiment) => experiment.category === category,
    );
    return {
      category,
      count: inCategory.length,
      href: inCategory[0]?.documentationPath ?? '/docs',
    };
  });

  const jsonLd = buildHomepageJsonLd(published.length);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="relative overflow-hidden rounded-2xl border px-6 py-10 sm:px-10 sm:py-12">
        <HeroBackdrop />
        <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-5">
            <Link
              href={changelogRoute}
              className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-3 py-1 text-xs font-medium transition-colors hover:border-brand/60"
            >
              <span className="font-semibold text-brand">
                {published.length} experiments
              </span>
              <span className="h-3 w-px bg-border" aria-hidden />
              <span>See what&apos;s new</span>
              <ArrowRight className="size-3" />
            </Link>
            <div className="space-y-3">
              <h1>
                <BrandMark
                  size={40}
                  variant="badge"
                  className="gap-3"
                  withLogo={false}
                  labelClassName="text-4xl font-semibold tracking-tight sm:text-5xl"
                />
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {appDescription}
              </p>
            </div>
            <dl className="grid max-w-md grid-cols-3 gap-3">
              <div className="rounded-xl border border-brand/15 bg-background/60 px-3 py-2.5 backdrop-blur">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Experiments
                </dt>
                <dd className="mt-0.5 text-xl font-semibold tabular-nums text-brand">
                  {published.length}
                </dd>
              </div>
              <div className="rounded-xl border border-brand/15 bg-background/60 px-3 py-2.5 backdrop-blur">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Categories
                </dt>
                <dd className="mt-0.5 text-xl font-semibold tabular-nums">
                  {categories.length}
                </dd>
              </div>
              <div className="rounded-xl border border-brand/15 bg-background/60 px-3 py-2.5 backdrop-blur">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  License
                </dt>
                <dd className="mt-0.5 text-xl font-semibold">MIT</dd>
              </div>
            </dl>
            <HomeSearchTrigger />
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-brand text-white shadow-sm shadow-brand/30 hover:bg-brand/90 hover:text-white"
              >
                <Link href={featured[0]?.documentationPath ?? '/docs'}>
                  Browse experiments
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={platformDeployUrl} target="_blank" rel="noreferrer">
                  Deploy on Vercel
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={githubUrl} target="_blank" rel="noreferrer">
                  <GitHubIcon className="size-4" />
                  Contribute on GitHub
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative mt-2 lg:mt-0">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
              Deploy and explore
            </p>
            <ul className="relative space-y-3">
              {heroPreview.map((experiment, index) => (
                <li key={experiment.slug}>
                  <Link
                    href={experiment.documentationPath}
                    className={cn(
                      'block rounded-xl border bg-background/80 p-4 shadow-sm backdrop-blur transition-colors hover:border-brand/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                      index === 1 && 'translate-x-3',
                      index === 2 && 'translate-x-6',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1.5">
                        <span
                          className={cn(
                            'inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide',
                            categoryAccents[experiment.category],
                          )}
                        >
                          {categoryLabels[experiment.category]}
                        </span>
                        <p className="truncate text-sm font-medium hover:text-brand">
                          {experiment.title}
                        </p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {experiment.description}
                        </p>
                      </div>
                      <ArrowUpRight
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
              Start here
            </p>
            <h2 className="text-xl font-semibold tracking-tight">Featured experiments</h2>
            <p className="text-sm text-muted-foreground">
              Standalone apps you deploy or run locally to learn real platform patterns.
            </p>
          </div>
          <Button asChild variant="link" className="px-0 text-brand">
            <Link href="/docs/getting-started">
              View all
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {featured.map((experiment) => (
            <ExperimentCard key={experiment.slug} experiment={experiment} />
          ))}
        </div>
      </section>

      <section className="mt-14 space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
              Fresh drops
            </p>
            <h2 className="text-xl font-semibold tracking-tight">Recently added</h2>
            <p className="text-sm text-muted-foreground">
              Newest published experiments from the full catalog.
            </p>
          </div>
          <Button asChild variant="link" className="px-0 text-brand">
            <Link href="/docs/getting-started">
              Browse docs
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {recent.map((experiment) => (
            <ExperimentCard key={experiment.slug} experiment={experiment} />
          ))}
        </div>
      </section>

      <section className="mt-14 space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
            Browse
          </p>
          <h2 className="text-xl font-semibold tracking-tight">By category</h2>
          <p className="text-sm text-muted-foreground">
            Jump into networking, rendering, AI, security, and more.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categoryCounts.map(({ category, count, href }) => {
            const Icon = categoryIcons[category];
            return (
              <Link
                key={category}
                href={href}
                className="group rounded-xl border bg-card px-4 py-4 transition-colors hover:border-brand/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-lg',
                      categoryAccents[category],
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium tracking-tight group-hover:text-brand">
                      {categoryLabels[category]}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {count === 1 ? '1 experiment' : `${count} experiments`}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
                    aria-hidden
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-14 rounded-2xl border border-brand/30 bg-brand/5 p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
              Contribute
            </p>
            <h2 className="text-xl font-semibold tracking-tight">Build the next experiment</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Each experiment ships as a standalone app with docs and a clear pattern you can
              reuse. Fork the repo, follow the contribution guide, and add something useful.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                asChild
                className="bg-brand text-white shadow-sm shadow-brand/30 hover:bg-brand/90 hover:text-white"
              >
                <Link href="/contribute">
                  Contribution guide
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/docs">
                  <BookOpen className="size-4" />
                  Read the docs
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={githubUrl} target="_blank" rel="noreferrer">
                  <GitBranch className="size-4" />
                  Open on GitHub
                </Link>
              </Button>
            </div>
          </div>
          <div className="rounded-xl border bg-background/70 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">What makes a good experiment</p>
            <ul className="mt-3 space-y-2">
              <li>Teaches one concrete platform pattern</li>
              <li>Includes an interactive demo</li>
              <li>Documents setup, limits, and tradeoffs</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
