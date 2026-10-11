export const SOFT_LIMIT = 5;
export const HARD_LIMIT = 8;

export type MeterState = {
  sessionId: string;
  count: number;
  softExceeded: boolean;
  hardExceeded: boolean;
  remainingHard: number;
};

export function normalizeSession(id: string): string {
  return id.trim().slice(0, 64) || 'anonymous';
}

export function evaluateMeter(count: number, sessionId: string): MeterState {
  return {
    sessionId,
    count,
    softExceeded: count >= SOFT_LIMIT,
    hardExceeded: count >= HARD_LIMIT,
    remainingHard: Math.max(0, HARD_LIMIT - count),
  };
}

export const SAMPLE_SESSION = 'demo-session-1';
