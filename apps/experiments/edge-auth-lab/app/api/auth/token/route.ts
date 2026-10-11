import { NextResponse } from 'next/server';
import { z } from 'zod';
import { issueToken } from '../../../../lib/jwt';

const schema = z.object({
  sub: z.string().min(1).max(64).default('demo-user'),
  ttlSeconds: z.number().int().min(1).max(3600).optional(),
  iatOffsetSeconds: z.number().int().min(-60).max(120).optional(),
  scope: z.string().max(64).optional(),
});

export async function POST(request: Request) {
  let json: unknown = {};
  try {
    json = await request.json();
  } catch {
    json = {};
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const issued = await issueToken(parsed.data);
  return NextResponse.json({
    ...issued,
    secretSource: process.env.JWT_SECRET?.trim() ? 'JWT_SECRET' : 'dev-fallback',
    note: 'Real jose HS256 JWT. Set JWT_SECRET in production.',
  });
}
