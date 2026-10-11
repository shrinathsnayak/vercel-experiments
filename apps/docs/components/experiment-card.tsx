import Link from 'next/link';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import type { Experiment } from '@/lib/experiments';
import { categoryAccents, categoryLabels, difficultyLabels } from '@/lib/experiments';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function ExperimentCard({
  experiment,
  className,
}: {
  experiment: Experiment;
  className?: string;
}) {
  return (
    <Link
      href={experiment.documentationPath}
      className={cn('group block rounded-xl focus-visible:outline-none', className)}
    >
      <Card className="h-full transition-colors group-hover:border-brand/40 group-hover:bg-accent/40 group-focus-visible:ring-2 group-focus-visible:ring-brand/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <span
                className={cn(
                  'inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide',
                  categoryAccents[experiment.category],
                )}
              >
                {categoryLabels[experiment.category]}
              </span>
              <CardTitle className="text-base group-hover:text-brand">
                {experiment.title}
              </CardTitle>
            </div>
            <ArrowUpRight
              className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
              aria-hidden
            />
          </div>
          <CardDescription className="line-clamp-2">
            {experiment.description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-2 border-0 bg-transparent">
          <Badge variant="outline">{difficultyLabels[experiment.difficulty]}</Badge>
          <Badge variant="secondary" className="gap-1 font-normal">
            <Clock3 className="size-3" aria-hidden />
            {experiment.estimatedMinutes} min
          </Badge>
          {experiment.featured ? (
            <Badge variant="outline" className="border-brand/30 text-brand">
              Featured
            </Badge>
          ) : null}
        </CardFooter>
      </Card>
    </Link>
  );
}
