export const MAX_POLICY_CHARS = 18_000;
export const MAX_BULLETS = 16;

export type PolicySummary = {
  plainSummary: string;
  bullets: string[];
  watchOuts: string[];
};

export function truncateText(text: string, max = MAX_POLICY_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function clampSummary(summary: PolicySummary): PolicySummary {
  return {
    plainSummary: summary.plainSummary.trim(),
    bullets: summary.bullets.map((b) => b.trim()).filter(Boolean).slice(0, MAX_BULLETS),
    watchOuts: summary.watchOuts.map((b) => b.trim()).filter(Boolean).slice(0, 8),
  };
}

export const SAMPLE_POLICY = `PRIVACY POLICY (excerpt)

We collect account email, usage analytics, and support messages. Data is processed in the United States and the EU. We share data with payment processors and cloud hosts under data processing agreements. You may request deletion of personal data except records we must keep for legal compliance (up to 7 years). We use cookies for session auth and optional product analytics; you can disable non-essential cookies in settings. We do not sell personal information. Contact privacy@example.com for requests.`;
