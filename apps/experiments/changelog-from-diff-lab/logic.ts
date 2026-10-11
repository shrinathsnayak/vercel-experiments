export const MAX_DIFF_CHARS = 20_000;

export type ChangelogResult = {
  customerFacing: string[];
  internalNotes: string[];
};

export function truncateText(text: string, max = MAX_DIFF_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function clampChangelog(result: ChangelogResult): ChangelogResult {
  return {
    customerFacing: result.customerFacing
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 12),
    internalNotes: result.internalNotes
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 12),
  };
}

export const SAMPLE_DIFF = `commit abc123 Add Redis FAQ cache
diff --git a/app/api/faq/route.ts b/app/api/faq/route.ts
+ await redis.set(key, faqs, { ex: 3600 })
+ return cached FAQ when hash matches

commit def456 Fix honest 503 copy
- Invent sample FAQ when offline
+ Return 503 with setup instructions when AI provider missing`;
