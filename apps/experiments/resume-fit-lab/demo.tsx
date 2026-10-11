'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { SAMPLE_JD, SAMPLE_RESUME, type FitResult } from './logic';

export default function ResumeFitLabDemo() {
  const [jobDescription, setJobDescription] = useState(SAMPLE_JD);
  const [resume, setResume] = useState(SAMPLE_RESUME);
  const [result, setResult] = useState<FitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/fit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jobDescription, resume }),
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
      const { provider: _p, ...rest } = data as FitResult & { provider: string };
      setResult(rest);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Resume fit lab"
      description="Score a resume against a job description with missing skills, strengths, and rewritten bullets."
      onReset={() => {
        setJobDescription(SAMPLE_JD);
        setResume(SAMPLE_RESUME);
        setResult(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Job description" htmlFor="jd">
          <Textarea
            id="jd"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-28 text-sm"
          />
        </Field>
        <Field label="Resume" htmlFor="resume">
          <Textarea
            id="resume"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            className="min-h-28 text-sm"
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Scoring…' : 'Score fit'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? (
          <div className="space-y-3 text-sm" aria-live="polite">
            <DemoStatus tone="success">Match score: {result.matchScore} / 100</DemoStatus>
            <div>
              <p className="font-medium">Missing skills</p>
              <ul className="list-disc pl-5 text-fd-muted-foreground">
                {result.missingSkills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">Strengths</p>
              <ul className="list-disc pl-5 text-fd-muted-foreground">
                {result.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">Rewritten bullets</p>
              <ul className="list-disc pl-5 text-fd-muted-foreground">
                {result.rewrittenBullets.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
