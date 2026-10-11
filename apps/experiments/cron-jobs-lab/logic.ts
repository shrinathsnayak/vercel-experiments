export function describeCronSchedule(expression: string): string {
  if (expression === '0 * * * *') return 'Once every hour at minute 0';
  if (expression === '*/5 * * * *') return 'Every 5 minutes';
  if (expression === '0 0 * * *') return 'Daily at 00:00 UTC';
  return 'Custom cron expression';
}

export function cronRouteSnippet(): string {
  return `// vercel.json
{
  "crons": [{ "path": "/api/cron/heartbeat", "schedule": "0 * * * *" }]
}

// Protect with CRON_SECRET → Authorization: Bearer …`;
}
