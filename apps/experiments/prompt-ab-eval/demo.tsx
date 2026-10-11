'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import {
  SAMPLE_SYSTEM_A,
  SAMPLE_SYSTEM_B,
  SAMPLE_USER,
  type JudgeScores,
} from './logic';

export default function PromptAbEvalDemo() {
  const [systemA, setSystemA] = useState(SAMPLE_SYSTEM_A);
  const [systemB, setSystemB] = useState(SAMPLE_SYSTEM_B);
  const [user, setUser] = useState(SAMPLE_USER);
  const [outA, setOutA] = useState('');
  const [outB, setOutB] = useState('');
  const [judge, setJudge] = useState<JudgeScores | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setJudge(null);
    try {
      const res = await fetch('/api/eval', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ systemA, systemB, user }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setError(`${data.error}. ${data.setup}`);
        return;
      }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Eval failed.');
        return;
      }
      setOutA(String(data.outputA ?? ''));
      setOutB(String(data.outputB ?? ''));
      setJudge(data.judge as JudgeScores);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Prompt A/B eval"
      description="Two system prompts on the same user message — side-by-side outputs plus judge scores."
      onReset={() => {
        setSystemA(SAMPLE_SYSTEM_A);
        setSystemB(SAMPLE_SYSTEM_B);
        setUser(SAMPLE_USER);
        setOutA('');
        setOutB('');
        setJudge(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="System A" htmlFor="a">
            <Textarea id="a" value={systemA} onChange={(e) => setSystemA(e.target.value)} className="min-h-24 text-sm" />
          </Field>
          <Field label="System B" htmlFor="b">
            <Textarea id="b" value={systemB} onChange={(e) => setSystemB(e.target.value)} className="min-h-24 text-sm" />
          </Field>
        </div>
        <Field label="User message" htmlFor="u">
          <Textarea id="u" value={user} onChange={(e) => setUser(e.target.value)} className="min-h-20 text-sm" />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Evaluating…' : 'Run A/B + judge'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <pre className="whitespace-pre-wrap rounded-md border border-fd-border p-3 text-sm">{outA || '—'}</pre>
          <pre className="whitespace-pre-wrap rounded-md border border-fd-border p-3 text-sm">{outB || '—'}</pre>
        </div>
        {judge ? (
          <DemoStatus tone="success">
            Winner: {judge.winner} · clarity {judge.clarity}/5 · helpfulness {judge.helpfulness}/5 ·
            concision {judge.concision}/5 — {judge.rationale}
          </DemoStatus>
        ) : null}
      </div>
    </DemoShell>
  );
}
