export type CspDirectives = {
  'default-src'?: string[];
  'script-src'?: string[];
  'style-src'?: string[];
  'img-src'?: string[];
  'connect-src'?: string[];
  'font-src'?: string[];
  'frame-src'?: string[];
};

export type SampleResource = {
  id: string;
  label: string;
  directive: keyof CspDirectives;
  source: string;
  kind: 'host' | 'inline' | 'data' | 'blob';
};

export type Violation = {
  resourceId: string;
  label: string;
  directive: string;
  reason: string;
};

export function buildCsp(directives: CspDirectives): string {
  const parts: string[] = [];
  const order: (keyof CspDirectives)[] = [
    'default-src',
    'script-src',
    'style-src',
    'img-src',
    'connect-src',
    'font-src',
    'frame-src',
  ];
  for (const key of order) {
    const values = directives[key];
    if (!values || values.length === 0) continue;
    parts.push(`${key} ${values.join(' ')}`);
  }
  return parts.join('; ');
}

function allowsSource(allowed: string[], resource: SampleResource): boolean {
  if (allowed.includes("'none'")) return false;
  if (allowed.includes('*')) return true;
  if (resource.kind === 'inline' && allowed.includes("'unsafe-inline'")) return true;
  if (resource.kind === 'inline' && allowed.includes("'strict-dynamic'")) return false;
  if (resource.source.startsWith('data:') && allowed.includes('data:')) return true;
  if (resource.source.startsWith('blob:') && allowed.includes('blob:')) return true;
  if (allowed.includes("'self'") && resource.source.startsWith('/')) return true;

  for (const entry of allowed) {
    if (entry === "'self'" || entry.startsWith("'")) continue;
    if (resource.source === entry) return true;
    if (entry.startsWith('https://') && resource.source.startsWith(entry)) return true;
  }
  return false;
}

function effectiveDirectiveValues(
  directives: CspDirectives,
  directive: keyof CspDirectives,
): string[] {
  const specific = directives[directive];
  if (specific && specific.length > 0) return specific;
  return directives['default-src'] ?? ["'none'"];
}

export function analyzeViolations(
  directives: CspDirectives,
  resources: SampleResource[],
): Violation[] {
  const violations: Violation[] = [];
  for (const resource of resources) {
    const allowed = effectiveDirectiveValues(directives, resource.directive);
    if (!allowsSource(allowed, resource)) {
      violations.push({
        resourceId: resource.id,
        label: resource.label,
        directive: resource.directive,
        reason: `Source "${resource.source}" is not permitted by ${resource.directive}.`,
      });
    }
  }
  return violations;
}

export const samplePageResources: SampleResource[] = [
  {
    id: 'app-js',
    label: 'App bundle',
    directive: 'script-src',
    source: 'https://cdn.example.com/app.js',
    kind: 'host',
  },
  {
    id: 'inline-script',
    label: 'Inline analytics snippet',
    directive: 'script-src',
    source: 'inline',
    kind: 'inline',
  },
  {
    id: 'hero-img',
    label: 'Hero image',
    directive: 'img-src',
    source: 'https://images.example.com/hero.webp',
    kind: 'host',
  },
  {
    id: 'api',
    label: 'API fetch',
    directive: 'connect-src',
    source: 'https://api.example.com/v1/metrics',
    kind: 'host',
  },
  {
    id: 'font',
    label: 'Web font',
    directive: 'font-src',
    source: 'https://fonts.example.com/kern.woff2',
    kind: 'host',
  },
];

export const defaultCspDirectives: CspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:'],
  'connect-src': ["'self'"],
  'font-src': ["'self'"],
  'frame-src': ["'none'"],
};
