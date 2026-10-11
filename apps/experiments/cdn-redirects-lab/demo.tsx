'use client';

import { useMemo, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  applyRedirects,
  defaultRedirects,
  redirectsSnippet,
  toVercelJson,
  type RedirectRule,
} from './logic';
import { CopyButton } from './ui/copy-button';

export default function CdnRedirectsLabDemo() {
  const [rules, setRules] = useState<RedirectRule[]>(defaultRedirects);
  const [pathname, setPathname] = useState('/blog/launch');

  const local = useMemo(() => applyRedirects(rules, pathname), [rules, pathname]);
  const exported = useMemo(() => toVercelJson(rules), [rules]);
  const evaluation = useMemo(
    () =>
      JSON.stringify(
        {
          ...local,
          vercelJson: exported,
          note: 'Client-side evaluation using the same rule engine as the vercel.json export.',
        },
        null,
        2,
      ),
    [local, exported],
  );

  function update(id: string, patch: Partial<RedirectRule>) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <DemoShell
      title="CDN redirects lab"
      description="Editable redirect map - vercel.json export and client-side rule evaluation."
      example={redirectsSnippet()}
      onReset={() => {
        setRules(defaultRedirects);
        setPathname('/blog/launch');
      }}
    >
      <DemoStatus tone="neutral">
        Export matches Vercel <code className="text-xs">redirects</code> config. Matching runs
        entirely in the browser via <code className="text-xs">logic.ts</code> - deploy{' '}
        <code className="text-xs">vercel.json</code> for real edge redirects.
      </DemoStatus>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="Test path">
            <Input value={pathname} onChange={(e) => setPathname(e.target.value)} className="font-mono text-xs" />
          </Field>
          <ul className="space-y-2">
            {rules.map((rule) => (
              <li key={rule.id} className="space-y-2 rounded border p-2 text-xs">
                <Input
                  className="font-mono"
                  value={rule.source}
                  aria-label="source"
                  onChange={(e) => update(rule.id, { source: e.target.value })}
                />
                <Input
                  className="font-mono"
                  value={rule.destination}
                  aria-label="destination"
                  onChange={(e) => update(rule.id, { destination: e.target.value })}
                />
                <label className="inline-flex items-center gap-2">
                  <Checkbox
                    checked={rule.permanent}
                    onCheckedChange={(c) => update(rule.id, { permanent: c === true })}
                  />
                  <Label className="text-xs font-normal">permanent (308)</Label>
                </label>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setRules((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  source: '/from',
                  destination: '/to',
                  permanent: false,
                },
              ])
            }
          >
            Add rule
          </Button>
          <p className="text-sm">
            Match:{' '}
            {local.matched
              ? `${local.status} - ${local.destination}`
              : 'no match'}
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">vercel.json export</p>
            <CopyButton value={exported} />
          </div>
          <pre className="max-h-48 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">{exported}</pre>
          <p className="text-xs font-medium">Evaluation</p>
          <pre className="max-h-48 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
            {evaluation}
          </pre>
        </div>
      </div>
    </DemoShell>
  );
}
