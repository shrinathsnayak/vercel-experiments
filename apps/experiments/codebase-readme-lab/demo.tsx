'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import {
  downloadText,
  SAMPLE_SNIPPETS,
  SAMPLE_TREE,
  toMarkdown,
  type ReadmeDraft,
} from './logic';

export default function CodebaseReadmeLabDemo() {
  const [tree, setTree] = useState(SAMPLE_TREE);
  const [snippets, setSnippets] = useState(SAMPLE_SNIPPETS);
  const [draft, setDraft] = useState<ReadmeDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setDraft(null);
    try {
      const res = await fetch('/api/readme', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tree, snippets }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Request failed.');
        return;
      }
      const { provider: _p, ...rest } = data as ReadmeDraft & { provider: string };
      setDraft(rest);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Codebase README lab"
      description="Paste a file tree and snippets. Draft README sections you can download as markdown."
      onReset={() => {
        setTree(SAMPLE_TREE);
        setSnippets(SAMPLE_SNIPPETS);
        setDraft(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="File tree" htmlFor="tree">
          <Textarea
            id="tree"
            value={tree}
            onChange={(e) => setTree(e.target.value)}
            className="min-h-24 font-mono text-xs"
          />
        </Field>
        <Field label="Snippets" htmlFor="snippets">
          <Textarea
            id="snippets"
            value={snippets}
            onChange={(e) => setSnippets(e.target.value)}
            className="min-h-28 font-mono text-xs"
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
            {loading ? 'Drafting…' : 'Draft README'}
          </Button>
          {draft ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadText('README.md', toMarkdown(draft))}
            >
              Download README.md
            </Button>
          ) : null}
        </div>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {draft ? (
          <pre className="max-h-96 overflow-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs whitespace-pre-wrap">
            {toMarkdown(draft)}
          </pre>
        ) : null}
      </div>
    </DemoShell>
  );
}
