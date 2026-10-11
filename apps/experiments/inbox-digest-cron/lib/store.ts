import type { DigestResult, InboxMessage } from '../logic';

export const memoryMessages: InboxMessage[] = [];
export let memoryDigest: DigestResult | null = null;

export function setMemoryMessages(next: InboxMessage[]) {
  memoryMessages.length = 0;
  memoryMessages.push(...next);
}

export function setMemoryDigest(digest: DigestResult | null) {
  memoryDigest = digest;
}
