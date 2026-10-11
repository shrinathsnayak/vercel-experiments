export type ArithmeticParseSuccess = {
  ok: true;
  value: number;
  normalized: string;
};

export type ArithmeticParseFailure = {
  ok: false;
  error: string;
};

export type ArithmeticParseResult = ArithmeticParseSuccess | ArithmeticParseFailure;

const MAX_EXPRESSION_LENGTH = 120;

type Token =
  | { type: 'number'; value: number }
  | { type: 'op'; value: '+' | '-' | '*' | '/' }
  | { type: 'lparen' }
  | { type: 'rparen' };

function tokenize(input: string): Token[] | ArithmeticParseFailure {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i]!;
    if (ch === ' ' || ch === '\t') {
      i += 1;
      continue;
    }
    if (ch >= '0' && ch <= '9') {
      let num = ch;
      i += 1;
      while (i < input.length && ((input[i]! >= '0' && input[i]! <= '9') || input[i] === '.')) {
        num += input[i]!;
        i += 1;
      }
      const value = Number(num);
      if (!Number.isFinite(value)) {
        return { ok: false, error: 'Invalid number literal' };
      }
      tokens.push({ type: 'number', value });
      continue;
    }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      tokens.push({ type: 'op', value: ch });
      i += 1;
      continue;
    }
    if (ch === '(') {
      tokens.push({ type: 'lparen' });
      i += 1;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen' });
      i += 1;
      continue;
    }
    return { ok: false, error: `Disallowed character: ${ch}` };
  }
  return tokens;
}

/** Recursive descent parser - arithmetic only, no identifiers or calls. */
function parseExpression(tokens: Token[], pos: { i: number }): number | ArithmeticParseFailure {
  const term = parseTerm(tokens, pos);
  if (typeof term !== 'number' && 'ok' in term && !term.ok) return term;

  let value = term as number;
  while (pos.i < tokens.length && tokens[pos.i]?.type === 'op') {
    const op = (tokens[pos.i] as { type: 'op'; value: '+' | '-' }).value;
    if (op !== '+' && op !== '-') break;
    pos.i += 1;
    const right = parseTerm(tokens, pos);
    if (typeof right !== 'number' && 'ok' in right && !right.ok) return right;
    value = op === '+' ? value + (right as number) : value - (right as number);
  }
  return value;
}

function parseTerm(tokens: Token[], pos: { i: number }): number | ArithmeticParseFailure {
  let value = parseFactor(tokens, pos);
  if (typeof value !== 'number' && 'ok' in value && !value.ok) return value;

  while (pos.i < tokens.length && tokens[pos.i]?.type === 'op') {
    const op = (tokens[pos.i] as { type: 'op'; value: '*' | '/' }).value;
    if (op !== '*' && op !== '/') break;
    pos.i += 1;
    const right = parseFactor(tokens, pos);
    if (typeof right !== 'number' && 'ok' in right && !right.ok) return right;
    const r = right as number;
    if (op === '/' && r === 0) {
      return { ok: false, error: 'Division by zero' };
    }
    value = op === '*' ? (value as number) * r : (value as number) / r;
  }
  return value as number;
}

function parseFactor(tokens: Token[], pos: { i: number }): number | ArithmeticParseFailure {
  const token = tokens[pos.i];
  if (!token) {
    return { ok: false, error: 'Unexpected end of expression' };
  }
  if (token.type === 'number') {
    pos.i += 1;
    return token.value;
  }
  if (token.type === 'op' && token.value === '-') {
    pos.i += 1;
    const inner = parseFactor(tokens, pos);
    if (typeof inner !== 'number' && 'ok' in inner && !inner.ok) return inner;
    return -(inner as number);
  }
  if (token.type === 'lparen') {
    pos.i += 1;
    const inner = parseExpression(tokens, pos);
    if (typeof inner !== 'number' && 'ok' in inner && !inner.ok) return inner;
    if (tokens[pos.i]?.type !== 'rparen') {
      return { ok: false, error: 'Missing closing parenthesis' };
    }
    pos.i += 1;
    return inner as number;
  }
  return { ok: false, error: 'Expected number or parenthesis' };
}

/**
 * Parse and evaluate a tiny allowlisted arithmetic expression.
 * Rejects identifiers, function calls, and any non-arithmetic syntax.
 */
export function parseAllowlistedArithmetic(raw: string): ArithmeticParseResult {
  const expr = raw.trim();
  if (!expr) {
    return { ok: false, error: 'Expression is empty' };
  }
  if (expr.length > MAX_EXPRESSION_LENGTH) {
    return { ok: false, error: 'Expression too long' };
  }
  if (/[a-zA-Z_$]/.test(expr)) {
    return { ok: false, error: 'Identifiers and function calls are not allowed' };
  }

  const tokens = tokenize(expr);
  if ('ok' in tokens) return tokens;

  const pos = { i: 0 };
  const result = parseExpression(tokens, pos);
  if (typeof result !== 'number' && 'ok' in result && !result.ok) return result;

  if (pos.i !== tokens.length) {
    return { ok: false, error: 'Unexpected tokens after expression' };
  }

  const value = result as number;
  if (!Number.isFinite(value)) {
    return { ok: false, error: 'Result is not a finite number' };
  }

  return { ok: true, value, normalized: expr.replace(/\s+/g, ' ') };
}

export const SANDBOX_SETUP_REQUIREMENTS = [
  'Vercel Sandbox microVM via @vercel/sandbox - never eval in the Next.js process',
  'Set SANDBOX_ENABLED=true on a Vercel project with Sandbox access (OIDC)',
  'Locally: vercel link + token/project env, then vercel env pull',
  'This demo only allows arithmetic expressions (no identifiers or arbitrary JS)',
  'Sandbox is created with networkPolicy deny-all',
] as const;

export function isSandboxEnabled(): boolean {
  return process.env.SANDBOX_ENABLED === 'true';
}
