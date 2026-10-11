export const MAX_PROMPT_CHARS = 4_000;
export const MAX_ITEMS = 12;

export type ChecklistItem = {
  title: string;
  detail?: string;
};

export function truncateText(text: string, max = MAX_PROMPT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function clampItems(items: ChecklistItem[]): ChecklistItem[] {
  return items.slice(0, MAX_ITEMS).map((item) => ({
    title: item.title.trim(),
    detail: item.detail?.trim() || undefined,
  }));
}

/** Merge partial streamObject payloads into a stable item list for the UI. */
export function mergePartialChecklist(
  partial: { items?: Array<{ title?: string; detail?: string }> } | null,
): ChecklistItem[] {
  if (!partial?.items?.length) return [];
  return clampItems(
    partial.items
      .filter((item): item is { title: string; detail?: string } =>
        Boolean(item?.title?.trim()),
      )
      .map((item) => ({
        title: item.title,
        detail: item.detail,
      })),
  );
}

export const SAMPLE_PROMPT =
  'Prepare a launch checklist for shipping a Next.js experiment demo with AI Gateway, honest 503s, and a docs MDX page.';
