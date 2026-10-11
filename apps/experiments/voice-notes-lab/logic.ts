export const MAX_TRANSCRIPT_CHARS = 12_000;

export type VoiceChapter = {
  title: string;
  startHint: string;
  summary: string;
};

export type VoiceActions = {
  chapters: VoiceChapter[];
  summary: string;
  actions: string[];
};

export function truncateText(text: string, max = MAX_TRANSCRIPT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function clampVoiceResult(result: VoiceActions): VoiceActions {
  return {
    summary: result.summary.trim(),
    chapters: result.chapters.slice(0, 8).map((c) => ({
      title: c.title.trim(),
      startHint: c.startHint.trim(),
      summary: c.summary.trim(),
    })),
    actions: result.actions
      .slice(0, 10)
      .map((a) => a.trim())
      .filter(Boolean),
  };
}

export const SAMPLE_TRANSCRIPT = `Okay team, quick sync. First, the waitlist page is live and referrals are working.
Second, we still need design review on the job queue progress UI by Thursday.
Third, Stripe webhook signature verification is done — please don't skip idempotency keys.
Action for Maya: file the severity ticket for the broken screenshot upload.
I'll summarize in Slack after this.`;
