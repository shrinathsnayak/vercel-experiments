import { neon } from '@neondatabase/serverless';

export function getDatabaseUrl(): string | null {
  const url =
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim();
  return url || null;
}

export function getSql() {
  const url = getDatabaseUrl();
  if (!url) return null;
  return neon(url);
}

export function postgresAvailable(): boolean {
  return getDatabaseUrl() !== null;
}
