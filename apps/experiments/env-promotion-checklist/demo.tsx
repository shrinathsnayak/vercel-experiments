'use client';

import { useMemo, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import {
  compareEnvChecklists,
  SAMPLE_PREVIEW,
  SAMPLE_PRODUCTION,
  SAMPLE_REQUIRED,
} from './logic';

export default function EnvPromotionChecklistDemo() {
  const [required, setRequired] = useState(SAMPLE_REQUIRED);
  const [preview, setPreview] = useState(SAMPLE_PREVIEW);
  const [production, setProduction] = useState(SAMPLE_PRODUCTION);
  const [ran, setRan] = useState(false);

  const rows = useMemo(() => {
    if (!ran) return [];
    return compareEnvChecklists(
      preview,
      production,
      required.split(/\n|,/).map((s) => s.trim()).filter(Boolean),
    );
  }, [ran, preview, production, required]);

  return (
    <DemoShell
      title="Env promotion checklist"
      description="Compare required environment variables across Preview vs Production — values redacted."
      onReset={() => {
        setRequired(SAMPLE_REQUIRED);
        setPreview(SAMPLE_PREVIEW);
        setProduction(SAMPLE_PRODUCTION);
        setRan(false);
      }}
    >
      <div className="space-y-4">
        <Field label="Required keys (one per line)" htmlFor="req">
          <Textarea id="req" value={required} onChange={(e) => setRequired(e.target.value)} className="min-h-24 font-mono text-xs" />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Preview .env" htmlFor="prev">
            <Textarea id="prev" value={preview} onChange={(e) => setPreview(e.target.value)} className="min-h-40 font-mono text-xs" />
          </Field>
          <Field label="Production .env" htmlFor="prod">
            <Textarea id="prod" value={production} onChange={(e) => setProduction(e.target.value)} className="min-h-40 font-mono text-xs" />
          </Field>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => setRan(true)}>
          Compare (redacted)
        </Button>
        <DemoStatus tone="warning">Values never leave the browser in this demo — only redacted previews are shown.</DemoStatus>
        {rows.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-fd-muted-foreground">
                <th className="py-1">Key</th>
                <th>Preview</th>
                <th>Production</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-t border-fd-border align-top">
                  <td className="py-2 pr-2 font-mono text-xs">{r.key}</td>
                  <td className="pr-2 font-mono text-xs">{r.previewValue || '—'}</td>
                  <td className="pr-2 font-mono text-xs">{r.productionValue || '—'}</td>
                  <td className="text-xs">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </DemoShell>
  );
}
