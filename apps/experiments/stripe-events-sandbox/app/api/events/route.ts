import { getRedis } from '../../../lib/redis';
import { memoryEvents, memorySeenIds } from '../../../lib/store';
import {
  clampEvents,
  eventIdFromBody,
  eventTypeFromBody,
  SAMPLE_SECRET,
  truncateBody,
  verifyStripeSignature,
  type EventLogEntry,
} from '../../../logic';

const EVENTS_KEY = 'stripe-events-sandbox:log';
const SEEN_KEY = 'stripe-events-sandbox:seen';

function storageLabel(): 'redis' | 'memory' {
  return getRedis() ? 'redis' : 'memory';
}

function resolveSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || SAMPLE_SECRET;
}

async function loadEvents(): Promise<EventLogEntry[]> {
  const redis = getRedis();
  if (redis) {
    return clampEvents((await redis.get<EventLogEntry[]>(EVENTS_KEY)) ?? []);
  }
  return clampEvents(memoryEvents);
}

async function saveEvents(events: EventLogEntry[]) {
  const next = clampEvents(events);
  const redis = getRedis();
  if (redis) {
    await redis.set(EVENTS_KEY, next);
    return;
  }
  memoryEvents.length = 0;
  memoryEvents.push(...next);
}

async function hasSeen(id: string): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    return Boolean(await redis.sismember(SEEN_KEY, id));
  }
  return memorySeenIds.has(id);
}

async function markSeen(id: string) {
  const redis = getRedis();
  if (redis) {
    await redis.sadd(SEEN_KEY, id);
    return;
  }
  memorySeenIds.add(id);
}

export async function GET() {
  return Response.json({
    events: await loadEvents(),
    storage: storageLabel(),
    secretHint: process.env.STRIPE_WEBHOOK_SECRET?.trim()
      ? 'Using STRIPE_WEBHOOK_SECRET'
      : `Using demo secret ${SAMPLE_SECRET}`,
    note:
      storageLabel() === 'memory'
        ? 'Redis not configured - event log is process-local.'
        : undefined,
  });
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const bodyObj = json as Record<string, unknown>;
  const rawBody =
    typeof bodyObj.rawBody === 'string'
      ? truncateBody(bodyObj.rawBody)
      : typeof bodyObj.event === 'object' && bodyObj.event
        ? truncateBody(JSON.stringify(bodyObj.event))
        : '';
  const signatureHeader =
    typeof bodyObj.signature === 'string'
      ? bodyObj.signature
      : request.headers.get('stripe-signature') || '';

  if (!rawBody) {
    return Response.json(
      { error: 'Provide rawBody (string) or event (object).' },
      { status: 400 },
    );
  }

  const secret = resolveSecret();
  const nowSeconds = Math.floor(Date.now() / 1000);
  const verified = await verifyStripeSignature({
    secret,
    body: rawBody,
    header: signatureHeader,
    nowSeconds,
  });

  const eventId = eventIdFromBody(rawBody) || `anon-${Date.now()}`;
  const type = eventTypeFromBody(rawBody);
  const duplicate = verified.ok ? await hasSeen(eventId) : false;

  if (verified.ok && !duplicate) {
    await markSeen(eventId);
  }

  const entry: EventLogEntry = {
    id: eventId,
    type,
    verified: verified.ok,
    duplicate,
    reason: verified.ok ? undefined : verified.reason,
    receivedAt: new Date().toISOString(),
  };

  const events = await loadEvents();
  events.unshift(entry);
  await saveEvents(events);

  if (!verified.ok) {
    return Response.json(
      {
        error: 'Signature verification failed',
        reason: verified.reason,
        entry,
        events: await loadEvents(),
        storage: storageLabel(),
      },
      { status: 400 },
    );
  }

  return Response.json({
    entry,
    events: await loadEvents(),
    storage: storageLabel(),
    note: duplicate ? 'Duplicate event id — logged but not re-processed.' : undefined,
  });
}
