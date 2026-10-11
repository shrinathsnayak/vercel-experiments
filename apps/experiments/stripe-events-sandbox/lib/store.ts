import type { EventLogEntry } from '../logic';

/** Process-local idempotency + event log when Redis is not configured. */
export const memorySeenIds = new Set<string>();
export const memoryEvents: EventLogEntry[] = [];
