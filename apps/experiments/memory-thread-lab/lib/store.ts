import type { ChatMessage } from '../logic';

type MemThread = {
  messages: ChatMessage[];
  createdAt: number;
};

export const memoryThreads = new Map<string, MemThread>();
