'use client';

import type * as PageTree from 'fumadocs-core/page-tree';

export function SidebarCategory({ item }: { item: PageTree.Separator }) {
  return (
    <p className="mb-1 mt-6 px-2 text-[11px] leading-4 font-semibold uppercase tracking-[0.08em] text-fd-muted-foreground">
      {item.name}
    </p>
  );
}
