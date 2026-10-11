'use client';

import { useMemo, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import {
  buildWorkflowTimeline,
  demoOrderWorkflowPlan,
  workflowStartSnippet,
} from './logic';

type StartResponse = {
  ok: boolean;
  mode?: string;
  runId?: string;
  orderId?: string;
  note?: string;
  error?: string;
  setup?: string;
};

export default function WorkflowsLabDemo() {
  const [orderId, setOrderId] = useState('order_demo');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StartResponse | null>(null);

  const timeline = useMemo(
    () => buildWorkflowTimeline(demoOrderWorkflowPlan()),
    [],
  );

  async function startWorkflow() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/workflows/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = (await res.json()) as StartResponse;
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Workflows lab"
      description="Start a durable multi-step order workflow with 'use workflow', 'use step', and sleep - powered by the Workflow SDK on Vercel."
      example={workflowStartSnippet()}
      onReset={() => {
        setOrderId('order_demo');
        setResult(null);
      }}
    >
      <DemoStatus tone="neutral">
        Live mode calls <code className="font-mono">start()</code> from{' '}
        <code className="font-mono">workflow/api</code>. Without a linked Vercel
        project the route returns a clear setup message - the timeline still
        teaches the mental model.
      </DemoStatus>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="Order ID">
            <Input
              className="text-xs font-mono"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </Field>
          <Button type="button" onClick={startWorkflow} disabled={loading || !orderId}>
            {loading ? 'Starting…' : 'Start workflow'}
          </Button>
          {result ? (
            <DemoStatus tone={result.ok ? 'success' : 'warning'}>
              {result.ok
                ? `Run ${result.runId} started (${result.mode}).`
                : (result.setup ?? result.error ?? 'Workflow unavailable')}
            </DemoStatus>
          ) : null}
          {result ? (
            <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Educational timeline (simulator)
          </p>
          <ol className="space-y-2">
            {timeline.map((event) => (
              <li
                key={event.stepId}
                className="rounded-md border bg-muted/30 px-3 py-2 text-xs"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono font-medium">{event.label}</span>
                  <span className="text-muted-foreground">t={event.atMs}ms</span>
                </div>
                <p className="mt-1 text-muted-foreground">{event.note}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </DemoShell>
  );
}
