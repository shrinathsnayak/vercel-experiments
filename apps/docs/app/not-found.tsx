import Link from 'next/link';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { SiteBanner } from '@/components/site-banner';
import { SiteFooter } from '@/components/site-footer';
import { homeLayoutOptions } from '@/lib/layout.shared';

export default function NotFound() {
  return (
    <>
      <SiteBanner />
      <HomeLayout {...homeLayoutOptions}>
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-20 sm:px-6">
          <p className="text-sm font-medium text-fd-muted-foreground">404</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
          <p className="mt-3 max-w-lg text-sm text-fd-muted-foreground sm:text-base">
            That route does not exist, or the page was moved.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-md bg-fd-primary px-4 py-2.5 text-sm font-medium text-fd-primary-foreground"
            >
              Go home
            </Link>
            <Link
              href="/docs"
              className="rounded-md border border-fd-border px-4 py-2.5 text-sm font-medium"
            >
              Browse docs
            </Link>
          </div>
        </div>
        <SiteFooter />
      </HomeLayout>
    </>
  );
}
