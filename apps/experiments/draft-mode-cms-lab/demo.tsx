'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { draftSnippet } from './logic';

const SAMPLE = `# Launch notes

Welcome to the **Draft Mode** CMS lab.

Edit this markdown, save a draft, enable preview, then publish to the live path.
`;

export default function DraftModeCmsLabDemo() {
  const [markdown, setMarkdown] = useState(SAMPLE);
  const [slug, setSlug] = useState('launch-notes');
  const [info, setInfo] = useState('');

  async function save() {
    const res = await fetch('/api/cms/draft', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ markdown, slug }),
    });
    const data = await res.json();
    setSlug(data.slug ?? slug);
    setInfo(JSON.stringify(data, null, 2));
  }

  async function publish() {
    const res = await fetch('/api/cms/publish', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug }),
    });
    setInfo(JSON.stringify(await res.json(), null, 2));
  }

  return (
    <DemoShell
      title="Draft Mode CMS lab"
      description="Edit markdown - store draft (Blob or memory) - Draft Mode preview - publish to live path."
      example={draftSnippet()}
      onReset={() => {
        setMarkdown(SAMPLE);
        setSlug('launch-notes');
        setInfo('');
      }}
    >
      <DemoStatus tone="neutral">
        Uses Next.js <code className="text-xs">draftMode()</code>. Blob is optional; memory fallback is honest when{' '}
        <code className="text-xs">BLOB_READ_WRITE_TOKEN</code> is missing.
      </DemoStatus>
      <div className="mt-4 space-y-3">
        <Field label="Slug">
          <Input className="font-mono text-xs" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </Field>
        <Field label="Markdown">
          <Textarea rows={10} value={markdown} onChange={(e) => setMarkdown(e.target.value)} className="font-mono text-xs" />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void save()}>
            Save draft
          </Button>
          <Button type="button" variant="outline" asChild>
            <a href={`/api/draft?slug=${encodeURIComponent(slug)}`}>Enable Draft Mode</a>
          </Button>
          <Button type="button" variant="outline" asChild>
            <a href={`/preview/${encodeURIComponent(slug)}`} target="_blank" rel="noreferrer">
              Open preview
            </a>
          </Button>
          <Button type="button" onClick={() => void publish()}>
            Publish
          </Button>
          <Button type="button" variant="secondary" asChild>
            <a href={`/live/${encodeURIComponent(slug)}`} target="_blank" rel="noreferrer">
              Open live
            </a>
          </Button>
        </div>
        <pre className="max-h-48 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">{info || 'Actions log'}</pre>
      </div>
    </DemoShell>
  );
}
