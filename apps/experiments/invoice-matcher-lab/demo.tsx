'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_INVOICE, SAMPLE_PO, type MatchResult } from './logic';

export default function InvoiceMatcherLabDemo() {
  const [invoice, setInvoice] = useState(SAMPLE_INVOICE);
  const [po, setPo] = useState(SAMPLE_PO);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ invoice, po }),
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
      const { provider: _p, ...rest } = data as MatchResult & { provider: string };
      setResult(rest);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Invoice matcher lab"
      description="Paste invoice and PO text. See field-level match / mismatch with confidence scores."
      onReset={() => {
        setInvoice(SAMPLE_INVOICE);
        setPo(SAMPLE_PO);
        setResult(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Invoice" htmlFor="invoice">
          <Textarea
            id="invoice"
            value={invoice}
            onChange={(e) => setInvoice(e.target.value)}
            className="min-h-28 font-mono text-xs"
          />
        </Field>
        <Field label="Purchase order" htmlFor="po">
          <Textarea
            id="po"
            value={po}
            onChange={(e) => setPo(e.target.value)}
            className="min-h-28 font-mono text-xs"
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Matching…' : 'Match invoice to PO'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? (
          <div className="space-y-3 text-sm" aria-live="polite">
            <DemoStatus tone="success">
              Overall confidence: {(result.overallConfidence * 100).toFixed(0)}% - {result.summary}
            </DemoStatus>
            <div className="overflow-x-auto rounded-md border border-fd-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-fd-secondary/50 text-[10px] uppercase tracking-wide text-fd-muted-foreground">
                  <tr>
                    <th className="p-2">Field</th>
                    <th className="p-2">Invoice</th>
                    <th className="p-2">PO</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Conf.</th>
                  </tr>
                </thead>
                <tbody>
                  {result.fields.map((f, i) => (
                    <tr key={i} className="border-t border-fd-border">
                      <td className="p-2 font-medium">{f.field}</td>
                      <td className="p-2">{f.invoiceValue || '-'}</td>
                      <td className="p-2">{f.poValue || '-'}</td>
                      <td className="p-2">{f.status}</td>
                      <td className="p-2">{(f.confidence * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
