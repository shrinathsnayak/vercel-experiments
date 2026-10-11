export const GEO_HEADERS = [
  'x-vercel-ip-country',
  'x-vercel-ip-country-region',
  'x-vercel-ip-city',
  'x-vercel-ip-latitude',
  'x-vercel-ip-longitude',
  'x-vercel-ip-timezone',
  'x-forwarded-for',
] as const;

export type GeoHeaders = Partial<Record<(typeof GEO_HEADERS)[number], string>>;

export type LocalizedDemo = {
  greeting: string;
  country: string;
  city: string;
  currency: string;
  formattedCurrency: string;
  formattedDate: string;
  timezone: string;
  locale: string;
  source: 'vercel-headers' | 'fallback';
};

const COUNTRY_CURRENCY: Record<string, { currency: string; locale: string }> = {
  US: { currency: 'USD', locale: 'en-US' },
  GB: { currency: 'GBP', locale: 'en-GB' },
  DE: { currency: 'EUR', locale: 'de-DE' },
  FR: { currency: 'EUR', locale: 'fr-FR' },
  JP: { currency: 'JPY', locale: 'ja-JP' },
  IN: { currency: 'INR', locale: 'en-IN' },
  BR: { currency: 'BRL', locale: 'pt-BR' },
  AU: { currency: 'AUD', locale: 'en-AU' },
  CA: { currency: 'CAD', locale: 'en-CA' },
};

const GREETINGS: Record<string, string> = {
  US: 'Hello from the United States',
  GB: 'Hello from the United Kingdom',
  DE: 'Hallo aus Deutschland',
  FR: 'Bonjour depuis la France',
  JP: 'こんにちは、日本から',
  IN: 'Namaste from India',
  BR: 'Olá do Brasil',
  AU: 'G\'day from Australia',
  CA: 'Hello from Canada',
};

export function extractGeoHeaders(headers: Headers | Record<string, string | null | undefined>): GeoHeaders {
  const get = (name: string) => {
    if (headers instanceof Headers) return headers.get(name) ?? undefined;
    const v = headers[name] ?? headers[name.toLowerCase()];
    return v == null || v === '' ? undefined : String(v);
  };
  const out: GeoHeaders = {};
  for (const name of GEO_HEADERS) {
    const value = get(name);
    if (value) out[name] = value;
  }
  return out;
}

export function buildLocalizedDemo(
  geo: GeoHeaders,
  now: Date = new Date(),
  amount = 1234.56,
): LocalizedDemo {
  const country = (geo['x-vercel-ip-country'] ?? 'US').toUpperCase();
  const city = geo['x-vercel-ip-city'] ?? 'Unknown city';
  const timezone = geo['x-vercel-ip-timezone'] ?? 'UTC';
  const mapping = COUNTRY_CURRENCY[country] ?? { currency: 'USD', locale: 'en-US' };
  const source: LocalizedDemo['source'] =
    geo['x-vercel-ip-country'] || geo['x-vercel-ip-city'] ? 'vercel-headers' : 'fallback';

  let formattedCurrency: string;
  let formattedDate: string;
  try {
    formattedCurrency = new Intl.NumberFormat(mapping.locale, {
      style: 'currency',
      currency: mapping.currency,
    }).format(amount);
  } catch {
    formattedCurrency = `${mapping.currency} ${amount}`;
  }
  try {
    formattedDate = new Intl.DateTimeFormat(mapping.locale, {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: timezone,
    }).format(now);
  } catch {
    formattedDate = now.toISOString();
  }

  return {
    greeting: GREETINGS[country] ?? `Hello from ${country}`,
    country,
    city: decodeURIComponent(city.replace(/\+/g, ' ')),
    currency: mapping.currency,
    formattedCurrency,
    formattedDate,
    timezone,
    locale: mapping.locale,
    source,
  };
}

export function geoSnippet(): string {
  return `// Route Handler on Vercel
export async function GET(request: Request) {
  const country = request.headers.get('x-vercel-ip-country');
  const city = request.headers.get('x-vercel-ip-city');
  return Response.json({ country, city });
}`;
}
