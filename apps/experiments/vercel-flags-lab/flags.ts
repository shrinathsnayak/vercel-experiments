import { flag } from 'flags/next';
import { vercelAdapter } from '@flags-sdk/vercel';
import { DEFAULT_FLAG_KEY } from './logic';

/**
 * Code-defined flag discovered by Vercel Flags (drafts) when deployed.
 * Dashboard targeting wins once the draft is promoted.
 */
export const marketingBanner = flag({
  key: DEFAULT_FLAG_KEY,
  description: 'Demo marketing banner for the Vercel Flags lab',
  adapter: vercelAdapter(),
  defaultValue: false,
});
