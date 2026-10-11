export type ConfigSnapshot = Record<string, unknown>;

export const SUGGESTED_KEYS = [
  'greeting',
  'maintenanceMode',
  'featureCheckoutV2',
] as const;

export function summarizeConfig(items: ConfigSnapshot | null | undefined): {
  keyCount: number;
  keys: string[];
} {
  if (!items || typeof items !== 'object') {
    return { keyCount: 0, keys: [] };
  }
  const keys = Object.keys(items).sort((a, b) => a.localeCompare(b));
  return { keyCount: keys.length, keys };
}

export function globalConfigSnippet(): string {
  return `import { get } from '@vercel/global-config';

export async function GET() {
  const greeting = await get('greeting');
  return Response.json({ greeting });
}`;
}
