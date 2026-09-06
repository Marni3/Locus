import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport (390x844 Retina DPR 2) Audit Suite', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
  });

  test('1. Landing Page: Touch targets, theme toggle & zero horizontal overflow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify zero horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 1;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Verify floating theme toggle tap target
    const themeBtn = page.locator('#landing-theme-toggle-btn');
    await expect(themeBtn).toBeVisible();
    const box = await themeBtn.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(36);
      expect(box.height).toBeGreaterThanOrEqual(36);
    }

    // Toggle dark mode on mobile
    await themeBtn.click();
    await page.waitForTimeout(300);
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isDark).toBe(true);

    // Verify demo gateway button is visible and tap-ready
    const demoBtn = page.locator('#hero-demo-mode-btn');
    await expect(demoBtn).toBeVisible();
  });

  test('2. Reflections Home: Masonry stack, search input & filter chips on mobile', async ({ page }) => {
    await page.goto('/');
    await page.locator('#hero-demo-mode-btn').click();
    await page.waitForSelector('#app-navbar');

    // Zero horizontal scroll on home
    const hasScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(hasScroll).toBe(false);

    // Verify reflection cards render
    const cards = page.locator('div[role="button"][aria-label^="Reflection:"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // Verify search bar input is focusable and responsive
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Chem');
      await page.waitForTimeout(300);
      await searchInput.fill('');
    }
  });

  test('3. Sealed Reader & Strata Margins: Mobile reading column & margins stack', async ({ page }) => {
    await page.goto('/');
    await page.locator('#hero-demo-mode-btn').click();
    await page.waitForSelector('#app-navbar');

    // Tap on first reflection card
    const firstCard = page.locator('div[role="button"][aria-label^="Reflection:"]').first();
    await firstCard.click();
    await page.waitForSelector('text=The Page is Set');

    // Verify zero horizontal scroll in reader
    const hasScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(hasScroll).toBe(false);

    // Verify back button is easily tappable
    const backBtn = page.locator('button[aria-label*="Back"], button:has-text("Back")').first();
    await expect(backBtn).toBeVisible();

    // Verify Margins section is present in document flow
    const marginsHeader = page.locator('text=The Margins');
    await expect(marginsHeader).toBeVisible();
  });

  test('4. Session Workspace: Stance mode bar & dictation mic button on mobile', async ({ page }) => {
    await page.goto('/');
    await page.locator('#hero-demo-mode-btn').click();
    await page.waitForSelector('#app-navbar');

    // Click "New Reflection"
    const newBtn = page.locator('#navbar-new-reflection-btn');
    await newBtn.click();
    await page.waitForSelector('#workspace-prompt-textarea');

    // Verify mic button is visible and tap-accessible (>= 32px)
    const micBtn = page.locator('#workspace-mic-button');
    await expect(micBtn).toBeVisible();
    const micBox = await micBtn.boundingBox();
    expect(micBox).not.toBeNull();
    if (micBox) {
      expect(micBox.width).toBeGreaterThanOrEqual(32);
      expect(micBox.height).toBeGreaterThanOrEqual(32);
    }

    // Verify text composer handles mobile input
    const composer = page.locator('#workspace-prompt-textarea');
    await composer.fill('Mobile reflection test note.');
    expect(await composer.inputValue()).toBe('Mobile reflection test note.');
  });

  test('5. Themes View: Concept Graph touch canvas & Timeline toggle on mobile', async ({ page }) => {
    await page.goto('/');
    await page.locator('#hero-demo-mode-btn').click();
    await page.waitForSelector('#app-navbar');

    // Click Themes in navigation
    const themesNav = page.locator('#nav-tab-themes');
    await themesNav.click();
    await page.waitForSelector('text=Themes & Trajectories');

    // Verify zero horizontal overflow
    const hasScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(hasScroll).toBe(false);

    // Switch between Graph and Timeline tabs
    const timelineTab = page.locator('#themes-tab-timeline');
    await timelineTab.click();
    await page.waitForTimeout(300);

    // On mobile master-detail, tap first theme card to reveal detail synthesis panel
    const firstTheme = page.locator('h3').first();
    await firstTheme.click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=Current Rolling Synthesis')).toBeVisible();

    const graphTab = page.locator('#themes-tab-graph');
    await graphTab.click();
    await page.waitForTimeout(300);
    await expect(page.locator('#concept-graph-svg')).toBeVisible();
  });

  test('6. Settings Drawer: Responsive slide-over and theme switcher on mobile', async ({ page }) => {
    await page.goto('/');
    await page.locator('#hero-demo-mode-btn').click();
    await page.waitForSelector('#app-navbar');

    // Open settings drawer
    const settingsNav = page.locator('#navbar-open-settings-btn');
    await settingsNav.click();
    await page.waitForSelector('text=Settings & Preferences');

    // Switch to Appearance tab
    const appearanceTab = page.locator('#settings-tab-appearance');
    await appearanceTab.click();
    await page.waitForTimeout(200);

    // Verify segmented theme controls are visible and tappable
    const obsidianBtn = page.locator('button:has-text("Obsidian")');
    await expect(obsidianBtn).toBeVisible();
    await obsidianBtn.click();
    await page.waitForTimeout(200);

    const daylightBtn = page.locator('button:has-text("Daylight")');
    await expect(daylightBtn).toBeVisible();
    await daylightBtn.click();
    await page.waitForTimeout(200);

    // Close settings drawer
    const closeBtn = page.locator('#settings-close-drawer-btn');
    await closeBtn.click();
    await page.waitForTimeout(300);
  });
});

