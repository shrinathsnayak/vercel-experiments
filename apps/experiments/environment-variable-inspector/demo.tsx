'use client';

import { useMemo, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Field } from './ui/field';
import { Textarea } from './ui/textarea';
import {
  DUMMY_ENV_SAMPLE,
  parseEnvFile,
  redactForClient,
  serverView,
} from './logic';

export default function EnvironmentVariableInspectorDemo() {
  const [envText, setEnvText] = useState(DUMMY_ENV_SAMPLE);

  const parsed = useMemo(() => parseEnvFile(envText), [envText]);
  const clientBundle = useMemo(() => redactForClient(parsed.entries), [parsed.entries]);
  const serverBundle = useMemo(() => serverView(parsed.entries), [parsed.entries]);

  return (
    <DemoShell
      title="Environment variable inspector"
      description="Edit a dummy .env sample and compare what the server runtime vs client bundle would expose."
      example={`// Only NEXT_PUBLIC_* is inlined for the browser
const apiBase = process.env.NEXT_PUBLIC_SITE_URL;`}
      onReset={() => setEnvText(DUMMY_ENV_SAMPLE)}
    >
      <DemoStatus tone="warning">
        Hardcoded dummy values only - this demo never reads your real process.env or .env files.
      </DemoStatus>
      <Field label="Sample .env (dummy)" htmlFor="env-editor" className="mt-4">
        <Textarea
          id="env-editor"
          className="min-h-40 font-mono text-xs"
          value={envText}
          onChange={(e) => setEnvText(e.target.value)}
          spellCheck={false}
        />
      </Field>
      {parsed.errors.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs text-red-600 dark:text-red-300">
          {parsed.errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
            Client bundle view
          </h3>
          <pre className="mt-2 overflow-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs">
            {JSON.stringify(clientBundle, null, 2)}
          </pre>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
            Server runtime view
          </h3>
          <pre className="mt-2 overflow-auto rounded-md border border-fd-border bg-fd-secondary/40 p-3 text-xs">
            {JSON.stringify(serverBundle, null, 2)}
          </pre>
        </div>
      </div>
    </DemoShell>
  );
}
