import Link from 'next/link';
import { getExperiment } from '@/lib/experiments';
import { Button } from '@/components/ui/button';

/**
 * Deploy CTA for a registered experiment (same button style as before).
 */
export function ExperimentDeployButton({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const experiment = getExperiment(slug);
  if (!experiment?.deploymentUrl) {
    return (
      <p className="text-sm text-fd-muted-foreground">
        No one-click deploy URL is registered for <code>{slug}</code>.
      </p>
    );
  }

  return (
    <p className={className ?? 'not-prose my-4'}>
      <Button asChild>
        <Link href={experiment.deploymentUrl} target="_blank" rel="noreferrer">
          Deploy on Vercel
        </Link>
      </Button>
    </p>
  );
}
