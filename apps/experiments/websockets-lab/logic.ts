export type RealtimeOption = {
  id: string;
  title: string;
  worksOnVercelFluid: boolean;
  notes: string;
};

export const REALTIME_OPTIONS: RealtimeOption[] = [
  {
    id: 'sse',
    title: 'Server-Sent Events / streaming Response',
    worksOnVercelFluid: true,
    notes: 'One-way server→client. Fits AI tokens, logs, progress. Supported on Fluid compute with streaming.',
  },
  {
    id: 'ws-serverless',
    title: 'Long-lived WebSocket in a Serverless Function',
    worksOnVercelFluid: false,
    notes: 'Classic serverless functions are request/response; they are not a general WebSocket host.',
  },
  {
    id: 'external-ws',
    title: 'External WS (Ably, Pusher, PartyKit, Cloudflare Durable Objects, etc.)',
    worksOnVercelFluid: true,
    notes: 'Common production pattern: Next.js app on Vercel + managed realtime elsewhere.',
  },
  {
    id: 'polling',
    title: 'Short polling / refresh',
    worksOnVercelFluid: true,
    notes: 'Simple but chatty. Fine for low-frequency status.',
  },
];

export function recommendTransport(needBidirectional: boolean, needServerPush: boolean): string {
  if (needBidirectional) return 'external-ws';
  if (needServerPush) return 'sse';
  return 'polling';
}

export function formatSseEvent(event: string, data: unknown, id?: string): string {
  const lines = [`event: ${event}`, `data: ${JSON.stringify(data)}`];
  if (id) lines.unshift(`id: ${id}`);
  return `${lines.join('\n')}\n\n`;
}

export function wsSnippet(): string {
  return `// SSE playground (honest alternative to WS on Vercel)
return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  },
});
// For full duplex WebSockets, use an external realtime provider.`;
}
