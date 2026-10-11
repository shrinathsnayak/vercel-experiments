export type RedirectRule = {
  id: string;
  source: string;
  destination: string;
  permanent: boolean;
};

export type RedirectMatch = {
  matched: boolean;
  rule?: RedirectRule;
  status?: 301 | 302 | 307 | 308;
  destination?: string;
};

function matchSource(pattern: string, pathname: string): boolean {
  if (pattern === pathname) return true;
  // simple :path* support like /blog/:path*
  if (pattern.includes(':path*')) {
    const prefix = pattern.split(':path*')[0] ?? '';
    return pathname === prefix.replace(/\/$/, '') || pathname.startsWith(prefix);
  }
  if (pattern.endsWith('/:path*')) {
    const prefix = pattern.slice(0, -'/:path*'.length);
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  }
  return false;
}

export function applyRedirects(rules: RedirectRule[], pathname: string): RedirectMatch {
  for (const rule of rules) {
    if (!rule.source || !rule.destination) continue;
    if (!matchSource(rule.source, pathname)) continue;
    let destination = rule.destination;
    if (rule.source.includes(':path*') && rule.destination.includes(':path*')) {
      const prefix = rule.source.split(':path*')[0] ?? '';
      const rest = pathname.slice(prefix.length);
      destination = rule.destination.replace(':path*', rest);
    }
    return {
      matched: true,
      rule,
      status: rule.permanent ? 308 : 307,
      destination,
    };
  }
  return { matched: false };
}

export function toVercelJson(rules: RedirectRule[]): string {
  return JSON.stringify(
    {
      redirects: rules.map(({ source, destination, permanent }) => ({
        source,
        destination,
        permanent,
      })),
    },
    null,
    2,
  );
}

export const defaultRedirects: RedirectRule[] = [
  {
    id: '1',
    source: '/docs',
    destination: '/docs/getting-started',
    permanent: false,
  },
  {
    id: '2',
    source: '/blog/:path*',
    destination: '/news/:path*',
    permanent: true,
  },
  {
    id: '3',
    source: '/old-pricing',
    destination: '/pricing',
    permanent: true,
  },
];

export function redirectsSnippet(): string {
  return `// vercel.json
{
  "redirects": [
    { "source": "/docs", "destination": "/docs/getting-started", "permanent": false }
  ]
}
// This lab also applies the same rules in a Route Handler for live tests.`;
}
