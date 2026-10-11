import { SidebarCategory } from '@/components/sidebar-category';
import { SiteBanner } from '@/components/site-banner';
import { docsLayoutOptions } from '@/lib/layout.shared';
import { groupSeparatorsIntoFolders } from '@/lib/page-tree';
import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  const tree = groupSeparatorsIntoFolders(source.getPageTree());

  return (
    <>
      <SiteBanner />
      <DocsLayout
        {...docsLayoutOptions}
        tree={tree}
        sidebar={{
          collapsible: true,
          // Keep experiment groups collapsed unless they contain the active page
          defaultOpenLevel: 0,
          components: {
            Separator: SidebarCategory,
          },
        }}
      >
        {children}
      </DocsLayout>
    </>
  );
}
