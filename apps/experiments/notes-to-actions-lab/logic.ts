export const MAX_NOTES_CHARS = 12_000;
export const MAX_ACTIONS = 20;

export type ActionStatus = 'open' | 'done';

export type ActionItem = {
  id: string;
  title: string;
  owner?: string;
  due?: string;
  status: ActionStatus;
};

export function truncateText(text: string, max = MAX_NOTES_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function normalizeAction(
  item: Omit<ActionItem, 'id' | 'status'> & { id?: string; status?: ActionStatus },
  index: number,
): ActionItem {
  return {
    id: item.id?.trim() || `action-${index + 1}`,
    title: item.title.trim(),
    owner: item.owner?.trim() || undefined,
    due: item.due?.trim() || undefined,
    status: item.status === 'done' ? 'done' : 'open',
  };
}

export function clampActions(items: ActionItem[]): ActionItem[] {
  return items.slice(0, MAX_ACTIONS).map((item, i) => normalizeAction(item, i));
}

export function toggleStatus(status: ActionStatus): ActionStatus {
  return status === 'open' ? 'done' : 'open';
}

export const SAMPLE_NOTES = `Standup 2026-10-11
- Alex: ship deploy button docs by Friday
- Sam: investigate Redis TTL cache miss on FAQ lab (due Wed)
- Jordan: draft changelog for Wave 2 (open)
- Follow-up: schedule design review for OG from database`;
