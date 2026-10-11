import { emptyStats, type FunnelStats, type Headlines } from '../logic';

export let memoryHeadlines: Headlines | null = null;
export let memoryStats: FunnelStats = emptyStats();

export function setMemoryHeadlines(h: Headlines | null) {
  memoryHeadlines = h;
}

export function setMemoryStats(s: FunnelStats) {
  memoryStats = s;
}
