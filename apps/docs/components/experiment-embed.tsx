import { ExperimentLaunch } from '@/components/experiment-launch';
import { getExperiment } from '@/lib/experiments';

/**
 * Docs embed: launch panel (deploy / local) instead of an in-browser demo.
 */
export function ExperimentEmbed({ slug }: { slug: string }) {
  const experiment = getExperiment(slug);
  if (!experiment) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
        Experiment <code>{slug}</code> is not available in the published registry.
      </div>
    );
  }

  return (
    <div className="not-prose my-6">
      <ExperimentLaunch experiment={experiment} showDocsLink={false} />
    </div>
  );
}
