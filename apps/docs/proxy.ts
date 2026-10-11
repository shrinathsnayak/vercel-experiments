import { NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { appendVaryAccept } from '@/lib/agent/vary';
import {
  docsContentRoute,
  docsRoute,
  markdownInternalRoute,
} from '@/lib/shared';

const { rewrite: rewriteDocs } = rewritePath(
  `${docsRoute}{/*path}`,
  `${docsContentRoute}{/*path}/content.md`,
);
const { rewrite: rewriteSuffix } = rewritePath(
  `${docsRoute}{/*path}.md`,
  `${docsContentRoute}{/*path}/content.md`,
);

function withVaryAccept(response: NextResponse): NextResponse {
  // Prefer append so framework-added Vary tokens (RSC, Accept-Encoding) are kept
  // alongside Accept for content negotiation.
  const existing = response.headers.get('Vary');
  if (!existing) {
    response.headers.set('Vary', 'Accept');
  } else if (
    !existing
      .split(',')
      .map((token) => token.trim().toLowerCase())
      .includes('accept')
  ) {
    response.headers.append('Vary', 'Accept');
  } else {
    appendVaryAccept(response.headers);
  }
  return response;
}

function isSkippedPath(pathname: string): boolean {
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/llms.mdx') ||
    pathname.startsWith(markdownInternalRoute) ||
    pathname === '/openapi.json' ||
    pathname === '/llms.txt' ||
    pathname === '/llms-full.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/favicon.ico'
  ) {
    return true;
  }

  // Static public assets (images, fonts, etc.)
  return /\.[a-z0-9]+$/i.test(pathname) && !pathname.endsWith('.md');
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isSkippedPath(pathname)) {
    return NextResponse.next();
  }

  const suffixResult = rewriteSuffix(pathname);
  if (suffixResult) {
    return withVaryAccept(
      NextResponse.rewrite(new URL(suffixResult, request.nextUrl)),
    );
  }

  if (isMarkdownPreferred(request)) {
    if (pathname === docsRoute || pathname.startsWith(`${docsRoute}/`)) {
      const docsResult = rewriteDocs(pathname);
      if (docsResult) {
        return withVaryAccept(
          NextResponse.rewrite(new URL(docsResult, request.nextUrl)),
        );
      }
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname =
      pathname === '/'
        ? markdownInternalRoute
        : `${markdownInternalRoute}${pathname}`;
    return withVaryAccept(NextResponse.rewrite(rewriteUrl));
  }

  // Note: Next.js App Router currently overwrites middleware `Vary` on HTML
  // documents (keeps RSC tokens only). Markdown rewrites keep Accept because
  // the route handler sets it. Production also sets Vary via vercel.json.
  return withVaryAccept(
    NextResponse.next({
      headers: {
        Vary: 'Accept',
      },
    }),
  );
}

/** Negotiate Markdown sitewide; skip APIs, internals, and static assets. */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
