import { formatSseEvent } from '../../../logic';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let closed = false;
  const stream = new ReadableStream({
    start(controller) {
      let n = 0;
      controller.enqueue(
        encoder.encode(
          formatSseEvent('hello', {
            message: 'SSE playground - not a WebSocket',
            note: 'Labeled honestly vs WebSockets. Use external WS for full duplex.',
          }),
        ),
      );
      const timer = setInterval(() => {
        if (closed) return;
        n += 1;
        controller.enqueue(encoder.encode(formatSseEvent('tick', { n, at: Date.now() }, String(n))));
        if (n >= 8) {
          clearInterval(timer);
          controller.enqueue(encoder.encode(formatSseEvent('done', { n })));
          controller.close();
        }
      }, 500);
      request.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(timer);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
