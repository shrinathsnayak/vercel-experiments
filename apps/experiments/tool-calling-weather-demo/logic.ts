export const MAX_PROMPT_CHARS = 2_000;

export type ToolTraceEntry = {
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
};

export function truncateText(text: string, max = MAX_PROMPT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function mockWeather(city: string): { city: string; tempC: number; condition: string } {
  const key = city.trim().toLowerCase() || 'unknown';
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  const temps = [8, 12, 18, 22, 27, 31];
  const conditions = ['clear', 'cloudy', 'rain', 'windy', 'fog'];
  return {
    city: key === 'unknown' ? 'Unknown' : key,
    tempC: temps[hash % temps.length]!,
    condition: conditions[hash % conditions.length]!,
  };
}

export function mockTime(timezone: string): { timezone: string; iso: string; note: string } {
  const tz = timezone.trim() || 'UTC';
  try {
    const iso = new Date().toLocaleString('en-US', { timeZone: tz, hour12: false });
    return { timezone: tz, iso, note: 'Mock wall-clock via Intl (server local offset applied).' };
  } catch {
    return { timezone: tz, iso: new Date().toISOString(), note: 'Invalid timezone - fell back to UTC ISO.' };
  }
}

export function mockCalc(expression: string): { expression: string; result: number | null; error?: string } {
  const expr = expression.replace(/\s+/g, '');
  if (!/^[0-9.+\-*/()]+$/.test(expr) || expr.length > 64) {
    return { expression, result: null, error: 'Only digits and + - * / ( ) allowed.' };
  }
  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expr})`)() as number;
    if (typeof result !== 'number' || !Number.isFinite(result)) {
      return { expression, result: null, error: 'Non-finite result.' };
    }
    return { expression, result };
  } catch {
    return { expression, result: null, error: 'Could not evaluate.' };
  }
}

export const SAMPLE_PROMPT = 'What is the weather in Lisbon, what time is it in Europe/Lisbon, and what is 19 * 3?';
