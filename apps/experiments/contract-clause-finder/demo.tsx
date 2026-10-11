'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { downloadJson, SAMPLE_CONTRACT, type ClauseRow } from './logic';

export default function ContractClauseFinderDemo() {
  const [text, setText] = useState(SAMPLE_CONTRACT);
  const [file, setFile] = useState<File | null>(null);
  const [clauses, setClauses] = useState<ClauseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setClauses([]);
    try {
      const form = new FormData();
      form.set('text', text);
      if (file) form.set('file', file);
      const res = await fetch('/api/clauses', { method: 'POST', body: form });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Request failed.');
        return;
      }
      setClauses(data.clauses as ClauseRow[]);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Contract clause finder"
      description="Paste a short contract or upload a PDF. Extract risk clauses, obligations, and dates into a structured table."
      onReset={() => {
        setText(SAMPLE_CONTRACT);
        setFile(null);
        setClauses([]);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Contract text" htmlFor="contract-text">
          <Textarea
            id="contract-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-32 font-mono text-xs"
          />
        </Field>
        <Field label="Optional PDF / text file" htmlFor="contract-file">
          <Input
            id="contract-file"
            type="file"
            accept=".pdf,.txt,.md,.markdown,application/pdf,text/plain"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
            {loading ? 'Extracting…' : 'Find clauses'}
          </Button>
          {clauses.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadJson('clauses.json', { clauses })}
            >
              Export JSON
            </Button>
          ) : null}
        </div>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {clauses.length > 0 ? (
          <div className="overflow-x-auto rounded-md border border-fd-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-fd-secondary/50 text-[10px] uppercase tracking-wide text-fd-muted-foreground">
                <tr>
                  <th className="p-2">Kind</th>
                  <th className="p-2">Title</th>
                  <th className="p-2">Summary</th>
                  <th className="p-2">Party / date</th>
                </tr>
              </thead>
              <tbody>
                {clauses.map((row, i) => (
                  <tr key={i} className="border-t border-fd-border align-top">
                    <td className="p-2 font-medium">{row.kind}</td>
                    <td className="p-2">{row.title}</td>
                    <td className="p-2">{row.summary}</td>
                    <td className="p-2 text-fd-muted-foreground">
                      {[row.party, row.dateOrDeadline].filter(Boolean).join(' · ') || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
