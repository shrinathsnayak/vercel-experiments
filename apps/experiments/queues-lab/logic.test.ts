import { describe, expect, it } from 'vitest';
import { TopicSimulator } from './logic';

describe('TopicSimulator', () => {
  it('fans out to every consumer group', () => {
    const topic = new TopicSimulator(['a', 'b']);
    const { messageIds, deduped } = topic.publish({
      topic: 'orders',
      payload: { id: 1 },
    });
    expect(deduped).toBe(false);
    expect(messageIds).toHaveLength(2);
    expect(topic.list()).toHaveLength(2);
  });

  it('dedupes by idempotency key', () => {
    const topic = new TopicSimulator(['only']);
    topic.publish({ topic: 'orders', payload: {}, idempotencyKey: 'k1' });
    const second = topic.publish({ topic: 'orders', payload: {}, idempotencyKey: 'k1' });
    expect(second.deduped).toBe(true);
    expect(topic.list()).toHaveLength(1);
  });

  it('retries until max attempts then expires', () => {
    const topic = new TopicSimulator(['only']);
    const { messageIds } = topic.publish({ topic: 'orders', payload: {} });
    const id = messageIds[0]!;
    expect(topic.consume(id, false, 2)?.status).toBe('retrying');
    expect(topic.consume(id, false, 2)?.status).toBe('expired');
  });
});
