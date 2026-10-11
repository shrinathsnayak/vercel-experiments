import { describe, expect, it } from 'vitest';
import { buildOpenApiDocument } from './openapi';

describe('buildOpenApiDocument', () => {
  it('publishes OpenAPI 3 with operationIds and typed schemas', () => {
    const doc = buildOpenApiDocument();

    expect(doc.openapi).toMatch(/^3\./);
    expect(doc.info.title).toContain('Vercel Experiments');
    expect(doc.paths['/api/v1/experiments'].get.operationId).toBe(
      'listExperiments',
    );
    expect(doc.paths['/api/v1/experiments/{slug}'].get.operationId).toBe(
      'getExperimentBySlug',
    );
    expect(
      doc.paths['/api/v1/experiments'].get.responses['200'].content[
        'application/json'
      ].schema,
    ).toBeTruthy();
    expect(doc.components.schemas.Experiment.properties.slug.type).toBe(
      'string',
    );
    expect(doc.components.schemas.Error.required).toContain('error');
    expect(doc.paths['/api/v1/experiments'].get.description.length).toBeGreaterThan(
      20,
    );
    expect(
      doc.paths['/api/v1/experiments/{slug}'].get.description.length,
    ).toBeGreaterThan(20);
  });
});
