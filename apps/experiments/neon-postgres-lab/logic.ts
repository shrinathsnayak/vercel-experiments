export function postgresSnippet(): string {
  return `import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
const rows = await sql\`select now() as now\`;`;
}

export function validateNoteBody(body: string): string | null {
  const trimmed = body.trim();
  if (!trimmed) return 'Note cannot be empty';
  if (trimmed.length > 280) return 'Note must be 280 characters or fewer';
  return null;
}
