import { z } from 'zod';

export const ogStudioQuerySchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(240).default(''),
  theme: z.enum(['light', 'dark']).default('light'),
  layout: z.enum(['default', 'centered', 'split']).default('default'),
  width: z.coerce.number().int().min(400).max(1200).default(1200),
  height: z.coerce.number().int().min(200).max(630).default(630),
});

export type OgStudioParams = z.infer<typeof ogStudioQuerySchema>;

export function buildOgStudioUrl(origin: string, params: OgStudioParams): string {
  const url = new URL('/api/og/studio', origin);
  url.searchParams.set('title', params.title);
  url.searchParams.set('description', params.description);
  url.searchParams.set('theme', params.theme);
  url.searchParams.set('layout', params.layout);
  url.searchParams.set('width', String(params.width));
  url.searchParams.set('height', String(params.height));
  return url.toString();
}
