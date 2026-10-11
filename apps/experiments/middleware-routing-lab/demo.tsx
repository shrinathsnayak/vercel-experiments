'use client';

import { useMemo, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Field } from './ui/field';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  defaultRules,
  evaluateRequest,
  type RequestInput,
  type RoutingRule,
  type RuleType,
} from './logic';

export default function MiddlewareRoutingLabDemo() {
  const [pathname, setPathname] = useState('/docs/guide');
  const [rules, setRules] = useState<RoutingRule[]>(defaultRules);

  const request: RequestInput = useMemo(
    () => ({ pathname, headers: {}, cookies: {} }),
    [pathname],
  );

  const decision = useMemo(() => evaluateRequest(rules, request), [rules, request]);

  function updateRule(id: string, patch: Partial<RoutingRule>) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRule() {
    setRules((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: 'header' as RuleType,
        match: 'x-demo',
        value: '1',
        enabled: true,
      },
    ]);
  }

  return (
    <DemoShell
      title="Proxy routing lab"
      description="Simulator for Next.js Proxy-style rules (rewrite, redirect, locale, headers, cookies, flags)."
      example={`// proxy.ts evaluates rules before route handlers\nexport default function proxy(request) {\n  // rewrite /docs - /content/docs\n}`}
      onReset={() => {
        setPathname('/docs/guide');
        setRules(defaultRules);
      }}
    >
      <DemoStatus tone="warning">
        Simulator only - does not execute real proxy.ts in this preview.
      </DemoStatus>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="Request path" htmlFor="path-input">
            <Input
              id="path-input"
              className="text-xs"
              value={pathname}
              onChange={(e) => setPathname(e.target.value)}
            />
          </Field>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
              Rules
            </h3>
            <Button type="button" variant="outline" size="sm" onClick={addRule}>
              Add rule
            </Button>
          </div>
          <ul className="space-y-2">
            {rules.map((rule) => (
              <li key={rule.id} className="rounded-md border border-fd-border p-2 text-xs">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Select
                    value={rule.type}
                    onValueChange={(v) => updateRule(rule.id, { type: v as RuleType })}
                  >
                    <SelectTrigger className="w-full text-xs" aria-label="Rule type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rewrite">rewrite</SelectItem>
                      <SelectItem value="redirect">redirect</SelectItem>
                      <SelectItem value="locale">locale</SelectItem>
                      <SelectItem value="header">header</SelectItem>
                      <SelectItem value="cookie">cookie</SelectItem>
                      <SelectItem value="feature-flag">feature-flag</SelectItem>
                    </SelectContent>
                  </Select>
                  <label className="inline-flex items-center gap-1.5">
                    <Checkbox
                      checked={rule.enabled}
                      onCheckedChange={(checked) =>
                        updateRule(rule.id, { enabled: checked === true })
                      }
                    />
                    <Label className="text-xs font-normal">Enabled</Label>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    className="text-xs"
                    value={rule.match}
                    aria-label="Match pattern"
                    onChange={(e) => updateRule(rule.id, { match: e.target.value })}
                    placeholder="match"
                  />
                  <Input
                    className="text-xs"
                    value={rule.value}
                    aria-label="Rule value"
                    onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                    placeholder="value"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
            Decision
          </h3>
          <pre className="overflow-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs">
            {JSON.stringify(decision, null, 2)}
          </pre>
        </div>
      </div>
    </DemoShell>
  );
}
