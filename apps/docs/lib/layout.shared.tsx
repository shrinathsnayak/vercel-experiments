import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { Globe } from 'lucide-react';
import { BrandMark } from '@/components/brand-mark';
import { BuyMeACoffeeLink } from '@/components/buy-me-a-coffee-link';
import {
  changelogRoute,
  docsRoute,
  getBuyMeACoffeeUrl,
  githubUrl,
  homeRoute,
  portfolioUrl,
} from './shared';

const nav = {
  title: <BrandMark size={28} variant="badge" />,
  url: homeRoute,
};

const portfolioLink = {
  type: 'icon' as const,
  url: portfolioUrl,
  label: 'Portfolio',
  text: 'Portfolio',
  icon: <Globe />,
  external: true,
};

const buyMeACoffeeLinks = getBuyMeACoffeeUrl()
  ? [
    {
      type: 'custom' as const,
      children: <BuyMeACoffeeLink />,
    },
  ]
  : [];

const sharedLayout: Pick<
  BaseLayoutProps,
  'githubUrl' | 'themeSwitch' | 'searchToggle'
> = {
  githubUrl,
  themeSwitch: {
    enabled: true,
    mode: 'light-dark-system',
  },
  searchToggle: {
    enabled: true,
  },
};

/** Docs notebook layout ( /docs/* ) - links + search stay in the top bar. */
export const docsLayoutOptions = {
  ...sharedLayout,
  nav: {
    ...nav,
    // `auto` puts the logo + collapse control in the sidebar; links stay in the top bar.
    mode: 'auto' as const,
  },
  links: [...buyMeACoffeeLinks, portfolioLink],
};

/** Marketing homepage layout ( / ) */
export const homeLayoutOptions: BaseLayoutProps = {
  ...sharedLayout,
  nav,
  links: [
    {
      type: 'main',
      text: 'Documentation',
      url: docsRoute,
      active: 'nested-url',
    },
    {
      type: 'main',
      text: "What's New",
      url: changelogRoute,
      active: 'url',
    },
    ...buyMeACoffeeLinks,
    portfolioLink,
  ],
};
