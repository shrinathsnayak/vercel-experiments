import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/jwt';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tolerance = Number(url.searchParams.get('tolerance') ?? '5');
  const header = request.headers.get('authorization');
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null;
  const cookie = request.headers.get('x-demo-token');
  const result = await verifyToken(bearer || cookie, Number.isFinite(tolerance) ? tolerance : 5);
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    claims: result.claims,
    message: 'Protected route unlocked with verified JWT.',
  });
}
