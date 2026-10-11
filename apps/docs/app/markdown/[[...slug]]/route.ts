import {
  buildNotFoundMarkdown,
  getMarketingMarkdown,
  normalizeMarketingPath,
} from '@/lib/agent/markdown-pages';
import { markdownResponseHeaders } from '@/lib/agent/vary';

export const revalidate = false;

function pathnameFromSlug(slug?: string[]): string {
  if (!slug || slug.length === 0) return '/';
  return `/${slug.join('/')}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await params;
  const pathname = normalizeMarketingPath(pathnameFromSlug(slug));
  const body = getMarketingMarkdown(pathname);

  if (!body) {
    return new Response(buildNotFoundMarkdown(pathname), {
      status: 404,
      headers: markdownResponseHeaders,
    });
  }

  return new Response(body, {
    status: 200,
    headers: markdownResponseHeaders,
  });
}
