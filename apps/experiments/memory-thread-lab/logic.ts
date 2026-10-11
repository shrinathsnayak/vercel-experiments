export const MAX_MESSAGE_CHARS = 4_000;
export const MAX_TURNS = 24;
export const THREAD_TTL_SECONDS = 60 * 15;
export const THREAD_KEY_PREFIX = 'experiments:memory-thread:';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
  at: string;
};

export type ThreadState = {
  id: string;
  messages: ChatMessage[];
  storage: 'redis' | 'memory';
  ttlSeconds: number | null;
  expiresAt: string | null;
};

export function truncateText(text: string, max = MAX_MESSAGE_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function clampMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.slice(-MAX_TURNS);
}

export function newThreadId(): string {
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ttlVisualization(ttlSeconds: number | null, expiresAt: string | null): {
  label: string;
  remainingSeconds: number | null;
} {
  if (ttlSeconds == null || !expiresAt) {
    return { label: 'No TTL (in-memory / process lifetime)', remainingSeconds: null };
  }
  const remaining = Math.max(0, Math.floor((Date.parse(expiresAt) - Date.now()) / 1000));
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return {
    label: `TTL ${ttlSeconds}s · ~${mins}m ${secs}s remaining`,
    remainingSeconds: remaining,
  };
}

export const SAMPLE_PROMPT = 'Remember that my favorite deploy target is Vercel. What should I try next?';
