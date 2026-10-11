export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const SAMPLE_NOTES = "Us: Edge-first Next.js hosting with AI Gateway.\nThem: Generic VMs + DIY CDN.\nAudience: product engineers shipping weekly.";
