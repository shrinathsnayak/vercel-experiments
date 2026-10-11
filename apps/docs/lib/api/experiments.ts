import type { Experiment } from '@/lib/experiments';
import { siteUrl } from '@/lib/shared';

export type PublicExperiment = {
  slug: string;
  title: string;
  description: string;
  category: Experiment['category'];
  tags: string[];
  technologies: string[];
  difficulty: Experiment['difficulty'];
  estimatedMinutes: number;
  featured: boolean;
  surface: Experiment['surface'];
  phase: Experiment['phase'];
  lastUpdated: string;
  documentationUrl: string;
  documentationPath: string;
  repositoryUrl?: string;
  deploymentUrl?: string;
  requiredEnvironmentVariables: string[];
  externalServices: string[];
  relatedSlugs: string[];
};

export function toPublicExperiment(experiment: Experiment): PublicExperiment {
  return {
    slug: experiment.slug,
    title: experiment.title,
    description: experiment.description,
    category: experiment.category,
    tags: experiment.tags,
    technologies: experiment.technologies,
    difficulty: experiment.difficulty,
    estimatedMinutes: experiment.estimatedMinutes,
    featured: experiment.featured,
    surface: experiment.surface,
    phase: experiment.phase,
    lastUpdated: experiment.lastUpdated,
    documentationPath: experiment.documentationPath,
    documentationUrl: `${siteUrl}${experiment.documentationPath}`,
    ...(experiment.repositoryUrl
      ? { repositoryUrl: experiment.repositoryUrl }
      : {}),
    ...(experiment.deploymentUrl
      ? { deploymentUrl: experiment.deploymentUrl }
      : {}),
    requiredEnvironmentVariables: experiment.requiredEnvironmentVariables,
    externalServices: experiment.externalServices,
    relatedSlugs: experiment.relatedSlugs,
  };
}
