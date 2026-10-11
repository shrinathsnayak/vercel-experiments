'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { ESTIMATE_DISCLAIMER, SAMPLE_PROMPT, type RunMetrics } from './logic';

export default function CostAwareAiLabDemo() {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT);
  const [runs, setRuns] = useState<RunMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function compare() {
    setLoading(true);
    setError(null);
    setRuns([]);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Compare failed.');
        return;
      }
      setRuns(data.runs as RunMetrics[]);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Cost-aware AI lab"
      description="Run the same prompt on two models via Gateway and compare latency plus estimated token cost."
      onReset={() => {
        setPrompt(SAMPLE_PROMPT);
        setRuns([]);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Prompt" htmlFor="prompt">
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-24 text-sm"
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={compare}>
          {loading ? 'Comparing…' : 'Compare models'}
        </Button>
        <DemoStatus tone="warning">{ESTIMATE_DISCLAIMER}</DemoStatus>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          {runs.map((run) => (
            <div
              key={run.model}
              className="rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-sm"
            >
              <p className="font-medium">{run.model}</p>
              <p className="mt-1 text-xs text-fd-muted-foreground">
                {run.latencyMs}ms · in {run.inputTokens ?? '-'} / out {run.outputTokens ?? '-'} ·
                est. ${run.estimatedCostUsd ?? '-'}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{run.text}</p>
            </div>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}
