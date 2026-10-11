import {
  appDescription,
  appName,
  contactRoute,
  developersRoute,
  docsRoute,
  openApiRoute,
  siteUrl,
} from '@/lib/shared';
import { experimentCategorySchema, experimentDifficultySchema, experimentSurfaceSchema } from '@/lib/experiments';

const categories = experimentCategorySchema.options;
const difficulties = experimentDifficultySchema.options;
const surfaces = experimentSurfaceSchema.options;

const experimentSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'slug',
    'title',
    'description',
    'category',
    'tags',
    'technologies',
    'difficulty',
    'estimatedMinutes',
    'featured',
    'surface',
    'phase',
    'lastUpdated',
    'documentationUrl',
    'documentationPath',
    'requiredEnvironmentVariables',
    'externalServices',
    'relatedSlugs',
  ],
  properties: {
    slug: {
      type: 'string',
      description: 'URL-safe experiment identifier.',
      pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
      example: 'webhook-playground',
    },
    title: { type: 'string', example: 'Webhook Playground' },
    description: { type: 'string' },
    category: { type: 'string', enum: categories },
    tags: { type: 'array', items: { type: 'string' } },
    technologies: { type: 'array', items: { type: 'string' } },
    difficulty: { type: 'string', enum: difficulties },
    estimatedMinutes: { type: 'integer', minimum: 1 },
    featured: { type: 'boolean' },
    surface: { type: 'string', enum: surfaces },
    phase: { type: 'integer', enum: [1, 2, 3, 4, 5, 6] },
    lastUpdated: { type: 'string', format: 'date' },
    documentationUrl: { type: 'string', format: 'uri' },
    documentationPath: { type: 'string' },
    repositoryUrl: { type: 'string', format: 'uri' },
    deploymentUrl: { type: 'string', format: 'uri' },
    requiredEnvironmentVariables: { type: 'array', items: { type: 'string' } },
    externalServices: { type: 'array', items: { type: 'string' } },
    relatedSlugs: { type: 'array', items: { type: 'string' } },
  },
} as const;

const errorSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['error'],
  properties: {
    error: {
      type: 'object',
      additionalProperties: false,
      required: ['code', 'message'],
      properties: {
        code: { type: 'string', example: 'not_found' },
        message: { type: 'string' },
        hint: { type: 'string' },
      },
    },
  },
} as const;

export function buildOpenApiDocument() {
  return {
    openapi: '3.1.0',
    info: {
      title: `${appName} Catalog API`,
      version: '1.0.0',
      description: `${appDescription} Public read-only REST API for listing and fetching published experiment metadata. See ${siteUrl}${developersRoute} and ${siteUrl}${docsRoute}.`,
      contact: {
        name: appName,
        url: `${siteUrl}${contactRoute}`,
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: siteUrl,
        description: 'Production catalog hub',
      },
    ],
    tags: [
      {
        name: 'Experiments',
        description: 'Published experiment catalog metadata',
      },
    ],
    paths: {
      '/api/v1/experiments': {
        get: {
          operationId: 'listExperiments',
          tags: ['Experiments'],
          summary: 'List published experiments',
          description:
            'Returns every published experiment in the catalog. Optional filters narrow by category or free-text query over title, description, tags, and technologies.',
          parameters: [
            {
              name: 'category',
              in: 'query',
              required: false,
              description: 'Filter by experiment category.',
              schema: { type: 'string', enum: categories },
            },
            {
              name: 'q',
              in: 'query',
              required: false,
              description:
                'Case-insensitive search across title, description, tags, and technologies.',
              schema: { type: 'string', minLength: 1, maxLength: 120 },
            },
            {
              name: 'featured',
              in: 'query',
              required: false,
              description: 'When true, return only featured experiments.',
              schema: { type: 'boolean' },
            },
          ],
          responses: {
            '200': {
              description: 'Experiment list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['count', 'experiments'],
                    properties: {
                      count: { type: 'integer', minimum: 0 },
                      experiments: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Experiment' },
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Invalid query parameters',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '405': {
              description: 'Method not allowed',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/v1/experiments/{slug}': {
        get: {
          operationId: 'getExperimentBySlug',
          tags: ['Experiments'],
          summary: 'Get one published experiment',
          description:
            'Fetch a single published experiment by slug. Unpublished or unknown slugs return 404 with a structured JSON error.',
          parameters: [
            {
              name: 'slug',
              in: 'path',
              required: true,
              description: 'Experiment slug (kebab-case).',
              schema: {
                type: 'string',
                pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Experiment detail',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['experiment'],
                    properties: {
                      experiment: { $ref: '#/components/schemas/Experiment' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Invalid slug',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '404': {
              description: 'Experiment not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '405': {
              description: 'Method not allowed',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Experiment: experimentSchema,
        Error: errorSchema,
      },
    },
    externalDocs: {
      description: `${appName} developer portal`,
      url: `${siteUrl}${developersRoute}`,
    },
    'x-openapi-path': openApiRoute,
  };
}
