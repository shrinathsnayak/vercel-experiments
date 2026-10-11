import type { ReactNode } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { SiteBanner } from '@/components/site-banner';
import { SiteFooter } from '@/components/site-footer';
import { homeLayoutOptions } from '@/lib/layout.shared';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteBanner />
      <HomeLayout {...homeLayoutOptions}>
        {children}
        <SiteFooter />
      </HomeLayout>
    </>
  );
}
