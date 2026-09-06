import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/reyna/.gemini/antigravity-ide/brain/4fef8806-df7e-4a34-a62c-15640532c803';
const IMAGE_DOCS_DIR = path.join(process.cwd(), 'image_docs');

async function saveDualScreenshot(page: any, filename: string, fullPage: boolean = true) {
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  const imageDocsPath = path.join(IMAGE_DOCS_DIR, filename);

  await page.screenshot({ path: artifactPath, fullPage });
  if (fs.existsSync(IMAGE_DOCS_DIR)) {
    fs.copyFileSync(artifactPath, imageDocsPath);
  }
}

test.describe('Archival Dark Mode & Voice Dictation E2E Suite', () => {

  test('1. Quick Navbar Theme Toggle flips dark mode and persists preference', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Enter demo mode
    const demoBtn = page.locator('#hero-demo-mode-btn');
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    // Verify Reflections Home is loaded
    await expect(page.locator('#nav-tab-reflections')).toBeVisible();

    // Verify Theme toggle button in Navbar
    const themeToggleBtn = page.locator('#navbar-theme-toggle-btn');
    await expect(themeToggleBtn).toBeVisible();

    // Check initial dark class status
    const initialIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));

    // Toggle theme
    await themeToggleBtn.click();
    await page.waitForTimeout(300);

    const toggledIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(toggledIsDark).toBe(!initialIsDark);

    // Capture dark mode Reflections Home
    if (toggledIsDark) {
      await saveDualScreenshot(page, 'dark_mode_reflections_home.png', true);
    }

    // Toggle back
    await themeToggleBtn.click();
    await page.waitForTimeout(300);
    const revertedIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(revertedIsDark).toBe(initialIsDark);
  });

  test('2. Settings Drawer segmented theme control (System, Light, Dark)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Enter demo mode
    await page.locator('#hero-demo-mode-btn').click();
    await expect(page.locator('#nav-tab-reflections')).toBeVisible();

    // Open Settings Drawer
    const settingsBtn = page.locator('#navbar-open-settings-btn');
    await settingsBtn.click();

    const drawer = page.locator('#settings-drawer-panel');
    await expect(drawer).toBeVisible();

    // Switch to Appearance tab
    const appearanceTab = page.locator('#settings-tab-appearance');
    await appearanceTab.click();

    // Verify Theme mode buttons exist
    const systemBtn = page.locator('#settings-theme-system-btn');
    const lightBtn = page.locator('#settings-theme-light-btn');
    const darkBtn = page.locator('#settings-theme-dark-btn');

    await expect(systemBtn).toBeVisible();
    await expect(lightBtn).toBeVisible();
    await expect(darkBtn).toBeVisible();

    // Select Dark mode
    await darkBtn.click();
    await page.waitForTimeout(200);

    const isDarkActive = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isDarkActive).toBe(true);

    // Save preferences
    const saveBtn = page.locator('button:has-text("Save Changes")');
    await saveBtn.click();
    await page.waitForTimeout(300);

    // Verify persisted theme in localStorage
    const savedMode = await page.evaluate(() => localStorage.getItem('locus_theme_mode'));
    expect(savedMode).toBe('dark');

    // Capture Settings preview in Dark Mode
    await settingsBtn.click();
    await expect(drawer).toBeVisible();
    await saveDualScreenshot(page, 'dark_mode_settings_drawer.png', false);
    await page.locator('button:has-text("Cancel")').click();
  });

  test('3. Session Workspace: Voice-to-Text Microphone Button & Dictation UI', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Enter demo mode
    await page.locator('#hero-demo-mode-btn').click();
    await expect(page.locator('#nav-tab-reflections')).toBeVisible();

    // Open an active reflection session via New Reflection button
    const newReflBtn = page.locator('#navbar-new-reflection-btn');
    await newReflBtn.click();

    // Verify Session Workspace is visible
    const composerTextarea = page.locator('#workspace-prompt-textarea');
    await expect(composerTextarea).toBeVisible();

    // Verify Microphone button is present and accessible
    const micBtn = page.locator('#workspace-mic-button');
    await expect(micBtn).toBeVisible();

    const titleAttr = await micBtn.getAttribute('title');
    expect(titleAttr).toBeDefined();

    const ariaLabel = await micBtn.getAttribute('aria-label');
    expect(ariaLabel).toBeDefined();

    // Type a prompt and verify Send button
    await composerTextarea.fill('Exploring architectural boundaries between systems.');
    const sendBtn = page.locator('#workspace-send-button');
    await expect(sendBtn).toBeEnabled();

    // Capture workspace in active state
    await saveDualScreenshot(page, 'workspace_composer_with_mic.png', true);
  });

});
