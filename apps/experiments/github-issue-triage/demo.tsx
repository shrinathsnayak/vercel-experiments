'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { SAMPLE_BODY, SAMPLE_TITLE, type TriageResult } from './logic';

export default function GithubIssueTriageDemo() {
  const [title, setTitle] = useState(SAMPLE_TITLE);
  const [body, setBody] = useState(SAMPLE_BODY);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title, body }),
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
      setResult({
        labels: data.labels,
        severity: data.severity,
        firstResponse: data.firstResponse,
        clarifyingQuestions: data.clarifyingQuestions,
      });
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="GitHub issue triage"
      description="Paste an issue title/body - suggested labels, severity, and a first-response draft. No GitHub token."
      onReset={() => {
        setTitle(SAMPLE_TITLE);
        setBody(SAMPLE_BODY);
        setResult(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Title" htmlFor="issue-title">
          <Input
            id="issue-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm"
          />
        </Field>
        <Field label="Body" htmlFor="issue-body">
          <Textarea
            id="issue-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-40 font-mono text-xs"
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Triaging…' : 'Triage issue'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? (
          <div className="space-y-3 text-sm" aria-live="polite">
            <DemoStatus tone="success">Severity: {result.severity}</DemoStatus>
            <p className="text-xs">
              Labels:{' '}
              {result.labels.map((l) => (
                <span
                  key={l}
                  className="mr-1 inline-block rounded border border-fd-border px-1.5 py-0.5 font-mono"
                >
                  {l}
                </span>
              ))}
            </p>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
                First response
              </p>
              <pre className="whitespace-pre-wrap rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs">
                {result.firstResponse}
              </pre>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
                Clarifying questions
              </p>
              <ul className="list-disc space-y-1 pl-5">
                {result.clarifyingQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
