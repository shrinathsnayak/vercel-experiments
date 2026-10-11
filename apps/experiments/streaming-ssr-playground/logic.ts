export type RenderPhase = 'shell' | 'header' | 'main' | 'footer' | 'complete';

export type TimelineEvent = {
  ms: number;
  phase: RenderPhase;
  mode: 'blocking' | 'streaming';
  detail: string;
};

/** Simulated render timeline - not measured server timings. */
export function buildBlockingTimeline(delays: {
  header: number;
  main: number;
  footer: number;
}): TimelineEvent[] {
  const endHeader = delays.header;
  const endMain = endHeader + delays.main;
  const endFooter = endMain + delays.footer;
  return [
    { ms: 0, phase: 'shell', mode: 'blocking', detail: 'Request starts - browser waits for full HTML.' },
    { ms: endHeader, phase: 'header', mode: 'blocking', detail: 'Header data resolved (still blocked).' },
    { ms: endMain, phase: 'main', mode: 'blocking', detail: 'Main content resolved (still blocked).' },
    { ms: endFooter, phase: 'footer', mode: 'blocking', detail: 'Footer resolved.' },
    {
      ms: endFooter,
      phase: 'complete',
      mode: 'blocking',
      detail: 'Full document flushed to client.',
    },
  ];
}

export function buildStreamingTimeline(delays: {
  header: number;
  main: number;
  footer: number;
}): TimelineEvent[] {
  return [
    { ms: 0, phase: 'shell', mode: 'streaming', detail: 'Shell HTML streamed immediately.' },
    {
      ms: delays.header,
      phase: 'header',
      mode: 'streaming',
      detail: 'Suspense boundary: header slot resolved.',
    },
    {
      ms: delays.header + delays.main,
      phase: 'main',
      mode: 'streaming',
      detail: 'Suspense boundary: main slot resolved.',
    },
    {
      ms: delays.header + delays.main + delays.footer,
      phase: 'footer',
      mode: 'streaming',
      detail: 'Suspense boundary: footer slot resolved.',
    },
    {
      ms: delays.header + delays.main + delays.footer,
      phase: 'complete',
      mode: 'streaming',
      detail: 'All boundaries complete.',
    },
  ];
}
