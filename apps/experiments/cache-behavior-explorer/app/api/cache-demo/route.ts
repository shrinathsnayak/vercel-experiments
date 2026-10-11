import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  cacheHeaderForStrategy,
  type CacheStrategy,
} from '../../../logic';

const querySchema = z.object({
  strategy: z
    .enum(['no-store', 'max-age-short', 'max-age-long', 'stale-while-revalidate'])
    .default('max-age-short'),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  const strategy = (parsed.success ? parsed.data.strategy : 'max-age-short') as CacheStrategy;
  const cacheControl = cacheHeaderForStrategy(strategy);

  const body = {
    strategy,
    cacheControl,
    timestamp: new Date().toISOString(),
    note: 'Response from this app’s API route - not a Vercel CDN edge measurement.',
  };

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-cache-demo': '1',
  };

  if (strategy === 'no-store') {
    headers['cache-control'] = 'no-store';
  } else {
    headers['cache-control'] = cacheControl;
  }

  return NextResponse.json(body, { headers });
}
