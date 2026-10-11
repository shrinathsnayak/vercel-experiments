export const MAX_INPUT_CHARS = 8_000;

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export const SAMPLE_INCIDENT = "14:02 deploy started\n14:11 p95 latency spiked\n14:20 rollback\nSuspected connection pool exhaustion after traffic surge.";
export function parseTimelineLines(text: string): Array<{ time: string; event: string }> {
  const out: Array<{ time: string; event: string }> = [];
  for (const line of truncateText(text).split(/\n/)) {
    const m = line.match(/^(\d{1,2}:\d{2})\s+(.+)$/);
    if (m) out.push({ time: m[1], event: m[2].trim() });
  }
  return out;
}
