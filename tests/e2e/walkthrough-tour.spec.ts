import { test, expect } from '@playwright/test';

test.describe('Interactive Guided Walkthrough E2E', () => {
  test('navigates through all 7 stages of the reflective user story', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // 1. Enter Demo Mode
    const demoBtn = page.locator('#hero-demo-mode-btn');
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    // 2. Open Guided Tour from Navbar
    const tourBtn = page.locator('#navbar-open-tour-btn');
    await expect(tourBtn).toBeVisible();
    await tourBtn.click();

    // Verify modal appears
    const modal = page.locator('#walkthrough-modal');
    await expect(modal).toBeVisible();

    // Step 1: Reflections Canvas
    await expect(modal.locator('text=The Reflections Canvas')).toBeVisible();
    await expect(modal.locator('text=Step 1 of 7')).toBeVisible();

    // Advance to Step 2
    const nextBtn = page.locator('#walkthrough-next-btn');
    await nextBtn.click();

    // Step 2: Starting a Reflection
    await expect(modal.locator('#walkthrough-title')).toContainText('Starting a Reflection');
    await expect(modal.locator('text=Step 2 of 7')).toBeVisible();

    // Advance to Step 3
    await nextBtn.click();

    // Step 3: Bookmarks
    await expect(modal.locator('#walkthrough-title')).toContainText('Bookmarking Key Realizations');
    await expect(modal.locator('text=Step 3 of 7')).toBeVisible();

    // Advance to Step 4
    await nextBtn.click();

    // Step 4: Sealing
    await expect(modal.locator('#walkthrough-title')).toContainText('Finite Pages & Page Sealing');
    await expect(modal.locator('text=Step 4 of 7')).toBeVisible();

    // Advance to Step 5
    await nextBtn.click();

    // Step 5: Strata Margins
    await expect(modal.locator('#walkthrough-title')).toContainText('The Strata Margin Layer');
    await expect(modal.locator('text=Step 5 of 7')).toBeVisible();

    // Advance to Step 6
    await nextBtn.click();

    // Step 6: The Return
    await expect(modal.locator('#walkthrough-title')).toContainText('The Return: One Page a Day');
    await expect(modal.locator('text=Step 6 of 7')).toBeVisible();

    // Advance to Step 7
    await nextBtn.click();

    // Step 7: Themes
    await expect(modal.locator('#walkthrough-title')).toContainText('Longitudinal Themes & Constellation');
    await expect(modal.locator('text=Step 7 of 7')).toBeVisible();

    // Verify Finish Button
    const finishBtn = page.locator('#walkthrough-finish-btn');
    await expect(finishBtn).toBeVisible();
    await finishBtn.click();

    // Modal closes smoothly
    await expect(modal).not.toBeVisible();
  });
});
