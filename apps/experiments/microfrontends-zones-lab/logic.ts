export type ZoneContract = {
  name: string;
  basePath: string;
  origin: string;
  allowsEmbedding: boolean;
  sharedNav: boolean;
};

export type ShellRoute = {
  path: string;
  zone: string;
  description: string;
};

export const defaultZones: ZoneContract[] = [
  {
    name: 'marketing',
    basePath: '/',
    origin: 'https://marketing.example.com',
    allowsEmbedding: false,
    sharedNav: true,
  },
  {
    name: 'docs',
    basePath: '/docs',
    origin: 'https://docs.example.com',
    allowsEmbedding: true,
    sharedNav: true,
  },
  {
    name: 'app',
    basePath: '/app',
    origin: 'https://app.example.com',
    allowsEmbedding: true,
    sharedNav: false,
  },
];

export const defaultRoutes: ShellRoute[] = [
  { path: '/', zone: 'marketing', description: 'Marketing zone (shell-owned)' },
  { path: '/docs', zone: 'docs', description: 'Docs microfrontend / zone' },
  { path: '/app', zone: 'app', description: 'Authenticated app zone' },
];

export function resolveZone(path: string, routes: ShellRoute[] = defaultRoutes): ShellRoute {
  const sorted = [...routes].sort((a, b) => b.path.length - a.path.length);
  return sorted.find((r) => path === r.path || path.startsWith(`${r.path}/`) || (r.path === '/' && path === '/'))
    ?? routes[0]!;
}

export function zoneRewrites(zones: ZoneContract[]): Array<{ source: string; destination: string }> {
  return zones
    .filter((z) => z.basePath !== '/')
    .map((z) => ({
      source: `${z.basePath}/:path*`,
      destination: `${z.origin}${z.basePath}/:path*`,
    }));
}

export function microfrontendsSnippet(): string {
  return `// Conceptual Vercel zones / microfrontends
// Shell owns navigation; child zones mount under basePath
// Rewrites send /docs/:path* → docs.origin/docs/:path*
// This lab demos the contract with an iframe child (educational).`;
}
