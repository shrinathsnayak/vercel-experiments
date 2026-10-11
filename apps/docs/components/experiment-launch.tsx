import Link from 'next/link';
import type { Experiment } from '@/lib/experiments';
import { Button } from '@/components/ui/button';

/**
 * Hub-side launch panel: deploy or run locally - no in-browser demo embed.
 */
export function ExperimentLaunch({
  experiment,
  showDocsLink = true,
}: {
  experiment: Experiment;
  showDocsLink?: boolean;
}) {
  const localCommands = [
    `cd apps/experiments/${experiment.slug}`,
    'pnpm install',
    'pnpm dev',
  ].join('\n');

  return (
    <div className="space-y-4 rounded-xl border border-fd-border bg-fd-secondary/20 p-5">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-fd-muted-foreground">
          Run this experiment yourself
        </p>
        <p className="text-sm text-fd-muted-foreground">
          Demos are not embedded on this site. Deploy a standalone copy on Vercel or run the
          experiment app locally.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {experiment.deploymentUrl ? (
          <Button asChild>
            <Link href={experiment.deploymentUrl} target="_blank" rel="noreferrer">
              Deploy on Vercel
            </Link>
          </Button>
        ) : null}
        {experiment.repositoryUrl ? (
          <Button asChild variant="outline">
            <Link href={experiment.repositoryUrl} target="_blank" rel="noreferrer">
              View source
            </Link>
          </Button>
        ) : null}
        {showDocsLink ? (
          <Button asChild variant="outline">
            <Link href={experiment.documentationPath}>Read docs</Link>
          </Button>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-fd-muted-foreground">Local development</p>
        <pre className="overflow-x-auto rounded-md border border-fd-border bg-fd-background p-3 text-xs">
          {localCommands}
        </pre>
        <p className="text-xs text-fd-muted-foreground">
          Then open <code className="rounded bg-fd-secondary px-1 py-0.5">http://localhost:3010</code>
          .
        </p>
      </div>
    </div>
  );
}
