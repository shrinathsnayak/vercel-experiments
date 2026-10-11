'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { DemoShell, DemoStatus } from './ui/demo-shell';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { Slider } from './ui/slider';
import { cn } from './ui/utils';
import { buildBlockingTimeline, buildStreamingTimeline } from './logic';

export default function StreamingSsrPlaygroundDemo() {
  const [headerMs, setHeaderMs] = useState(200);
  const [mainMs, setMainMs] = useState(600);
  const [footerMs, setFooterMs] = useState(300);

  const delays = useMemo(
    () => ({ header: headerMs, main: mainMs, footer: footerMs }),
    [headerMs, mainMs, footerMs],
  );

  const blocking = useMemo(() => buildBlockingTimeline(delays), [delays]);
  const streaming = useMemo(() => buildStreamingTimeline(delays), [delays]);

  const blockingTtfb = blocking.at(-1)?.ms ?? 0;
  const streamingFirstByte = streaming[1]?.ms ?? 0;

  return (
    <DemoShell
      title="Streaming SSR playground"
      description="Educational Suspense timeline - simulated milliseconds, not production measurements."
      onReset={() => {
        setHeaderMs(200);
        setMainMs(600);
        setFooterMs(300);
      }}
    >
      <DemoStatus tone="warning">
        Timelines are simulated for teaching. For a real Suspense demo, open the stream demo page.
      </DemoStatus>
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <DelayField label="Header delay (ms)" value={headerMs} onChange={setHeaderMs} />
          <DelayField label="Main delay (ms)" value={mainMs} onChange={setMainMs} />
          <DelayField label="Footer delay (ms)" value={footerMs} onChange={setFooterMs} />
        </div>
        <p className="text-xs text-fd-muted-foreground">
          Blocking time-to-first-byte (simulated):{' '}
          <strong>{blockingTtfb}ms</strong> · Streaming first content slot:{' '}
          <strong>{streamingFirstByte}ms</strong>
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <TimelineCard title="Blocking SSR" events={blocking} />
          <TimelineCard title="Streaming SSR + Suspense" events={streaming} />
        </div>
        <Button variant="link" size="sm" className="h-auto p-0 text-sm" asChild>
          <Link href="/stream-demo">Open live Suspense stream demo - </Link>
        </Button>
      </div>
    </DemoShell>
  );
}

function DelayField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label}>
      <Slider
        min={50}
        max={1200}
        step={50}
        value={[value]}
        onValueChange={(v) => onChange(v[0] ?? value)}
      />
      <span className="text-xs text-fd-muted-foreground">{value}ms</span>
    </Field>
  );
}

function TimelineCard({
  title,
  events,
}: {
  title: string;
  events: ReturnType<typeof buildBlockingTimeline>;
}) {
  const max = events.at(-1)?.ms || 1;
  return (
    <div className="rounded-md border border-fd-border p-3">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <ul className="space-y-2">
        {events.map((event) => (
          <li key={`${event.phase}-${event.ms}`} className="text-xs">
            <div className="mb-1 flex justify-between font-mono text-fd-muted-foreground">
              <span>{event.phase}</span>
              <span>{event.ms}ms</span>
            </div>
            <div className="h-2 rounded bg-fd-muted/50">
              <div
                className={cn(
                  'h-2 rounded',
                  event.mode === 'blocking' ? 'bg-neutral-500' : 'bg-neutral-800 dark:bg-neutral-200',
                )}
                style={{ width: `${Math.max(8, (event.ms / max) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-fd-muted-foreground">{event.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
