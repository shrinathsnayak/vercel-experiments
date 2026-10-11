export type QueueMessage = {
  messageId: string;
  topic: string;
  payload: Record<string, unknown>;
  publishedAt: string;
  consumerGroup: string;
  attempts: number;
  status: 'pending' | 'processing' | 'acked' | 'retrying' | 'expired';
};

export type PublishOptions = {
  topic: string;
  payload: Record<string, unknown>;
  idempotencyKey?: string;
  delaySeconds?: number;
};

/** In-memory educational model of topic → fan-out consumer groups. */
export class TopicSimulator {
  private messages: QueueMessage[] = [];
  private seenIds = new Set<string>();
  private seq = 0;

  constructor(private readonly consumerGroups: string[] = ['fulfillment', 'analytics']) { }

  publish(input: PublishOptions): { messageIds: string[]; deduped: boolean } {
    if (input.idempotencyKey && this.seenIds.has(input.idempotencyKey)) {
      return { messageIds: [], deduped: true };
    }
    if (input.idempotencyKey) this.seenIds.add(input.idempotencyKey);

    const messageIds: string[] = [];
    const publishedAt = new Date().toISOString();
    for (const group of this.consumerGroups) {
      this.seq += 1;
      const messageId = `msg_${this.seq.toString(36)}`;
      messageIds.push(messageId);
      this.messages.unshift({
        messageId,
        topic: input.topic,
        payload: input.payload,
        publishedAt,
        consumerGroup: group,
        attempts: 0,
        status: input.delaySeconds && input.delaySeconds > 0 ? 'pending' : 'pending',
      });
    }
    return { messageIds, deduped: false };
  }

  /** Simulate a consumer attempt: success acks; failure increments attempts / retry. */
  consume(messageId: string, succeed: boolean, maxAttempts = 3): QueueMessage | null {
    const msg = this.messages.find((m) => m.messageId === messageId);
    if (!msg) return null;
    msg.attempts += 1;
    if (succeed) {
      msg.status = 'acked';
    } else if (msg.attempts >= maxAttempts) {
      msg.status = 'expired';
    } else {
      msg.status = 'retrying';
    }
    return { ...msg };
  }

  list(limit = 20): QueueMessage[] {
    return this.messages.slice(0, limit);
  }
}

export function queuesProducerSnippet(): string {
  return `import { send } from '@vercel/queue';

const { messageId } = await send('experiments-orders', {
  orderId: 'order_123',
  status: 'ready',
});`;
}

export function queuesConsumerSnippet(): string {
  return `import { handleCallback } from '@vercel/queue';

export const POST = handleCallback(async (order, metadata) => {
  console.log('Fulfilling', metadata.messageId, order);
});

// vercel.json
// { "functions": { "app/api/queues/fulfill/route.ts": {
//   "experimentalTriggers": [{ "type": "queue/v2beta", "topic": "experiments-orders" }]
// }}}`;
}

export const QUEUE_TOPIC = 'experiments-orders';

export const QUEUES_SETUP_REQUIREMENTS = [
  'Install @vercel/queue and deploy (or vercel link + vercel env pull for OIDC locally).',
  'Configure the consumer with experimentalTriggers type queue/v2beta in vercel.json.',
  'Make handlers idempotent - Queues delivers at-least-once with automatic retries.',
] as const;
