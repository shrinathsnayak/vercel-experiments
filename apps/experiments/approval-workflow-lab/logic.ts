export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export type ApprovalItem = {
  id: string;
  title: string;
  body: string;
  status: ApprovalStatus;
  approveToken: string;
  rejectToken: string;
  createdAt: string;
  decidedAt?: string;
};

export const MAX_TITLE = 120;
export const MAX_BODY = 4_000;

export function clampTitle(title: string): string {
  return title.trim().slice(0, MAX_TITLE);
}

export function clampBody(body: string): string {
  return body.trim().slice(0, MAX_BODY);
}

export function makeToken(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36) + Date.now().toString(36);
}

export function canSubmit(status: ApprovalStatus): boolean {
  return status === 'draft';
}

export function applyDecision(
  status: ApprovalStatus,
  decision: 'approve' | 'reject',
): ApprovalStatus | null {
  if (status !== 'pending') return null;
  return decision === 'approve' ? 'approved' : 'rejected';
}

export const SAMPLE_TITLE = 'Publish pricing page';
export const SAMPLE_BODY = 'Ready for legal + design review. Target: Friday.';
