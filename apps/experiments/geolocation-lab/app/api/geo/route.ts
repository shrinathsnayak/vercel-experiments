import { NextResponse } from 'next/server';
import { buildLocalizedDemo, extractGeoHeaders, GEO_HEADERS } from '../../../logic';

export async function GET(request: Request) {
  const geo = extractGeoHeaders(request.headers);
  const localized = buildLocalizedDemo(geo);
  return NextResponse.json({
    headers: geo,
    documented: GEO_HEADERS,
    localized,
    note:
      localized.source === 'fallback'
        ? 'Vercel geo headers are injected at the edge on Vercel deployments. Locally they are usually absent - this response uses honest fallbacks.'
        : 'Headers provided by the Vercel edge network.',
  });
}
