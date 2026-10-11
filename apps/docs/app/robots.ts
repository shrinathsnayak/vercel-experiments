import type { MetadataRoute } from 'next';
import { buildRobotsConfig } from '@/lib/seo/site-index';
import { siteUrl } from '@/lib/shared';

export default function robots(): MetadataRoute.Robots {
  return buildRobotsConfig(siteUrl);
}
