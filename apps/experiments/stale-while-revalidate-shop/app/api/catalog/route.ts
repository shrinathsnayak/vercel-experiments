import { NextResponse } from 'next/server';
import { getRedis } from '../../../lib/redis';
import {
  CATALOG_KEY,
  DEFAULT_MAX_AGE,
  DEFAULT_SWR,
  cacheControlHeader,
  seedCatalog,
  type CatalogItem,
} from '../../../logic';

const memory = new Map<string, { items: CatalogItem[]; generatedAt: string }>();

export async function GET() {
  const redis = getRedis();
  let items: CatalogItem[];
  let generatedAt: string;
  let storage: 'redis' | 'memory' = 'memory';

  if (redis) {
    const cached = await redis.get<{ items: CatalogItem[]; generatedAt: string }>(CATALOG_KEY);
    if (cached?.items) {
      items = cached.items;
      generatedAt = cached.generatedAt;
    } else {
      items = seedCatalog();
      generatedAt = new Date().toISOString();
      await redis.set(CATALOG_KEY, { items, generatedAt }, { ex: DEFAULT_MAX_AGE + DEFAULT_SWR });
    }
    storage = 'redis';
  } else {
    const cached = memory.get(CATALOG_KEY);
    const ageMs = cached ? Date.now() - Date.parse(cached.generatedAt) : Infinity;
    if (cached && ageMs < (DEFAULT_MAX_AGE + DEFAULT_SWR) * 1000) {
      items = cached.items;
      generatedAt = cached.generatedAt;
    } else {
      items = seedCatalog();
      generatedAt = new Date().toISOString();
      memory.set(CATALOG_KEY, { items, generatedAt });
    }
  }

  return NextResponse.json(
    {
      items,
      generatedAt,
      storage,
      note:
        storage === 'memory'
          ? 'Redis not configured — process memory with educational TTL.'
          : undefined,
    },
    {
      headers: {
        'cache-control': cacheControlHeader(),
        'x-swr-demo': '1',
      },
    },
  );
}
