import { handleCallback } from '@vercel/queue';
import { recordProcessed } from '../../../../lib/memory-log';

type OrderPayload = {
  orderId?: string;
  status?: string;
};

/**
 * Private push consumer - invoked by Vercel Queues via experimentalTriggers.
 * Not meant to be called from the public internet.
 */
export const POST = handleCallback(async (order: OrderPayload, metadata) => {
  const orderId =
    typeof order?.orderId === 'string' && order.orderId.length > 0
      ? order.orderId
      : 'unknown';

  recordProcessed({
    messageId: metadata.messageId,
    orderId,
    receivedAt: new Date().toISOString(),
    source: 'queue-callback',
  });
});
