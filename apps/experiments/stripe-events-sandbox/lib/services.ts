/**
 * Runtime detection for Vercel Marketplace / native services.
 * Demos degrade honestly when a service is not provisioned.
 */

export type ServiceId =
  | 'ai-gateway'
  | 'openai'
  | 'blob'
  | 'global-config'
  | 'redis'
  | 'postgres'
  | 'sandbox';

export type ServiceStatus = {
  id: ServiceId;
  available: boolean;
  label: string;
  envHints: string[];
};

function hasEnv(...names: string[]): boolean {
  return names.some((name) => Boolean(process.env[name]?.trim()));
}

export function getServiceStatus(id: ServiceId): ServiceStatus {
  switch (id) {
    case 'ai-gateway':
      return {
        id,
        // Prefer an explicit Gateway key. OIDC works on Vercel without a long-lived key,
        // but only when the project has AI Gateway enabled - keep detection explicit.
        available: hasEnv('AI_GATEWAY_API_KEY'),
        label: 'AI Gateway',
        envHints: ['AI_GATEWAY_API_KEY'],
      };
    case 'openai':
      return {
        id,
        available: hasEnv('OPENAI_API_KEY'),
        label: 'OpenAI-compatible API',
        envHints: ['OPENAI_API_KEY'],
      };
    case 'blob':
      return {
        id,
        available: hasEnv('BLOB_READ_WRITE_TOKEN'),
        label: 'Vercel Blob',
        envHints: ['BLOB_READ_WRITE_TOKEN'],
      };
    case 'global-config':
      return {
        id,
        available: hasEnv('GLOBAL_CONFIG', 'EDGE_CONFIG'),
        label: 'Global Config',
        envHints: ['GLOBAL_CONFIG'],
      };
    case 'redis':
      return {
        id,
        available: hasEnv(
          'UPSTASH_REDIS_REST_URL',
          'KV_REST_API_URL',
          'REDIS_URL',
        ),
        label: 'Redis (Upstash)',
        envHints: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
      };
    case 'postgres':
      return {
        id,
        available: hasEnv('DATABASE_URL', 'POSTGRES_URL', 'POSTGRES_PRISMA_URL'),
        label: 'Neon Postgres',
        envHints: ['DATABASE_URL'],
      };
    case 'sandbox':
      return {
        id,
        // On Vercel, @vercel/sandbox uses OIDC automatically when enabled.
        available: process.env.SANDBOX_ENABLED === 'true',
        label: 'Vercel Sandbox',
        envHints: ['SANDBOX_ENABLED'],
      };
  }
}

export function getConfiguredServices(): ServiceStatus[] {
  return (
    [
      'ai-gateway',
      'openai',
      'blob',
      'global-config',
      'redis',
      'postgres',
      'sandbox',
    ] as const
  ).map(getServiceStatus);
}

export function aiProviderAvailable(): boolean {
  return getServiceStatus('ai-gateway').available || getServiceStatus('openai').available;
}
