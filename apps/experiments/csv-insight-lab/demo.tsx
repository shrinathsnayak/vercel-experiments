'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { SAMPLE_CSV, type ChartAggregate } from './logic';

export default function CsvInsightLabDemo() {
  const [csv, setCsv] = useState(SAMPLE_CSV);
  const [file, setFile] = useState<File | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [caveats, setCaveats] = useState<string[]>([]);
  const [chartReady, setChartReady] = useState<ChartAggregate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setInsights([]);
    setCaveats([]);
    setChartReady([]);
    try {
      const form = new FormData();
      form.set('csv', csv);
      if (file) form.set('file', file);
      const res = await fetch('/api/insights', { method: 'POST', body: form });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Request failed.');
        return;
      }
      setInsights(data.insights as string[]);
      setCaveats(data.caveats as string[]);
      setChartReady(data.chartReady as ChartAggregate[]);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  const max = Math.max(...chartReady.map((c) => c.value), 1);

  return (
    <DemoShell
      title="CSV insight lab"
      description="Paste or upload CSV (max 50 rows) - parse locally, then generateObject insights. Never invents rows."
      onReset={() => {
        setCsv(SAMPLE_CSV);
        setFile(null);
        setInsights([]);
        setCaveats([]);
        setChartReady([]);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="CSV" htmlFor="csv">
          <Textarea
            id="csv"
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            className="min-h-32 font-mono text-xs"
          />
        </Field>
        <Field label="Optional CSV file" htmlFor="file">
          <Input
            id="file"
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Analyzing…' : 'Analyze CSV'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {insights.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {insights.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        ) : null}
        {caveats.length > 0 ? (
          <DemoStatus tone="warning">{caveats.join(' ')}</DemoStatus>
        ) : null}
        {chartReady.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-fd-muted-foreground">
              chartReady aggregates (from parsed rows only)
            </p>
            <div className="space-y-1">
              {chartReady.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <span className="w-28 truncate">{item.label}</span>
                  <div className="h-2 flex-1 rounded bg-fd-secondary">
                    <div
                      className="h-2 rounded bg-fd-primary"
                      style={{ width: `${(item.value / max) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
