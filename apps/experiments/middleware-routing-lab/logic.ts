export type RuleType = 'rewrite' | 'redirect' | 'locale' | 'header' | 'cookie' | 'feature-flag';

export type RoutingRule = {
  id: string;
  type: RuleType;
  match: string;
  value: string;
  enabled: boolean;
};

export type RequestInput = {
  pathname: string;
  headers: Record<string, string>;
  cookies: Record<string, string>;
};

export type RoutingDecision = {
  action: 'next' | 'rewrite' | 'redirect' | 'block';
  pathname: string;
  status?: number;
  setHeaders: Record<string, string>;
  setCookies: Record<string, string>;
  matchedRules: Array<{ ruleId: string; type: RuleType; detail: string }>;
};

function pathMatches(pattern: string, pathname: string): boolean {
  if (pattern === '*') return true;
  if (pattern.endsWith('*')) {
    return pathname.startsWith(pattern.slice(0, -1));
  }
  return pathname === pattern;
}

export function evaluateRequest(rules: RoutingRule[], request: RequestInput): RoutingDecision {
  const decision: RoutingDecision = {
    action: 'next',
    pathname: request.pathname,
    setHeaders: {},
    setCookies: {},
    matchedRules: [],
  };

  for (const rule of rules) {
    if (!rule.enabled) continue;
    if (!pathMatches(rule.match, request.pathname)) continue;

    switch (rule.type) {
      case 'rewrite':
        decision.action = 'rewrite';
        decision.pathname = rule.value;
        decision.matchedRules.push({
          ruleId: rule.id,
          type: rule.type,
          detail: `Rewrite to ${rule.value}`,
        });
        break;
      case 'redirect':
        decision.action = 'redirect';
        decision.pathname = rule.value;
        decision.status = 307;
        decision.matchedRules.push({
          ruleId: rule.id,
          type: rule.type,
          detail: `Redirect to ${rule.value}`,
        });
        break;
      case 'locale':
        decision.setHeaders['x-locale'] = rule.value;
        decision.matchedRules.push({
          ruleId: rule.id,
          type: rule.type,
          detail: `Locale header → ${rule.value}`,
        });
        break;
      case 'header':
        decision.setHeaders[rule.match] = rule.value;
        decision.matchedRules.push({
          ruleId: rule.id,
          type: rule.type,
          detail: `Set header ${rule.match}`,
        });
        break;
      case 'cookie':
        decision.setCookies[rule.match] = rule.value;
        decision.matchedRules.push({
          ruleId: rule.id,
          type: rule.type,
          detail: `Set cookie ${rule.match}`,
        });
        break;
      case 'feature-flag':
        if (rule.value === 'off') {
          decision.action = 'block';
          decision.status = 404;
        }
        decision.matchedRules.push({
          ruleId: rule.id,
          type: rule.type,
          detail: `Feature ${rule.match} = ${rule.value}`,
        });
        break;
      default:
        break;
    }
  }

  return decision;
}

export const defaultRules: RoutingRule[] = [
  {
    id: '1',
    type: 'rewrite',
    match: '/docs*',
    value: '/content/docs',
    enabled: true,
  },
  {
    id: '2',
    type: 'locale',
    match: '/',
    value: 'en-US',
    enabled: true,
  },
  {
    id: '3',
    type: 'feature-flag',
    match: '*',
    value: 'on',
    enabled: true,
  },
];
