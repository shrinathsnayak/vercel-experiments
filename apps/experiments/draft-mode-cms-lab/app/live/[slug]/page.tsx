import { notFound } from 'next/navigation';
import { readLive } from '../../../lib/cms-store';
import { renderMarkdownLite } from '../../../logic';

export default async function LivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await readLive(slug);
  if (!doc) {
    return (
      <div className="rounded border p-6 text-sm text-muted-foreground">
        No published document for <code>{slug}</code>. Save a draft and publish from the lab UI.
      </div>
    );
  }
  return (
    <article className="prose prose-sm dark:prose-invert max-w-none">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">Live</p>
      <div dangerouslySetInnerHTML={{ __html: renderMarkdownLite(doc.body) }} />
    </article>
  );
}
