import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { assignVariant, shouldShowMaintenance } from './logic';

const COOKIE = 've-canary';

export function proxy(request: NextRequest) {
  const maintenanceEnv = process.env.MAINTENANCE_MODE === 'true';
  const canaryPercent = Number(process.env.CANARY_PERCENT ?? '10');
  const config = {
    maintenanceMode: maintenanceEnv,
    canaryPercent: Number.isFinite(canaryPercent) ? canaryPercent : 10,
  };

  if (shouldShowMaintenance(config) && !request.nextUrl.pathname.startsWith('/api')) {
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.rewrite(url);
  }

  if (request.nextUrl.pathname.startsWith('/variant')) {
    const assignment = assignVariant({
      config,
      existingCookie: request.cookies.get(COOKIE)?.value,
      random: Math.random(),
    });
    const url = request.nextUrl.clone();
    url.pathname = assignment.variant === 'canary' ? '/variant/canary' : '/variant/control';
    const res = NextResponse.rewrite(url);
    if (assignment.reason === 'new-assignment') {
      res.cookies.set(COOKIE, assignment.cookieValue, { path: '/', maxAge: 60 * 60 * 24 * 30 });
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/variant/:path*', '/maintenance'],
};
