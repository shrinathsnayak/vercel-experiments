import { buildNotFoundMarkdown } from '@/lib/agent/markdown-pages';
import { markdownResponseHeaders } from '@/lib/agent/vary';
import { docsLlms, source } from '@/lib/source';
import { docsRoute, getPageMarkdownUrl } from '@/lib/shared';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/llms.mdx/docs/[[...slug]]'>) {
  const { slug } = await params;
  // remove the appended "content.md"; `/docs/index.md` is rewritten to the root page
  const slugs = slug?.slice(0, -1) ?? [];
  if (slugs.at(-1) === 'index') slugs.pop();
  const page = source.getPage(slugs);
  if (!page) {
    const pathname =
      slugs.length === 0 ? docsRoute : `${docsRoute}/${slugs.join('/')}`;
    return new Response(buildNotFoundMarkdown(pathname), {
      status: 404,
      headers: markdownResponseHeaders,
    });
  }

  return new Response(await docsLlms.page(page), {
    headers: markdownResponseHeaders,
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageMarkdownUrl(page).segments,
  }));
}
