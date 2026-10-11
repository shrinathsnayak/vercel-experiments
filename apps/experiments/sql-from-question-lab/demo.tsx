'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { SAMPLE_DDL, SAMPLE_QUESTION, type SqlDraft } from './logic';

type RunMeta = {
  attempted: boolean;
  ok: boolean;
  detail: string;
  rows?: unknown;
};

export default function SqlFromQuestionLabDemo() {
  const [ddl, setDdl] = useState(SAMPLE_DDL);
  const [question, setQuestion] = useState(SAMPLE_QUESTION);
  const [runOnNeon, setRunOnNeon] = useState(false);
  const [draft, setDraft] = useState<SqlDraft | null>(null);
  const [runMeta, setRunMeta] = useState<RunMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setDraft(null);
    setRunMeta(null);
    try {
      const res = await fetch('/api/sql', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ddl, question, run: runOnNeon }),
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
      const { provider: _p, run: runResult, ...rest } = data as SqlDraft & {
        provider: string;
        run: RunMeta;
      };
      setDraft(rest);
      setRunMeta(runResult);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="SQL from question lab"
      description="Paste DDL and ask in English. Get parameterized SQL + explanation. Optional Neon run only when DATABASE_URL and demo tables exist."
      onReset={() => {
        setDdl(SAMPLE_DDL);
        setQuestion(SAMPLE_QUESTION);
        setRunOnNeon(false);
        setDraft(null);
        setRunMeta(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="DDL" htmlFor="ddl">
          <Textarea
            id="ddl"
            value={ddl}
            onChange={(e) => setDdl(e.target.value)}
            className="min-h-32 font-mono text-xs"
          />
        </Field>
        <Field label="Question" htmlFor="question">
          <Textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-20 text-sm"
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={runOnNeon}
            onCheckedChange={(v) => setRunOnNeon(v === true)}
          />
          Attempt Neon run (default explain-only)
        </label>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Generating…' : 'Generate SQL'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {draft ? (
          <div className="space-y-3 text-sm" aria-live="polite">
            <p>{draft.explanation}</p>
            <pre className="overflow-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs">
              {draft.sql}
            </pre>
            {draft.params.length > 0 ? (
              <p className="text-xs text-fd-muted-foreground">
                params: {draft.params.join(' · ')}
              </p>
            ) : null}
            {draft.unsafe ? (
              <DemoStatus tone="error">
                Marked unsafe{draft.unsafeReason ? `: ${draft.unsafeReason}` : ''}
              </DemoStatus>
            ) : null}
            {runMeta ? (
              <DemoStatus tone={runMeta.ok ? 'success' : 'neutral'}>{runMeta.detail}</DemoStatus>
            ) : null}
            {runMeta?.rows ? (
              <pre className="max-h-48 overflow-auto rounded-md border border-fd-border p-3 text-xs">
                {JSON.stringify(runMeta.rows, null, 2)}
              </pre>
            ) : null}
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
