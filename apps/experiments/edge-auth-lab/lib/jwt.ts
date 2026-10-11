import { SignJWT, jwtVerify, errors } from 'jose';
import { classifySkew, type TokenClaims, type VerifyOutcome } from '../logic';

function getSecret() {
  const raw = process.env.JWT_SECRET?.trim() || 'dev-only-edge-auth-lab-secret-change-me';
  return new TextEncoder().encode(raw);
}

export async function issueToken(input: {
  sub: string;
  scope?: string;
  ttlSeconds?: number;
  /** Shift iat into the future to demo clock skew */
  iatOffsetSeconds?: number;
}): Promise<{ token: string; claims: TokenClaims }> {
  const now = Math.floor(Date.now() / 1000) + (input.iatOffsetSeconds ?? 0);
  const ttl = input.ttlSeconds ?? 60;
  const claims: TokenClaims = {
    sub: input.sub,
    scope: input.scope ?? 'demo',
    iat: now,
    exp: now + ttl,
  };
  const token = await new SignJWT({ scope: claims.scope })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.sub)
    .setIssuedAt(claims.iat)
    .setExpirationTime(claims.exp)
    .sign(getSecret());
  return { token, claims };
}

export async function verifyToken(
  token: string | undefined | null,
  clockToleranceSeconds = 5,
): Promise<VerifyOutcome> {
  if (!token) return { ok: false, reason: 'missing' };
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      clockTolerance: clockToleranceSeconds,
    });
    const claims: TokenClaims = {
      sub: String(payload.sub ?? ''),
      scope: String(payload.scope ?? ''),
      iat: Number(payload.iat ?? 0),
      exp: Number(payload.exp ?? 0),
    };
    const skew = classifySkew({
      nowSeconds: Math.floor(Date.now() / 1000),
      iat: claims.iat,
      exp: claims.exp,
      clockToleranceSeconds,
    });
    if (skew !== 'valid') return { ok: false, reason: skew };
    return { ok: true, claims };
  } catch (e) {
    if (e instanceof errors.JWTExpired) return { ok: false, reason: 'expired' };
    if (e instanceof errors.JWTClaimValidationFailed) {
      const claim = (e as { claim?: string }).claim;
      if (claim === 'iat' || claim === 'nbf') return { ok: false, reason: 'not-yet-valid' };
    }
    return { ok: false, reason: 'invalid' };
  }
}
