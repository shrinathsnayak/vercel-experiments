import { siteBanner } from '@/lib/shared';

/** Static disclaimer strip - no client JS. */
export function SiteBanner() {
  return (
    <div
      role="note"
      className="text-center relative z-0 bg-brand px-3 py-2.5 text-xs leading-snug font-light text-white sm:text-sm"
    >
      {siteBanner.text}
    </div>
  );
}
