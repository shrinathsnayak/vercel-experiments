'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { downloadJson, SAMPLE_SYLLABUS, type StudyPlan } from './logic';

export default function SyllabusPlannerLabDemo() {
  const [syllabus, setSyllabus] = useState(SAMPLE_SYLLABUS);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ syllabus }),
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
      const { provider: _p, ...rest } = data as StudyPlan & { provider: string };
      setPlan(rest);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Syllabus planner lab"
      description="Paste a syllabus. Get a weekly study plan as structured JSON you can export."
      onReset={() => {
        setSyllabus(SAMPLE_SYLLABUS);
        setPlan(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Syllabus" htmlFor="syllabus">
          <Textarea
            id="syllabus"
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            className="min-h-32 text-sm"
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
            {loading ? 'Planning…' : 'Build study plan'}
          </Button>
          {plan ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadJson('study-plan.json', plan)}
            >
              Export JSON
            </Button>
          ) : null}
        </div>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {plan ? (
          <div className="space-y-3 text-sm" aria-live="polite">
            <p className="font-medium">{plan.courseTitle}</p>
            <ul className="list-disc space-y-1 pl-5 text-fd-muted-foreground">
              {plan.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
            <pre className="max-h-80 overflow-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs">
              {JSON.stringify(plan.weeks, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
