export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const SAMPLE_STRATEGY = "Become the default way teams learn Vercel platform patterns. Grow catalog depth, keep demos honest, and reduce time-to-first-deploy.";
export function validateOkrShape(obj: { objectives?: unknown }): boolean {
  return Array.isArray(obj.objectives) && obj.objectives.length > 0;
}
