export type TokenClaims = {
  sub: string;
  scope: string;
  iat: number;
  exp: number;
};

export type VerifyOutcome =
  | { ok: true; claims: TokenClaims }
  | { ok: false; reason: 'expired' | 'not-yet-valid' | 'invalid' | 'missing' };

/** Pure clock-skew helper used by tests and UI explanations. */
export function classifySkew(input: {
  nowSeconds: number;
  iat: number;
  exp: number;
  clockToleranceSeconds: number;
}): 'valid' | 'expired' | 'not-yet-valid' {
  const { nowSeconds, iat, exp, clockToleranceSeconds } = input;
  if (nowSeconds + clockToleranceSeconds < iat) return 'not-yet-valid';
  if (nowSeconds - clockToleranceSeconds >= exp) return 'expired';
  return 'valid';
}

export function defaultTtlSeconds(): number {
  return 60;
}

export function authSnippet(): string {
  return `import { SignJWT, jwtVerify } from 'jose';
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const jwt = await new SignJWT({ scope: 'demo' })
  .setProtectedHeader({ alg: 'HS256' })
  .setSubject('user-1')
  .setIssuedAt()
  .setExpirationTime('60s')
  .sign(secret);`;
}
