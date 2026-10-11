'use client';

import { useMemo, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  analyzeViolations,
  buildCsp,
  defaultCspDirectives,
  samplePageResources,
  type CspDirectives,
} from './logic';

const directiveKeys = [
  'default-src',
  'script-src',
  'style-src',
  'img-src',
  'connect-src',
  'font-src',
  'frame-src',
] as const;

const presets: Record<string, string> = {
  'script-src': "'self' https://cdn.example.com",
  'connect-src': "'self' https://api.example.com",
  'img-src': "'self' data: https://images.example.com",
};

export default function ContentSecurityPolicyBuilderDemo() {
  const [directives, setDirectives] = useState<CspDirectives>(() => ({
    ...defaultCspDirectives,
  }));

  const policy = useMemo(() => buildCsp(directives), [directives]);
  const violations = useMemo(
    () => analyzeViolations(directives, samplePageResources),
    [directives],
  );

  function toggleSource(key: keyof CspDirectives, token: string) {
    setDirectives((prev) => {
      const current = prev[key] ?? [];
      const next = current.includes(token)
        ? current.filter((t) => t !== token)
        : [...current, token];
      return { ...prev, [key]: next };
    });
  }

  function applyPreset(key: keyof CspDirectives) {
    const text = presets[key];
    if (!text) return;
    setDirectives((prev) => ({ ...prev, [key]: text.split(/\s+/) }));
  }

  return (
    <DemoShell
      title="Content Security Policy builder"
      description="Compose a CSP string and see which sample resources would be blocked - no script execution."
      onReset={() => setDirectives({ ...defaultCspDirectives })}
    >
      <DemoStatus tone="neutral">
        Static analysis on a fixed sample page - user-supplied scripts are never executed.
      </DemoStatus>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          {directiveKeys.map((key) => (
            <fieldset key={key} className="rounded-md border border-fd-border p-2 text-xs">
              <legend className="px-1 font-semibold">{key}</legend>
              <div className="flex flex-wrap gap-2">
                {["'self'", "'unsafe-inline'", "'none'", 'https://cdn.example.com', 'data:'].map(
                  (token) => (
                    <label key={token} className="inline-flex items-center gap-1.5">
                      <Checkbox
                        checked={(directives[key] ?? []).includes(token)}
                        onCheckedChange={() => toggleSource(key, token)}
                      />
                      <span className="font-mono">{token}</span>
                    </label>
                  ),
                )}
              </div>
              {presets[key] ? (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="mt-2"
                  onClick={() => applyPreset(key)}
                >
                  Apply sample preset
                </Button>
              ) : null}
            </fieldset>
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
            Policy string
          </h3>
          <pre className="overflow-x-auto rounded-md border border-fd-border bg-fd-muted/20 p-2 text-xs">
            {policy || '(empty policy)'}
          </pre>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
            Sample page resources
          </h3>
          <ul className="space-y-1 text-xs">
            {samplePageResources.map((r) => (
              <li key={r.id} className="font-mono text-fd-muted-foreground">
                {r.label}: {r.source}
              </li>
            ))}
          </ul>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
            Would be blocked
          </h3>
          {violations.length === 0 ? (
            <p className="text-xs text-fd-muted-foreground">No violations for the sample page.</p>
          ) : (
            <ul className="space-y-1 text-xs">
              {violations.map((v) => (
                <li key={v.resourceId} className="rounded border border-fd-border px-2 py-1">
                  <span className="font-medium">{v.label}</span>
                  <p className="text-fd-muted-foreground">{v.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
