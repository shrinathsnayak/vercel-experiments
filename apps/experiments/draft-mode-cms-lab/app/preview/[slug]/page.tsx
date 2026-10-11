import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { readDraft } from '../../../lib/cms-store';
import { renderMarkdownLite } from '../../../logic';

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dm = await draftMode();
  if (!dm.isEnabled) {
    return (
      <div className="rounded border border-amber-500/40 bg-amber-500/10 p-6 text-sm">
        Draft Mode is off. Open <code>/api/draft?slug={slug}</code> to enable preview.
      </div>
    );
  }
  const doc = await readDraft(slug);
  if (!doc) notFound();
  return (
    <article className="prose prose-sm dark:prose-invert max-w-none">
      <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300">Draft preview</p>
      <div dangerouslySetInnerHTML={{ __html: renderMarkdownLite(doc.body) }} />
      <p className="text-xs text-muted-foreground">Updated {doc.updatedAt}</p>
    </article>
  );
}
