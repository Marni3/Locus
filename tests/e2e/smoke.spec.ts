import { test, expect } from '@playwright/test';

test('smoke test - health endpoint and app landing render', async ({ request, page }) => {
  // Test server health endpoint
  const healthRes = await request.get('/api/health');
  expect(healthRes.ok()).toBeTruthy();
  const healthJson = await healthRes.json();
  expect(healthJson.status).toBe('healthy');

  // Test page load
  await page.goto('/');
  await expect(page).toHaveTitle(/Locus|ReflectAI/i);
});
