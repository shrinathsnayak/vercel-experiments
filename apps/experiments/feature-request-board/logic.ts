export const MAX_IDEAS_CHARS = 8_000;
export const MAX_CLUSTERS = 8;

export type IdeaCluster = {
  id: string;
  theme: string;
  summary: string;
  ideaIndexes: number[];
};

export function truncateIdeas(text: string, max = MAX_IDEAS_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function parseIdeaLines(text: string): string[] {
  return truncateIdeas(text)
    .split(/\n+/)
    .map((l) => l.replace(/^[-*\d.)\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, 40);
}

export function clampClusters(clusters: IdeaCluster[]): IdeaCluster[] {
  return clusters.slice(0, MAX_CLUSTERS).map((c, i) => ({
    id: (c.id || `c${i + 1}`).trim().slice(0, 32),
    theme: c.theme.trim().slice(0, 80),
    summary: c.summary.trim().slice(0, 240),
    ideaIndexes: c.ideaIndexes.filter((n) => Number.isInteger(n) && n >= 0).slice(0, 40),
  }));
}

export function voteKey(clusterId: string): string {
  return `frb:votes:${clusterId.trim().slice(0, 32)}`;
}

export const SAMPLE_IDEAS = `Dark mode for the dashboard
CSV export of analytics
Slack alerts when a deploy fails
Mobile-friendly settings page
SSO for enterprise workspaces
Better empty states on first login`;
