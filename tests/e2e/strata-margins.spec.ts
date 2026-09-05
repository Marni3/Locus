import { test, expect } from '@playwright/test';

test.describe('Strata Margin Layer & Sealed Page E2E', () => {
  test('concluded entry opens in sealed reader with immutable body and interactive margins', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // 1. Enter Demo Mode
    const demoBtn = page.locator('#hero-demo-mode-btn');
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    // 2. Locate Concluded Entry card on Reflections Home
    const reflectionsTab = page.locator('#nav-tab-reflections');
    await expect(reflectionsTab).toBeVisible();

    // Click Concluded tab
    const concludedTab = page.locator('button:has-text("concluded")');
    await expect(concludedTab).toBeVisible();
    await concludedTab.click();

    // Click on the first concluded card
    const firstCard = page.locator('div[role="button"][aria-label^="Reflection:"]').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    // 3. Verify Sealed Reader Header & Immutability Notice
    await expect(page.locator('text=The Margins')).toBeVisible();
    await expect(page.locator('text=Concluded')).toBeVisible();

    // Verify sample demo strata are rendered with Courier Prime temporal stamps
    const marginGutter = page.locator('aside');
    await expect(marginGutter).toBeVisible();
    await expect(marginGutter.locator('text=Correction').first()).toBeVisible();

    // 4. Click "Write Note" in the margin gutter
    const writeNoteBtn = page.locator('button:has-text("Write Note")');
    await expect(writeNoteBtn).toBeVisible();
    await writeNoteBtn.click();

    // 5. Fill in new margin note and select stance
    const textarea = page.locator('textarea[placeholder*="Write in the margins"]');
    await expect(textarea).toBeVisible();
    await textarea.fill('94 days later: verified that starting with the simplest interface solved the block.');

    const sealBtn = page.locator('button:has-text("Seal in Margin")');
    await expect(sealBtn).toBeVisible();
    await sealBtn.click();

    // 6. Verify newly sealed note appears in the margin column
    await expect(marginGutter.locator('text=verified that starting with the simplest interface')).toBeVisible();

    // 7. Test Bookmarks Drawer Integration
    const bookmarksBtn = page.locator('#navbar-open-bookmarks-btn');
    await expect(bookmarksBtn).toBeVisible();
    await bookmarksBtn.click();

    // Verify Bookmarks Drawer slides in
    await expect(page.locator('text=Saved Bookmarks')).toBeVisible();
    await expect(page.locator('text=Chronological')).toBeVisible();

    // Close Bookmarks Drawer
    const closeBtn = page.locator('button[aria-label="Close bookmarks drawer"]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
  });
});
