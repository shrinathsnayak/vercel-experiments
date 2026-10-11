'use client';

import { useCallback, useEffect, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { postgresSnippet, validateNoteBody } from './logic';

type Note = { id: number; body: string; createdAt: string };

export default function NeonPostgresLabDemo() {
  const [body, setBody] = useState('Shipped with Neon on the Vercel Marketplace');
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/postgres/demo');
    const data = (await res.json()) as {
      notes?: Note[];
      setup?: string;
      error?: string;
    };
    if (res.status === 503) {
      setLive(false);
      setError(data.setup ?? data.error ?? 'Postgres not configured');
      setNotes([]);
      return;
    }
    setLive(true);
    setError(null);
    setNotes(data.notes ?? []);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function addNote() {
    const invalid = validateNoteBody(body);
    if (invalid) {
      setError(invalid);
      return;
    }
    const res = await fetch('/api/postgres/demo', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body: body.trim() }),
    });
    const data = (await res.json()) as { error?: string; setup?: string };
    if (!res.ok) {
      setLive(res.status !== 503);
      setError(data.setup ?? data.error ?? 'Insert failed');
      return;
    }
    setBody('');
    await refresh();
  }

  return (
    <DemoShell
      title="Neon Postgres lab"
      description="Serverless SQL with Neon from the Vercel Marketplace - one-click DATABASE_URL injection."
      example={postgresSnippet()}
      onReset={() => {
        setBody('Shipped with Neon on the Vercel Marketplace');
        setError(null);
        void refresh();
      }}
    >
      {live ? (
        <DemoStatus tone="success">Connected via DATABASE_URL (Neon).</DemoStatus>
      ) : (
        <DemoStatus tone="warning">
          Add Neon through Marketplace / Deploy button stores, then redeploy.
        </DemoStatus>
      )}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="Note">
            <Textarea
              className="min-h-28 text-xs"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={280}
            />
          </Field>
          <Button type="button" onClick={addNote}>
            Insert note
          </Button>
          {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        </div>
        <ul className="space-y-2">
          {notes.length === 0 ? (
            <li className="text-xs text-muted-foreground">No rows yet.</li>
          ) : (
            notes.map((note) => (
              <li key={note.id} className="rounded-md border px-3 py-2 text-xs">
                <p>{note.body}</p>
                <p className="mt-1 font-mono text-muted-foreground">{note.createdAt}</p>
              </li>
            ))
          )}
        </ul>
      </div>
    </DemoShell>
  );
}
