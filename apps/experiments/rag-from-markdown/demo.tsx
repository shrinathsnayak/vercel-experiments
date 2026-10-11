'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_FILES, SAMPLE_QUESTION, type MdFile, type SourceChunk } from './logic';

export default function RagFromMarkdownDemo() {
  const [filesText, setFilesText] = useState(
    SAMPLE_FILES.map((f) => `--- ${f.name} ---\n${f.content}`).join('\n\n'),
  );
  const [question, setQuestion] = useState(SAMPLE_QUESTION);
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<SourceChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function parseFiles(raw: string): MdFile[] {
    const parts = raw.split(/^---\s*(.+?)\s*---$/m).filter(Boolean);
    const files: MdFile[] = [];
    for (let i = 0; i + 1 < parts.length; i += 2) {
      files.push({ name: parts[i]!.trim(), content: parts[i + 1]!.trim() });
    }
    if (files.length === 0 && raw.trim()) files.push({ name: 'paste.md', content: raw });
    return files;
  }

  async function ask() {
    setLoading(true);
    setError(null);
    setAnswer('');
    setSources([]);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question, files: parseFiles(filesText) }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Ask failed.');
        return;
      }
      setAnswer(String(data.answer ?? ''));
      setSources(Array.isArray(data.sources) ? data.sources : []);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="RAG from markdown"
      description="Paste multiple markdown files, ask a question, and inspect the retrieved source chunks."
      onReset={() => {
        setFilesText(SAMPLE_FILES.map((f) => `--- ${f.name} ---\n${f.content}`).join('\n\n'));
        setQuestion(SAMPLE_QUESTION);
        setAnswer('');
        setSources([]);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Markdown files (use --- name.md --- separators)" htmlFor="files">
          <Textarea id="files" value={filesText} onChange={(e) => setFilesText(e.target.value)} className="min-h-40 font-mono text-xs" />
        </Field>
        <Field label="Question" htmlFor="q">
          <Textarea id="q" value={question} onChange={(e) => setQuestion(e.target.value)} className="min-h-16 text-sm" />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={ask}>
          {loading ? 'Retrieving…' : 'Ask'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {answer ? <pre className="whitespace-pre-wrap rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm">{answer}</pre> : null}
        {sources.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">Source chunks</h3>
            {sources.map((s) => (
              <pre key={s.id} className="overflow-auto rounded-md border border-fd-border p-3 text-xs">
{s.file} #{s.index}
{s.text}
              </pre>
            ))}
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
