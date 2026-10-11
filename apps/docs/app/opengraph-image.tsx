import { createOgImage } from '@/lib/og/image';
import { appName } from '@/lib/shared';
import { getPublishedExperiments } from '@/lib/experiments';
import { ogSize } from '@/lib/og/theme';

export const alt = `${appName} - Independent Next.js and Vercel playground`;
export const size = ogSize;
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const count = getPublishedExperiments().length;
  return createOgImage({
    title: `${count} deployable Next.js experiments`,
    description:
      'Standalone labs for Edge Middleware, ISR, Blob, Redis, Neon, Cron, Queues, Flags, AI SDK, and more.',
    eyebrow: 'Open-source developer tools',
  });
}
