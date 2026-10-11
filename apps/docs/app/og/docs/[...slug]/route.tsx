import { source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { generateOGImage } from 'fumadocs-ui/og';
import { getLogoDataUrl } from '@/lib/brand-assets';
import { getExperimentForDocsPage } from '@/lib/docs/seo';
import { appName, getPageImageUrl } from '@/lib/shared';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/og/docs/[...slug]'>) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  const experiment = getExperimentForDocsPage(page);
  const logoSrc = await getLogoDataUrl();

  return generateOGImage({
    title: experiment?.title ?? page.data.title,
    description: experiment?.description ?? page.data.description,
    site: appName,
    primaryColor: 'rgba(0,112,243,0.45)',
    primaryTextColor: 'rgb(0,112,243)',
    icon: <img src={logoSrc} width={56} height={56} alt="" />,
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImageUrl(page).segments,
  }));
}
