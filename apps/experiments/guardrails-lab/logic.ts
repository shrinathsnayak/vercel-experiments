export const MAX_INPUT_CHARS = 4_000;
export const RATE_LIMIT_KEY_PREFIX = 'experiments:guardrails:rl:';
export const RATE_LIMIT_WINDOW_SECONDS = 60;
export const RATE_LIMIT_MAX = 20;
export const AUDIT_KEY = 'experiments:guardrails:audit';
export const MAX_AUDIT = 40;

export type PolicyAction = 'allow' | 'block' | 'rewrite';

export type AuditEntry = {
  at: string;
  action: PolicyAction;
  reason: string;
  inputPreview: string;
  outputPreview: string;
};

export function truncateText(text: string, max = MAX_INPUT_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function evaluatePolicy(input: string): {
  action: PolicyAction;
  reason: string;
  rewritten?: string;
} {
  const t = input.toLowerCase();
  if (/\b(api[_-]?key|password|sk-[a-z0-9]{10,}|bearer\s+[a-z0-9._-]+)\b/i.test(input)) {
    return { action: 'block', reason: 'Possible secret/credential content detected.' };
  }
  if (/\b(hack|exploit|malware|bypass auth)\b/.test(t)) {
    return {
      action: 'rewrite',
      reason: 'Disallowed intent keywords — rewritten to refuse helpfully.',
      rewritten:
        'I cannot help with hacking, exploits, or bypassing authentication. Ask about defensive security or platform docs instead.',
    };
  }
  if (input.length < 2) {
    return { action: 'block', reason: 'Input too short.' };
  }
  return { action: 'allow', reason: 'Passed allowlist policy heuristics.' };
}

export function clampAudit(entries: AuditEntry[]): AuditEntry[] {
  return entries.slice(0, MAX_AUDIT);
}

export const SAMPLE_INPUT = 'How do I rotate AI_GATEWAY_API_KEY safely on Vercel?';
