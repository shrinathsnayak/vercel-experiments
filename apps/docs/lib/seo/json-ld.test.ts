import { afterEach, describe, expect, it } from 'vitest';
import {
  buildHomepageJsonLd,
  buildOrganizationJsonLd,
  buildSoftwareApplicationJsonLd,
} from './json-ld';

const originalEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

afterEach(() => {
  if (originalEmail === undefined) {
    delete process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  } else {
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = originalEmail;
  }
});

describe('buildOrganizationJsonLd', () => {
  it('includes address and contactPoint', () => {
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = 'maintainers@example.com';
    const org = buildOrganizationJsonLd();

    expect(org['@type']).toBe('Organization');
    expect(org.name).toBe('Vercel Experiments');
    expect(org.address['@type']).toBe('PostalAddress');
    expect(org.address.addressCountry).toBe('IN');
    expect(org.contactPoint[0].contactType).toBe('community support');
    expect(org.contactPoint[0].email).toBe('maintainers@example.com');
    expect(org.contactPoint[0].url).toContain('/contact');
  });

  it('omits email when NEXT_PUBLIC_CONTACT_EMAIL is unset', () => {
    delete process.env.NEXT_PUBLIC_CONTACT_EMAIL;
    const org = buildOrganizationJsonLd();
    expect(org.contactPoint[0].email).toBeUndefined();
    expect(org.contactPoint[0].url).toContain('/contact');
  });
});

describe('buildSoftwareApplicationJsonLd', () => {
  it('describes the product with offers', () => {
    const app = buildSoftwareApplicationJsonLd(10);
    expect(app['@type']).toBe('SoftwareApplication');
    expect(app.offers.price).toBe('0');
    expect(app.featureList.length).toBeGreaterThan(0);
  });
});

describe('buildHomepageJsonLd', () => {
  it('returns organization, software, and website graphs', () => {
    const graph = buildHomepageJsonLd(3);
    expect(graph).toHaveLength(3);
    expect(graph.map((item) => item['@type'])).toEqual([
      'Organization',
      'SoftwareApplication',
      'WebSite',
    ]);
  });
});
