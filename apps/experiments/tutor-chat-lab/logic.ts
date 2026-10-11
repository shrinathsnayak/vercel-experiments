export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const MAX_TOPIC_CHARS = 200;
export const MAX_MESSAGE_CHARS = 2_000;
export const MAX_HISTORY = 12;
export const SAMPLE_TOPIC = "How binary search works";
export type ChatMessage = { role: 'user' | 'assistant'; content: string };
export function normalizeHistory(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) return [];
  const out: ChatMessage[] = [];
  for (const item of messages.slice(-MAX_HISTORY)) {
    if (!item || typeof item !== 'object') continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') continue;
    const text = truncateText(content, MAX_MESSAGE_CHARS);
    if (text) out.push({ role, content: text });
  }
  return out;
}
