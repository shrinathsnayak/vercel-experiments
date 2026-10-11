import { expect, test } from '@playwright/test';

test('homepage renders and links to docs', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Vercel Experiments' })).toBeVisible();
  await page.getByRole('link', { name: 'Browse experiments' }).click();
  await expect(page).toHaveURL(/\/docs/);
});

test('documentation navigation works', async ({ page }) => {
  await page.goto('/docs');
  await expect(page.getByRole('heading', { name: 'Vercel Experiments', exact: true })).toBeVisible();
  await page.goto('/docs/changelog');
  await expect(page.getByRole('heading', { name: "What's New", exact: true })).toBeVisible();
  await page.goto('/docs/getting-started');
  await expect(page.getByRole('heading', { name: 'Getting started', exact: true })).toBeVisible();
});

test('experiment docs show deploy launch panel', async ({ page }) => {
  await page.goto('/docs/experiments/rate-limiting-simulator');
  await expect(page.getByRole('heading', { name: 'Rate Limiting Simulator' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Deploy on Vercel/i })).toBeVisible();
});
