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

  // Verify hero elements and calm anti-leakage UI
  const heroHeading = page.locator('h1');
  await expect(heroHeading).toBeVisible();
  await expect(heroHeading).toContainText('Reflect with depth');

  const signinButton = page.locator('#hero-google-signin-btn');
  await expect(signinButton).toBeVisible();

  // Capture visual proof for artifact reporting
  await page.screenshot({
    path: 'C:/Users/reyna/.gemini/antigravity-ide/brain/4fef8806-df7e-4a34-a62c-15640532c803/phase0_landing_preview.png',
    fullPage: true,
  });
});

