import { z } from 'zod';

export const experimentCategorySchema = z.enum([
  'ai',
  'performance',
  'networking',
  'security',
  'rendering',
  'routing',
  'platform',
  'developer-tools',
]);

export const experimentDifficultySchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
]);

/** How the experiment is primarily taught: UI-only, HTTP handlers, or both. */
export const experimentSurfaceSchema = z.enum([
  'ui',
  'route-handlers',
  'mixed',
]);

export const experimentSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  description: z.string().min(1).max(280),
  category: experimentCategorySchema,
  tags: z.array(z.string().min(1)).min(1),
  technologies: z.array(z.string().min(1)).min(1),
  difficulty: experimentDifficultySchema,
  estimatedMinutes: z.number().int().positive().max(240),
  featured: z.boolean(),
  published: z.boolean(),
  lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  documentationPath: z.string().min(1),
  repositoryUrl: z.string().url().optional(),
  deploymentUrl: z.string().url().optional(),
  requiredEnvironmentVariables: z.array(z.string()).default([]),
  externalServices: z.array(z.string()).default([]),
  securityNotes: z.array(z.string()).default([]),
  relatedSlugs: z.array(z.string()).default([]),
  /** Override derived surface when the default classification is wrong. */
  surface: experimentSurfaceSchema.optional(),
  phase: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
});

export type ExperimentDefinition = z.infer<typeof experimentSchema>;
export type ExperimentSurface = z.infer<typeof experimentSurfaceSchema>;
export type Experiment = ExperimentDefinition & { surface: ExperimentSurface };
export type ExperimentCategory = z.infer<typeof experimentCategorySchema>;
export type ExperimentDifficulty = z.infer<typeof experimentDifficultySchema>;

export const surfaceLabels: Record<ExperimentSurface, string> = {
  ui: 'UI',
  'route-handlers': 'Route Handlers',
  mixed: 'Mixed',
};

export const categoryLabels: Record<ExperimentCategory, string> = {
  ai: 'AI',
  performance: 'Performance',
  networking: 'Networking',
  security: 'Security',
  rendering: 'Rendering',
  routing: 'Routing',
  platform: 'Platform',
  'developer-tools': 'Developer Tools',
};

/** Soft category chips - same pattern as cloudflare-experiments.com */
export const categoryAccents: Record<ExperimentCategory, string> = {
  ai: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  performance: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  networking: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  security: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  rendering: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  routing: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  platform: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'developer-tools': 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
};

export const difficultyLabels: Record<ExperimentDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};
