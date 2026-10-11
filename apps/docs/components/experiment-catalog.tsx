import Link from 'next/link';
import {
  categoryLabels,
  getPublishedExperiments,
  type ExperimentCategory,
} from '@/lib/experiments';

const categoryOrder = Object.keys(categoryLabels) as ExperimentCategory[];

export function ExperimentCatalog() {
  const published = getPublishedExperiments();

  return (
    <div className="not-prose space-y-8">
      {categoryOrder.map((category) => {
        const items = published
          .filter((experiment) => experiment.category === category)
          .sort((a, b) =>
            a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
          );

        if (items.length === 0) return null;

        return (
          <section key={category} className="space-y-3">
            <h3
              id={category}
              className="scroll-mt-24 text-lg font-semibold tracking-tight"
            >
              {categoryLabels[category]}
            </h3>
            <ul className="space-y-2 text-sm leading-relaxed sm:text-base">
              {items.map((experiment) => (
                <li key={experiment.slug}>
                  <Link
                    href={experiment.documentationPath}
                    className="font-medium text-fd-foreground underline decoration-fd-border underline-offset-4 hover:decoration-fd-foreground"
                  >
                    {experiment.title}
                  </Link>
                  <span className="text-fd-muted-foreground">
                    {' '}
                    - {experiment.description}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
