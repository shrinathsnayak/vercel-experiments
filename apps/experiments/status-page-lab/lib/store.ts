import type { CheckResult } from '../logic';

export const memoryHistory: CheckResult[] = [];

export function prependMemory(check: CheckResult, max: number) {
  memoryHistory.unshift(check);
  if (memoryHistory.length > max) memoryHistory.length = max;
}
