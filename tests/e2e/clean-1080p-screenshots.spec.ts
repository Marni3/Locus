import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/reyna/.gemini/antigravity-ide/brain/4fef8806-df7e-4a34-a62c-15640532c803';
const OUTPUT_DIR = path.join(process.cwd(), 'image_docs', 'clean_1080p');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function prepareCleanView(page: Page) {
  // Hide toast notifications via CSS injection (without mutating React DOM nodes)
  await page.addStyleTag({
    content: `
      #toast-notification-card,
      div.fixed.bottom-6 {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `
  }).catch(() => {});

  // If walkthrough modal is visible, close it
  const closeWalkthrough = page.locator('#walkthrough-close-btn');
  if (await closeWalkthrough.isVisible().catch(() => false)) {
    await closeWalkthrough.click();
  }
  await page.waitForTimeout(200);
}

async function captureClean1080p(page: Page, theme: 'light' | 'dark', screenKey: string) {
  ensureDir(OUTPUT_DIR);
  ensureDir(path.join(OUTPUT_DIR, theme));

  await prepareCleanView(page);

  const filename = `${theme}_${screenKey}.png`;
  const themeFilePath = path.join(OUTPUT_DIR, theme, `${screenKey}.png`);
  const flatFilePath = path.join(OUTPUT_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);

  // fullPage: false strictly enforces exact 1920x1080 viewport dimension
  await page.screenshot({ path: flatFilePath, fullPage: false });
  fs.copyFileSync(flatFilePath, themeFilePath);
  try {
    fs.copyFileSync(flatFilePath, artifactPath);
  } catch {}
}

const THEMES: ('light' | 'dark')[] = ['light', 'dark'];

test.describe('Clean 1920x1080 UI Screenshots Suite (Light & Dark)', () => {
  for (const currentTheme of THEMES) {
    test(`Capture clean 1080p screenshots for ${currentTheme.toUpperCase()} mode`, async ({ page }) => {
      test.setTimeout(90000);

      // 1. Set explicit 1920x1080 resolution
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Pre-seed theme preference in localStorage
      await page.addInitScript((themeVal) => {
        localStorage.setItem('locus_theme_preference', themeVal);
      }, currentTheme);

      // ================= 1. LANDING PAGE =================
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await page.evaluate((themeVal) => {
        if (themeVal === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }, currentTheme);
      await page.waitForTimeout(500);

      await expect(page.locator('h1')).toContainText('Reflect with depth');
      await captureClean1080p(page, currentTheme, '01_landing_page');

      // ================= 2. ENTER DEMO MODE -> REFLECTIONS HOME =================
      const demoBtn = page.locator('#hero-demo-mode-btn');
      await expect(demoBtn).toBeVisible();
      await demoBtn.click();
      await page.waitForTimeout(700);

      // Ensure reflections tab and cards are visible
      await expect(page.locator('#nav-tab-reflections')).toBeVisible();
      const reflectionCards = page.locator('div[role="button"][aria-label^="Reflection:"]');
      await expect(reflectionCards.first()).toBeVisible();

      await captureClean1080p(page, currentTheme, '02_reflections_home');

      // ================= 3. SESSION WORKSPACE (EMPTY COMPOSER) =================
      const newBtn = page.locator('#navbar-new-reflection-btn');
      await expect(newBtn).toBeVisible();
      await newBtn.click();
      await page.waitForTimeout(600);

      await expect(page.locator('#workspace-prompt-textarea')).toBeVisible();
      await captureClean1080p(page, currentTheme, '03_workspace_empty');

      // ================= 4. SESSION WORKSPACE (ACTIVE CONVERSATION) =================
      const composer = page.locator('#workspace-prompt-textarea');
      await composer.fill('Reflecting on today: stepping back from the rush and feeling grounded.');
      const sendBtn = page.locator('#workspace-send-button');
      await expect(sendBtn).toBeEnabled();
      await sendBtn.click();
      await page.waitForTimeout(1400);

      await captureClean1080p(page, currentTheme, '04_workspace_conversation');

      // ================= 5. ENTRY READER WITH STRATA MARGINS =================
      await page.locator('#nav-tab-reflections').click();
      await page.waitForTimeout(600);

      // Click concluded reflection card (index 1 is a concluded founder entry)
      const concludedCard = page.locator('div[role="button"][aria-label^="Reflection:"]').nth(1);
      await expect(concludedCard).toBeVisible();
      await concludedCard.click();
      await page.waitForTimeout(800);

      await expect(page.locator('text=The Page is Set · Immutable')).toBeVisible();
      await captureClean1080p(page, currentTheme, '05_entry_margins');

      // ================= 6. THEMES & TRAJECTORIES (TIMELINE VIEW) =================
      const navThemesTab = page.locator('#nav-tab-themes');
      await expect(navThemesTab).toBeVisible();
      await navThemesTab.click();
      await page.waitForTimeout(600);

      const timelineSubTab = page.locator('button:has-text("Timeline")');
      if (await timelineSubTab.isVisible()) {
        await timelineSubTab.click();
        await page.waitForTimeout(400);
      }
      await captureClean1080p(page, currentTheme, '06_themes_timeline');

      // ================= 7. CONCEPT GRAPH (MACRO CONSTELLATION) =================
      const graphSubTab = page.locator('#themes-tab-graph, button:has-text("Concept Graph")');
      await expect(graphSubTab).toBeVisible();
      await graphSubTab.click();
      await page.waitForTimeout(1500); // Allow bloom & springs to settle

      await expect(page.locator('#concept-graph-svg')).toBeVisible();
      await captureClean1080p(page, currentTheme, '07_concept_graph_macro');

      // ================= 8. CONCEPT GRAPH (MICRO ZOOMED TRAJECTORY) =================
      const firstThemeNode = page.locator('g[id^="theme-node-"]').first();
      await expect(firstThemeNode).toBeVisible();
      await firstThemeNode.dblclick();
      await page.waitForTimeout(1500); // Wait for observation spiral bloom

      await expect(page.locator('#graph-back-to-constellation')).toBeVisible();
      await captureClean1080p(page, currentTheme, '08_concept_graph_zoomed');

      // Return to constellation
      await page.locator('#graph-back-to-constellation').click();
      await page.waitForTimeout(500);

      // ================= 9. THE RETURN (LOOKING BACK VIEW) =================
      const lookingBackTab = page.locator('#nav-tab-return');
      if (await lookingBackTab.isVisible()) {
        await lookingBackTab.click();
        await page.waitForTimeout(700);
        await captureClean1080p(page, currentTheme, '09_the_return_view');
      }

      // ================= 10. SETTINGS DRAWER =================
      await page.locator('#nav-tab-reflections').click();
      await page.waitForTimeout(400);

      const settingsBtn = page.locator('#navbar-open-settings-btn');
      await expect(settingsBtn).toBeVisible();
      await settingsBtn.click();
      await page.waitForTimeout(500);

      await expect(page.locator('#settings-drawer-panel')).toBeVisible();
      await captureClean1080p(page, currentTheme, '10_settings_drawer');

      // Close settings drawer
      const closeSettingsBtn = page.locator('#settings-close-drawer-btn');
      if (await closeSettingsBtn.isVisible()) {
        await closeSettingsBtn.click();
      }
      await page.waitForTimeout(300);
    });
  }
});
