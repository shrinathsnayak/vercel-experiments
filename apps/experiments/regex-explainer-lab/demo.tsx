'use client';

import { useMemo, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import {
  highlightMatches,
  renderHighlightedHtml,
  SAMPLE_FLAGS,
  SAMPLE_PATTERN,
  SAMPLE_TEST,
  type HighlightResult,
} from './logic';

type ExplainResult = {
  plainEnglish: string;
  parts: Array<{ token: string; meaning: string }>;
  caveats: string[];
  highlights: HighlightResult;
};

export default function RegexExplainerLabDemo() {
  const [pattern, setPattern] = useState(SAMPLE_PATTERN);
  const [flags, setFlags] = useState(SAMPLE_FLAGS);
  const [testString, setTestString] = useState(SAMPLE_TEST);
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const live = useMemo(
    () => highlightMatches(pattern, testString, flags),
    [pattern, testString, flags],
  );

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pattern, flags, testString }),
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
      const { provider: _p, ...rest } = data as ExplainResult & { provider: string };
      setResult(rest);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  const highlightSource = result?.highlights ?? live;

  return (
    <DemoShell
      title="Regex explainer lab"
      description="Explain a regex in plain English (AI) and highlight matches in a test string (local logic)."
      onReset={() => {
        setPattern(SAMPLE_PATTERN);
        setFlags(SAMPLE_FLAGS);
        setTestString(SAMPLE_TEST);
        setResult(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
          <Field label="Pattern" htmlFor="pattern">
            <Input
              id="pattern"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="font-mono text-sm"
            />
          </Field>
          <Field label="Flags" htmlFor="flags">
            <Input
              id="flags"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className="font-mono text-sm"
            />
          </Field>
        </div>
        <Field label="Test string" htmlFor="test">
          <Textarea
            id="test"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            className="min-h-24 font-mono text-xs"
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Explaining…' : 'Explain regex'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {!live.ok && live.error ? (
          <DemoStatus tone="error">Highlight: {live.error}</DemoStatus>
        ) : (
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wide text-fd-muted-foreground">
              Matches ({highlightSource.matches.length})
            </p>
            <div
              className="min-h-20 rounded-md border border-fd-border bg-fd-secondary/40 p-3 font-mono text-xs leading-relaxed [&_mark]:rounded-sm [&_mark]:bg-amber-200/80 [&_mark]:px-0.5 dark:[&_mark]:bg-amber-500/40"
              dangerouslySetInnerHTML={{
                __html: renderHighlightedHtml(testString, highlightSource.matches),
              }}
            />
          </div>
        )}
        {result ? (
          <div className="space-y-3 text-sm" aria-live="polite">
            <p>{result.plainEnglish}</p>
            <ul className="space-y-1 text-xs">
              {result.parts.map((p, i) => (
                <li key={i}>
                  <code className="rounded bg-fd-secondary px-1">{p.token}</code> - {p.meaning}
                </li>
              ))}
            </ul>
            {result.caveats.length > 0 ? (
              <ul className="list-disc pl-5 text-fd-muted-foreground">
                {result.caveats.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
