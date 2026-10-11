'use client';

import { useMemo, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import {
  defaultRoutes,
  defaultZones,
  microfrontendsSnippet,
  resolveZone,
  zoneRewrites,
} from './logic';

export default function MicrofrontendsZonesLabDemo() {
  const [path, setPath] = useState('/docs/intro');
  const route = useMemo(() => resolveZone(path), [path]);
  const rewrites = useMemo(() => zoneRewrites(defaultZones), []);

  return (
    <DemoShell
      title="Microfrontends / zones lab"
      description="Shell + zone child contract demo explaining Vercel microfrontends/zones."
      example={microfrontendsSnippet()}
      onReset={() => setPath('/docs/intro')}
    >
      <DemoStatus tone="warning">
        Educational demo: the child is an iframe to a same-app route. Production zones use path-based multi-project routing, not iframes.
      </DemoStatus>
      <div className="mt-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {defaultRoutes.map((r) => (
            <Button
              key={r.path}
              type="button"
              size="sm"
              variant={route.zone === r.zone ? 'default' : 'outline'}
              onClick={() => setPath(r.path === '/' ? '/' : `${r.path}/intro`)}
            >
              {r.zone}
            </Button>
          ))}
        </div>
        <div className="rounded-lg border">
          <div className="flex items-center justify-between border-b px-3 py-2 text-xs">
            <span className="font-medium">Shell chrome</span>
            <span className="text-muted-foreground">path {path} - zone {route.zone}</span>
          </div>
          <iframe
            title="zone-child"
            src={`/zone-child?zone=${encodeURIComponent(route.zone)}`}
            className="h-64 w-full"
          />
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Zone contracts</p>
            <ul className="space-y-2 text-xs">
              {defaultZones.map((z) => (
                <li key={z.name} className="rounded border p-2">
                  <p className="font-medium">
                    {z.name} · {z.basePath}
                  </p>
                  <p className="text-muted-foreground">{z.origin}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Rewrite sketch</p>
            <pre className="max-h-56 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
              {JSON.stringify({ rewrites }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </DemoShell>
  );
}
