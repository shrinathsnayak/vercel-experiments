export type ProcessedEntry = {
  messageId: string;
  orderId: string;
  receivedAt: string;
  source: 'queue-callback' | 'simulator';
};

const globalForQueues = globalThis as typeof globalThis & {
  __queuesLabLog?: ProcessedEntry[];
};

function store(): ProcessedEntry[] {
  if (!globalForQueues.__queuesLabLog) {
    globalForQueues.__queuesLabLog = [];
  }
  return globalForQueues.__queuesLabLog;
}

export function recordProcessed(entry: ProcessedEntry) {
  store().unshift(entry);
  if (store().length > 50) store().length = 50;
}

export function listProcessed(limit = 20): ProcessedEntry[] {
  return store().slice(0, limit);
}
