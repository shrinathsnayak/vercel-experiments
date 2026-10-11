export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type DiffResult = {
  summary: string;
  changes: string[];
  risks: string[];
};

export function isImageFilename(name: string): boolean {
  return /\.(png|jpe?g|webp|gif)$/i.test(name);
}

export function clampDiff(d: DiffResult): DiffResult {
  return {
    summary: d.summary.trim().slice(0, 400),
    changes: d.changes.map((c) => c.trim()).filter(Boolean).slice(0, 12),
    risks: d.risks.map((c) => c.trim()).filter(Boolean).slice(0, 8),
  };
}
