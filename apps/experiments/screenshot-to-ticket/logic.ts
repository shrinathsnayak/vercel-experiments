export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type BugTicket = {
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  steps: string[];
  expected: string;
  actual: string;
};

export function isImageFilename(name: string): boolean {
  return /\.(png|jpe?g|webp|gif)$/i.test(name);
}

export function clampTicket(t: BugTicket): BugTicket {
  const sev = ['low', 'medium', 'high', 'critical'].includes(t.severity) ? t.severity : 'medium';
  return {
    title: t.title.trim().slice(0, 120),
    severity: sev as BugTicket['severity'],
    summary: t.summary.trim().slice(0, 400),
    steps: t.steps.map((s) => s.trim()).filter(Boolean).slice(0, 10),
    expected: t.expected.trim().slice(0, 240),
    actual: t.actual.trim().slice(0, 240),
  };
}
