'use client';

import { useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { SAMPLE_PACKAGE, type NpmMeta, type PackageBrief } from './logic';

type Result = PackageBrief & { meta: NpmMeta };

export default function NpmPackageBriefDemo() {
  const [packageName, setPackageName] = useState(SAMPLE_PACKAGE);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ packageName }),
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
        meta: data.meta,
        whenToUse: data.whenToUse,
        whenToAvoid: data.whenToAvoid,
        notes: data.notes,
      });
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="npm package brief"
      description="Look up registry metadata for a package name (no install) and get when-to-use / when-to-avoid guidance."
      onReset={() => {
        setPackageName(SAMPLE_PACKAGE);
        setResult(null);
        setError(null);
      }}
    >
      <div className="space-y-4">
        <Field label="Package name" htmlFor="pkg">
          <Input
            id="pkg"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            className="font-mono text-xs"
          />
        </Field>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={run}>
          {loading ? 'Fetching…' : 'Brief package'}
        </Button>
        {error ? <DemoStatus tone="error">{error}</DemoStatus> : null}
        {result ? (
          <div className="space-y-3 text-sm" aria-live="polite">
            <p className="font-medium">
              {result.meta.name}@{result.meta.version} · {result.meta.license}
            </p>
            <p className="text-fd-muted-foreground">{result.meta.description}</p>
            {result.meta.weeklyDownloads != null ? (
              <p className="text-xs">~{result.meta.weeklyDownloads.toLocaleString()} downloads/week</p>
            ) : null}
            {(
              [
                ['When to use', result.whenToUse],
                ['When to avoid', result.whenToAvoid],
                ['Notes', result.notes],
              ] as const
            ).map(([label, items]) => (
              <div key={label}>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
                  {label}
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  {items.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </DemoShell>
  );
}
