'use client';

import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HomeSearchTrigger({ className }: { className?: string }) {
  const { enabled, hotKey, setOpenSearch } = useSearchContext();

  if (!enabled) return null;

  return (
    <button
      type="button"
      onClick={() => setOpenSearch(true)}
      className={cn(
        'relative flex h-11 w-full max-w-xl items-center gap-3 rounded-lg border border-brand/20 bg-background/70 px-3 text-left text-sm text-muted-foreground transition-colors outline-none hover:border-brand/40 hover:bg-background focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-ring/50',
        className,
      )}
      aria-label="Open search"
    >
      <Search className="size-4 shrink-0" aria-hidden />
      <span className="flex-1 truncate">Search docs and experiments</span>
      <kbd className="pointer-events-none hidden items-center gap-0.5 rounded-md border bg-background px-1.5 font-sans text-[11px] font-medium text-muted-foreground sm:inline-flex">
        {hotKey.map((key, index) => (
          <span key={index}>{key.display}</span>
        ))}
      </kbd>
    </button>
  );
}
