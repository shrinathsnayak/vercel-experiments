import type { Experiment, ExperimentCategory, ExperimentDifficulty } from './schema';

export type ExperimentFilters = {
  query?: string;
  category?: ExperimentCategory | 'all';
  technology?: string | 'all';
  difficulty?: ExperimentDifficulty | 'all';
  tag?: string | 'all';
  sort?: 'featured' | 'recent' | 'title' | 'difficulty';
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function filterExperiments(
  experiments: Experiment[],
  filters: ExperimentFilters = {},
): Experiment[] {
  const query = filters.query ? normalize(filters.query) : '';
  const category = filters.category && filters.category !== 'all' ? filters.category : undefined;
  const technology =
    filters.technology && filters.technology !== 'all'
      ? normalize(filters.technology)
      : undefined;
  const difficulty =
    filters.difficulty && filters.difficulty !== 'all' ? filters.difficulty : undefined;
  const tag = filters.tag && filters.tag !== 'all' ? normalize(filters.tag) : undefined;

  let results = experiments.filter((experiment) => {
    if (category && experiment.category !== category) return false;
    if (difficulty && experiment.difficulty !== difficulty) return false;
    if (
      technology &&
      !experiment.technologies.some((item) => normalize(item) === technology)
    ) {
      return false;
    }
    if (tag && !experiment.tags.some((item) => normalize(item) === tag)) return false;

    if (!query) return true;

    const haystack = [
      experiment.title,
      experiment.description,
      experiment.category,
      ...experiment.tags,
      ...experiment.technologies,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });

  const sort = filters.sort ?? 'featured';

  results = [...results].sort((a, b) => {
    switch (sort) {
      case 'recent':
        return b.lastUpdated.localeCompare(a.lastUpdated);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'difficulty': {
        const order = { beginner: 0, intermediate: 1, advanced: 2 };
        return order[a.difficulty] - order[b.difficulty];
      }
      case 'featured':
      default: {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return b.lastUpdated.localeCompare(a.lastUpdated);
      }
    }
  });

  return results;
}

export function getUniqueTechnologies(experiments: Experiment[]): string[] {
  return [...new Set(experiments.flatMap((experiment) => experiment.technologies))].sort();
}

export function getUniqueTags(experiments: Experiment[]): string[] {
  return [...new Set(experiments.flatMap((experiment) => experiment.tags))].sort();
}
