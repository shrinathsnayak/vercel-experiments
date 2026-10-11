import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';
import { GitHubIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  changelogRoute,
  docsRoute,
  githubUrl,
} from '@/lib/shared';
import { cn } from '@/lib/utils';

const links = [
  { href: docsRoute, label: 'Documentation' },
  { href: changelogRoute, label: "What's New" },
];

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b bg-background/90 backdrop-blur-sm',
        className,
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="inline-flex items-center">
            <BrandMark size={28} variant="badge" />
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-1 text-sm md:flex">
            {links.map((link) => (
              <Button key={link.href} asChild variant="ghost" size="sm">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </nav>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={githubUrl} target="_blank" rel="noreferrer">
            <GitHubIcon className="size-4" />
            <span className="hidden sm:inline">GitHub</span>
          </Link>
        </Button>
      </div>
      <nav
        aria-label="Mobile"
        className="flex gap-2 overflow-x-auto border-t px-4 py-2 text-sm md:hidden"
      >
        {links.map((link) => (
          <Button key={link.href} asChild variant="ghost" size="sm">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </nav>
    </header>
  );
}
