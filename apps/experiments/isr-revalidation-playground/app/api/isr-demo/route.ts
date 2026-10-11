import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidateAfter } from '../../../logic';

const querySchema = z.object({
  revalidate: z.coerce.number().int().min(0).max(86400).default(60),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  const revalidateSec = parsed.success ? parsed.data.revalidate : 60;
  const { revalidate } = revalidateAfter(revalidateSec);

  const body = {
    revalidate,
    generatedAt: new Date().toISOString(),
    note: 'Demo API route illustrating revalidate-style cache headers - not Vercel platform metrics.',
  };

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-isr-demo': '1',
  };

  if (revalidate === 0) {
    headers['cache-control'] = 'no-store';
  } else {
    headers['cache-control'] = `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate * 2}`;
  }

  return NextResponse.json(body, { headers });
}
