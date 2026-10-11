export const MAX_DESC = 4_000;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const MERMAID_CAVEAT =
  'Draft Mermaid only — shapes/labels may be incomplete. Review before publishing.';

export type MermaidResult = {
  mermaid: string;
  caveat: string;
  notes: string[];
};

export function truncateDesc(text: string): string {
  return text.trim().slice(0, MAX_DESC);
}

export function isImageFilename(name: string): boolean {
  return /\.(png|jpe?g|webp|gif)$/i.test(name);
}

export function clampMermaid(r: MermaidResult): MermaidResult {
  return {
    mermaid: r.mermaid.trim().slice(0, 6_000),
    caveat: MERMAID_CAVEAT,
    notes: r.notes.map((n) => n.trim()).filter(Boolean).slice(0, 8),
  };
}

export const SAMPLE_DESC = 'Checkout flow: User adds cart → Payment API → Stripe → Webhook → Order DB → Email.';
