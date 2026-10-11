import { Analytics } from '@vercel/analytics/next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import { defaultOgImagePath } from '@/lib/brand-assets';
import {
  aboutRoute,
  appDescription,
  appName,
  changelogRoute,
  contributeRoute,
  docsRoute,
  homeRoute,
  siteUrl,
} from '@/lib/shared';
import { cn } from '@/lib/utils';
import './global.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: appName,
    template: `%s · ${appName}`,
  },
  description: appDescription,
  applicationName: appName,
  authors: [{ name: appName, url: siteUrl }],
  creator: appName,
  publisher: appName,
  keywords: [
    'Next.js',
    'Vercel',
    'experiments',
    'playground',
    'open source',
    'Edge Middleware',
    'AI SDK',
  ],
  openGraph: {
    title: appName,
    description: appDescription,
    siteName: appName,
    type: 'website',
    url: siteUrl,
    locale: 'en_US',
    images: [{ url: defaultOgImagePath }],
  },
  twitter: {
    card: 'summary_large_image',
    title: appName,
    description: appDescription,
    images: [defaultOgImagePath],
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={cn(geist.variable, mono.variable, 'font-sans')}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <RootProvider
          search={{
            links: [
              ['Home', homeRoute],
              ['Documentation', docsRoute],
              ['About', aboutRoute],
              ['Contribute', contributeRoute],
              ["What's New", changelogRoute],
            ],
          }}
        >
          {children}
          <Analytics />
        </RootProvider>
      </body>
    </html>
  );
}
