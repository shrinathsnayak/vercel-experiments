import { Heart } from 'lucide-react';
import { getBuyMeACoffeeUrl } from '@/lib/shared';

export function BuyMeACoffeeLink() {
  const href = getBuyMeACoffeeUrl();
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition-opacity hover:opacity-90 active:scale-[0.98]"
    >
      <Heart className="size-3.5 shrink-0" aria-hidden />
      Support us
    </a>
  );
}
