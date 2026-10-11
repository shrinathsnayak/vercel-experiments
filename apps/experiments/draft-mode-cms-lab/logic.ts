export type CmsDocument = {
  slug: string;
  title: string;
  body: string;
  updatedAt: string;
  status: 'draft' | 'published';
};

export function parseFrontmatterTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || 'Untitled';
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64) || 'untitled';
}

export function renderMarkdownLite(markdown: string): string {
  return markdown
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<h)/gm, '') // no-op keep simple
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

export function draftSnippet(): string {
  return `import { draftMode } from 'next/headers';
export async function GET() {
  (await draftMode()).enable();
  return Response.redirect('/preview');
}
// Draft content from Blob/memory; publish copies to live path.`;
}
