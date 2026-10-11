import { notFound } from 'next/navigation';
import { createOgImage } from '@/lib/og/image';
import { getExperimentForDocsPage } from '@/lib/docs/seo';
import { getPageImageUrl } from '@/lib/shared';
import { source } from '@/lib/source';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/og/docs/[...slug]'>,
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  const experiment = getExperimentForDocsPage(page);

  return createOgImage({
    title: experiment?.title ?? page.data.title,
    description: experiment?.description ?? page.data.description,
    category: experiment?.category,
    difficulty: experiment?.difficulty,
    eyebrow: experiment
      ? 'Experiment · Docs'
      : 'Documentation',
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImageUrl(page).segments,
  }));
}
