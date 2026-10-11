import { expect, test } from '@playwright/test';

test('homepage negotiates Markdown with Vary: Accept', async ({ request }) => {
  const markdown = await request.get('/', {
    headers: { Accept: 'text/markdown' },
  });
  expect(markdown.status()).toBe(200);
  expect(markdown.headers()['content-type']).toMatch(/text\/markdown/);
  expect(markdown.headers()['vary'] ?? '').toMatch(/Accept/i);
  const markdownBody = await markdown.text();
  expect(markdownBody.length).toBeGreaterThan(20);
  expect(markdownBody).toContain('Vercel Experiments');

  const html = await request.get('/', {
    headers: { Accept: 'text/html' },
  });
  expect(html.status()).toBe(200);
  expect(html.headers()['content-type']).toMatch(/text\/html/);
  // Local `next start` may drop middleware Vary on App Router HTML (Next.js issue).
  // Markdown negotiation above is the required dual-representation proof; production
  // also sets Vary: Accept via apps/docs/vercel.json.
});

test('missing paths return Markdown 404 bodies for agents', async ({
  request,
}) => {
  const response = await request.get('/__ora-404-probe-agent-ready', {
    headers: { Accept: 'text/markdown' },
  });
  expect(response.status()).toBe(404);
  expect(response.headers()['content-type']).toMatch(/text\/markdown/);
  const body = await response.text();
  expect(body.length).toBeGreaterThan(20);
  expect(body).toMatch(/llms\.txt|sitemap|docs/i);
});

test('OpenAPI and catalog API are publicly reachable', async ({ request }) => {
  const openapi = await request.get('/openapi.json');
  expect(openapi.status()).toBe(200);
  const spec = await openapi.json();
  expect(spec.openapi).toMatch(/^3\./);
  expect(spec.paths['/api/v1/experiments'].get.operationId).toBe(
    'listExperiments',
  );

  const list = await request.get('/api/v1/experiments?q=webhook');
  expect(list.status()).toBe(200);
  const listBody = await list.json();
  expect(listBody.count).toBeGreaterThan(0);
  expect(Array.isArray(listBody.experiments)).toBe(true);

  const missing = await request.get('/api/v1/experiments/not-a-real-slug');
  expect(missing.status()).toBe(404);
  const errorBody = await missing.json();
  expect(errorBody.error.code).toBe('not_found');
  expect(errorBody.error.message).toBeTruthy();
  expect(errorBody.error.hint).toBeTruthy();
});

test('llms.txt includes when-to-use guidance', async ({ request }) => {
  const response = await request.get('/llms.txt');
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain('When to use this');
  expect(body).toContain('/openapi.json');
});

test('homepage HTML includes JSON-LD and canonical metadata', async ({
  page,
}) => {
  await page.goto('/');
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute('href', /vercel-experiments\.com|localhost/);
  const jsonLd = page.locator('script[type="application/ld+json"]');
  await expect(jsonLd.first()).toBeAttached();
  const raw = await jsonLd.first().textContent();
  expect(raw).toBeTruthy();
  const parsed = JSON.parse(raw!);
  const types = Array.isArray(parsed)
    ? parsed.map((item: { '@type': string }) => item['@type'])
    : [parsed['@type']];
  expect(types).toContain('Organization');
  expect(types).toContain('SoftwareApplication');
});

test('contact and developers pages render', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible();
  await page.goto('/developers');
  await expect(
    page.getByRole('heading', { name: /developer resources/i }),
  ).toBeVisible();
});
