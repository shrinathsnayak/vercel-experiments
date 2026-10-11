'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { downloadJson, SAMPLE_RECEIPT, type Expense } from './logic';

export default function ReceiptToJsonLabDemo() {
  const [text, setText] = useState(SAMPLE_RECEIPT);
  const [file, setFile] = useState<File | null>(null);
  const [expense, setExpense] = useState<Expense | null>(null);
  const [meta, setMeta] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setExpense(null);
    try {
      const form = new FormData();
      form.set('text', text);
      if (file) form.set('file', file);
      const res = await fetch('/api/receipt', { method: 'POST', body: form });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Request failed.');
        return;
      }
      const { provider, usedVision, ...rest } = data as Expense & {
        provider: string;
        usedVision: boolean;
      };
      setExpense(rest);
      setMeta(`provider=${provider} vision=${usedVision}`);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Receipt to JSON lab"
      description="Paste receipt text or upload an image. Text-only works without vision; images use AI SDK image parts."
      onReset={() => {
        setText(SAMPLE_RECEIPT);
        setFile(null);
        setExpense(null);
        setMeta('');
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Receipt text" htmlFor="receipt-text">
          <Textarea
            id="receipt-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-28 font-mono text-xs"
          />
        </Field>
        <Field label="Optional image" htmlFor="receipt-file">
          <Input
            id="receipt-file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
            {loading ? 'Extracting…' : 'Extract JSON'}
          </Button>
          {expense ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadJson('expense.json', expense)}
            >
              Download JSON
            </Button>
          ) : null}
        </div>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {meta ? <p className="text-xs text-fd-muted-foreground">{meta}</p> : null}
        <pre className="min-h-32 overflow-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs">
          {expense ? JSON.stringify(expense, null, 2) : 'Structured expense JSON will appear here.'}
        </pre>
      </div>
    </DemoShell>
  );
}
