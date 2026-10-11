'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { SAMPLE_DOC } from './logic';

type Citation = { quote: string; chunkIndex: number };

export default function ChatWithYourPdfDemo() {
  const [document, setDocument] = useState(SAMPLE_DOC);
  const [question, setQuestion] = useState('How should Blob write tokens be handled?');
  const [file, setFile] = useState<File | null>(null);
  const [answer, setAnswer] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [meta, setMeta] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask() {
    setLoading(true);
    setError(null);
    setAnswer('');
    setCitations([]);
    try {
      const form = new FormData();
      form.set('document', document);
      form.set('question', question);
      if (file) form.set('file', file);
      const res = await fetch('/api/chat', { method: 'POST', body: form });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Request failed.');
        return;
      }
      setAnswer(data.answer as string);
      setCitations((data.citations as Citation[]) ?? []);
      setMeta(
        `chunks=${data.chunkCount} retrieved=${(data.retrievedChunkIndexes as number[])?.join(',') ?? ''} provider=${data.provider}`,
      );
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Chat with your PDF"
      description="Chunk a document, retrieve by keyword overlap (no embeddings), answer with citations."
      onReset={() => {
        setDocument(SAMPLE_DOC);
        setQuestion('How should Blob write tokens be handled?');
        setFile(null);
        setAnswer('');
        setCitations([]);
        setMeta('');
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Document text" htmlFor="doc">
          <Textarea
            id="doc"
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            className="min-h-28 text-sm"
          />
        </Field>
        <Field label="Upload (.txt / .md / .pdf)" htmlFor="doc-file">
          <Input
            id="doc-file"
            type="file"
            accept=".txt,.md,.markdown,.pdf,text/plain,text/markdown,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Field>
        <Field label="Question" htmlFor="q">
          <Input
            id="q"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={ask}>
          {loading ? 'Asking…' : 'Ask'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {meta ? <p className="text-xs text-fd-muted-foreground">{meta}</p> : null}
        {answer ? (
          <div className="space-y-3" aria-live="polite">
            <p className="text-sm">{answer}</p>
            {citations.length > 0 ? (
              <ul className="space-y-2 text-xs text-fd-muted-foreground">
                {citations.map((c, i) => (
                  <li key={i} className="rounded border border-fd-border p-2">
                    <span className="font-medium text-fd-foreground">chunk {c.chunkIndex}</span>
                    : “{c.quote}”
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
