export type EnvClassification = 'public' | 'server' | 'invalid';

export type EnvEntry = {
  key: string;
  value: string;
  line: number;
};

export type ParsedEnv = {
  entries: EnvEntry[];
  errors: string[];
};

const PUBLIC_PREFIX = 'NEXT_PUBLIC_';
const INVALID_KEY = /^$/;
const VALID_KEY = /^[A-Z][A-Z0-9_]*$/;

export function classifyEnvKey(name: string): EnvClassification {
  const key = name.trim();
  if (INVALID_KEY.test(key) || !VALID_KEY.test(key)) return 'invalid';
  if (key.startsWith(PUBLIC_PREFIX)) return 'public';
  return 'server';
}

export function parseEnvFile(content: string): ParsedEnv {
  const entries: EnvEntry[] = [];
  const errors: string[] = [];
  const lines = content.split(/\r?\n/);

  lines.forEach((raw, index) => {
    const line = index + 1;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const eq = trimmed.indexOf('=');
    if (eq <= 0) {
      errors.push(`Line ${line}: expected KEY=value`);
      return;
    }

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    entries.push({ key, value, line });
  });

  return { entries, errors };
}

export function redactForClient(entries: EnvEntry[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const entry of entries) {
    const kind = classifyEnvKey(entry.key);
    if (kind === 'public') {
      out[entry.key] = entry.value;
    } else if (kind === 'server') {
      out[entry.key] = '[REDACTED - server only]';
    }
  }
  return out;
}

export function serverView(entries: EnvEntry[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const entry of entries) {
    if (classifyEnvKey(entry.key) !== 'invalid') {
      out[entry.key] = entry.value;
    }
  }
  return out;
}

export const DUMMY_ENV_SAMPLE = `# Dummy values for education only
NEXT_PUBLIC_SITE_URL=https://demo.example.com
NEXT_PUBLIC_FEATURE_FLAG=true
DATABASE_URL=postgres://demo:demo@localhost:5432/demo
API_SECRET_KEY=sk_demo_not_real
`;
