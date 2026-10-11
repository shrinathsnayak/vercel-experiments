import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug') || 'untitled';
  const disable = url.searchParams.get('disable');
  const dm = await draftMode();
  if (disable === '1') {
    dm.disable();
    return NextResponse.redirect(new URL(`/live/${slug}`, url.origin));
  }
  dm.enable();
  return NextResponse.redirect(new URL(`/preview/${slug}`, url.origin));
}
