import { test, expect } from '@playwright/test';

test.describe('Interactive Guided Walkthrough & Phase 4 Polish E2E', () => {
  test('first-run banner launches walkthrough and guides user through the reflective user story', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // 1. Enter Demo Mode from Centered Sanctuary Portal
    const demoBtn = page.locator('#hero-demo-mode-btn');
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    // 2. Verify First-Run Welcome Banner appears on Reflections Home
    const tourBanner = page.locator('#first-run-tour-banner');
    await expect(tourBanner).toBeVisible();
    await expect(tourBanner).toContainText('Welcome to Locus');

    // 3. Click "Take Guided Tour" from banner
    const bannerStartBtn = page.locator('#banner-start-tour-btn');
    await expect(bannerStartBtn).toBeVisible();
    await bannerStartBtn.click();

    // 4. Verify Walkthrough modal appears at Step 1
    const modal = page.locator('#walkthrough-modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('#walkthrough-title')).toContainText('The Reflections Canvas');
    await expect(modal.locator('text=Step 1 of 7')).toBeVisible();

    // 5. Advance to Step 2: Starting a Reflection
    const nextBtn = page.locator('#walkthrough-next-btn');
    await nextBtn.click();
    await expect(modal.locator('#walkthrough-title')).toContainText('Starting a Reflection');
    await expect(modal.locator('text=Step 2 of 7')).toBeVisible();
    await expect(modal.locator('button:has-text("I\'m feeling good today")')).toBeVisible();

    // 6. Test minimizing the walkthrough tour
    const minimizeBtn = page.locator('#walkthrough-minimize-btn');
    await expect(minimizeBtn).toBeVisible();
    await minimizeBtn.click();

    // Verify modal is hidden and minimized pill appears
    await expect(modal).not.toBeVisible();
    const pill = page.locator('#walkthrough-minimized-pill');
    await expect(pill).toBeVisible();
    await expect(pill).toContainText('Step 2 of 7');

    // Click pill to re-expand walkthrough modal
    await pill.click();
    await expect(modal).toBeVisible();
    await expect(pill).not.toBeVisible();

    // 7. Advance through remaining steps
    // Step 3: Bookmarks
    await nextBtn.click();
    await expect(modal.locator('#walkthrough-title')).toContainText('Bookmarking Key Realizations');
    await expect(modal.locator('text=Step 3 of 7')).toBeVisible();

    // Step 4: Finite Pages & Sealing
    await nextBtn.click();
    await expect(modal.locator('#walkthrough-title')).toContainText('Finite Pages & Page Sealing');
    await expect(modal.locator('text=Step 4 of 7')).toBeVisible();

    // Step 5: Strata Margins
    await nextBtn.click();
    await expect(modal.locator('#walkthrough-title')).toContainText('The Strata Margin Layer');
    await expect(modal.locator('text=Step 5 of 7')).toBeVisible();

    // Step 6: The Return
    await nextBtn.click();
    await expect(modal.locator('#walkthrough-title')).toContainText('The Return: One Page a Day');
    await expect(modal.locator('text=Step 6 of 7')).toBeVisible();

    // Step 7: Longitudinal Themes
    await nextBtn.click();
    await expect(modal.locator('#walkthrough-title')).toContainText('Longitudinal Themes & Constellation');
    await expect(modal.locator('text=Step 7 of 7')).toBeVisible();

    // 8. Click "Begin Reflecting" to complete walkthrough
    const finishBtn = page.locator('#walkthrough-finish-btn');
    await expect(finishBtn).toBeVisible();
    await finishBtn.click();
    await expect(modal).not.toBeVisible();

    // 9. Verify Settings Drawer Email Notification Cadence selector
    const settingsBtn = page.locator('#navbar-open-settings-btn');
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();

    // Switch to Integrations Tab in Settings Drawer
    const integrationsTab = page.locator('#settings-tab-integrations');
    await expect(integrationsTab).toBeVisible();
    await integrationsTab.click();

    // Verify cadence options exist
    await expect(page.locator('#settings-cadence-conclusion')).toBeVisible();
    await expect(page.locator('#settings-cadence-weekly_digest')).toBeVisible();
    await expect(page.locator('#settings-cadence-off')).toBeVisible();

    // Select Weekly Digest and verify schedule picker appears
    await page.locator('#settings-cadence-weekly_digest').click();
    await expect(page.locator('#settings-weekly-digest-day')).toBeVisible();
    await expect(page.locator('#settings-weekly-digest-hour')).toBeVisible();
  });
});
