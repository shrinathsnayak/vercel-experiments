'use client';

import { appName } from '@/lib/shared';
import { cn } from '@/lib/utils';

type BrandMarkProps = {
  className?: string;
  /** Icon pixel size */
  size?: number;
  /** Show the wordmark beside the icon */
  withLabel?: boolean;
  /** Label className when withLabel is true */
  labelClassName?: string;
  /**
   * `mark` - transparent flask for nav/sidebar (inverts in dark mode).
   * `badge` - full black-square logo for hero / marketing surfaces.
   */
  variant?: 'mark' | 'badge';
  /** Show the logo */
  withLogo?: boolean;
};

export function BrandMark({
  className,
  size = 24,
  withLabel = true,
  labelClassName,
  variant = 'mark',
  withLogo = true,
}: BrandMarkProps) {
  const src = variant === 'badge' ? '/logo.png' : '/logo-mark-dark.png';

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {withLogo ? (
        // eslint-disable-next-line @next/next/no-img-element -- small static brand asset
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          className={cn(
            'shrink-0',
            variant === 'badge' ? 'rounded-sm' : 'dark:invert',
          )}
          decoding="async"
        />
      ) : null}
      {withLabel ? (
        <span className={cn('font-semibold tracking-tight', labelClassName)}>
          {appName}
        </span>
      ) : null}
    </span>
  );
}
