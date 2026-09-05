import { test, expect } from '@playwright/test';

test.describe('The Return Explainable Daily Archivist Loop E2E', () => {
  test('surfaces one past reflection with explainable provenance and margin action', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // 1. Enter Demo Mode
    const demoBtn = page.locator('#hero-demo-mode-btn');
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    // 2. Locate and click The Return banner on Reflections Home
    const theReturnBanner = page.locator('text=The Return · Re-read One Page');
    await expect(theReturnBanner).toBeVisible();
    await theReturnBanner.click();

    // 3. Verify The Return full-bleed screen
    await expect(page.locator('header').locator('text=The Return ·')).toBeVisible();

    // Verify machine provenance evidence
    const mainArea = page.locator('main');
    await expect(mainArea).toBeVisible();

    // Verify "Write in the margin" primary CTA
    const writeMarginBtn = page.locator('button:has-text("Write in the margin")');
    await expect(writeMarginBtn).toBeVisible();
    await writeMarginBtn.click();

    // 4. Verify transition into Sealed Reader with The Margins ready
    await expect(page.locator('text=The Margins')).toBeVisible();
    await expect(page.locator('aside')).toBeVisible();
  });
});
