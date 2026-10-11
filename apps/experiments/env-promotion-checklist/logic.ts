export type EnvMap = Record<string, string>;

export type ChecklistRow = {
  key: string;
  inPreview: boolean;
  inProduction: boolean;
  previewValue: string;
  productionValue: string;
  status: 'ok' | 'missing-preview' | 'missing-production' | 'value-differs';
};

const VALID_KEY = /^[A-Z][A-Z0-9_]*$/;

export function parseEnv(content: string): EnvMap {
  const out: EnvMap = {};
  for (const raw of content.split(/\r?\n/)) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!VALID_KEY.test(key)) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

export function redactValue(value: string): string {
  if (!value) return '';
  if (value.length <= 4) return '••••';
  return `${value.slice(0, 2)}…${value.slice(-2)} (${value.length} chars)`;
}

export function compareEnvChecklists(
  previewRaw: string,
  productionRaw: string,
  requiredKeys: string[],
): ChecklistRow[] {
  const preview = parseEnv(previewRaw);
  const production = parseEnv(productionRaw);
  const keys = [...new Set([...requiredKeys.map((k) => k.trim()).filter(Boolean), ...Object.keys(preview), ...Object.keys(production)])].sort();

  return keys.map((key) => {
    const inPreview = key in preview;
    const inProduction = key in production;
    let status: ChecklistRow['status'] = 'ok';
    if (!inPreview && requiredKeys.includes(key)) status = 'missing-preview';
    else if (!inProduction && requiredKeys.includes(key)) status = 'missing-production';
    else if (!inPreview) status = 'missing-preview';
    else if (!inProduction) status = 'missing-production';
    else if (preview[key] !== production[key]) status = 'value-differs';

    return {
      key,
      inPreview,
      inProduction,
      previewValue: inPreview ? redactValue(preview[key]!) : '',
      productionValue: inProduction ? redactValue(production[key]!) : '',
      status,
    };
  });
}

export const SAMPLE_REQUIRED = [
  'AI_GATEWAY_API_KEY',
  'DATABASE_URL',
  'CRON_SECRET',
  'NEXT_PUBLIC_SITE_URL',
].join('\n');

export const SAMPLE_PREVIEW = `NEXT_PUBLIC_SITE_URL=https://preview.example.com
AI_GATEWAY_API_KEY=sk_preview_demo_key_001
DATABASE_URL=postgres://preview:preview@localhost:5432/preview
`;

export const SAMPLE_PRODUCTION = `NEXT_PUBLIC_SITE_URL=https://example.com
AI_GATEWAY_API_KEY=sk_prod_demo_key_999
DATABASE_URL=postgres://prod:prod@localhost:5432/prod
CRON_SECRET=cron_prod_secret
`;
