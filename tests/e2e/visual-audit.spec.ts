import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/reyna/.gemini/antigravity-ide/brain/4fef8806-df7e-4a34-a62c-15640532c803';
const AUDIT_BASE_DIR = path.join(process.cwd(), 'image_docs', 'visual_audit');

// Ensure output directories exist
function ensureDirs(theme: string) {
  const themeDir = path.join(AUDIT_BASE_DIR, theme);
  if (!fs.existsSync(themeDir)) {
    fs.mkdirSync(themeDir, { recursive: true });
  }
  return themeDir;
}

async function captureAuditScreen(page: any, theme: string, screenKey: string) {
  const themeDir = ensureDirs(theme);
  const filename = `${screenKey}.png`;
  const imageDocsPath = path.join(themeDir, filename);
  const artifactPath = path.join(ARTIFACT_DIR, `${theme}_${filename}`);

  await page.screenshot({ path: imageDocsPath, fullPage: true });
  try {
    fs.copyFileSync(imageDocsPath, artifactPath);
  } catch {}
}

const THEMES = ['light', 'dark'] as const;

test.describe('Automated Visual Screen Audit (Light & Dark Modes)', () => {

  for (const currentTheme of THEMES) {
    test(`Run full screen evaluation cycle for ${currentTheme.toUpperCase()} mode`, async ({ page }) => {
      test.setTimeout(60000);
      await page.setViewportSize({ width: 1280, height: 800 });

      // Pre-seed theme preference in localStorage before navigating
      await page.addInitScript((themeVal) => {
        localStorage.setItem('locus_theme_preference', themeVal);
      }, currentTheme);

      // ================= 1. LANDING PAGE =================
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Ensure class state aligns with target theme
      await page.evaluate((themeVal) => {
        if (themeVal === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }, currentTheme);
      await page.waitForTimeout(400);

      await expect(page.locator('h1')).toContainText('Reflect with depth');
      await captureAuditScreen(page, currentTheme, '01_landing_page');

      // ================= 2. DEMO MODE -> REFLECTIONS HOME =================
      const demoBtn = page.locator('#hero-demo-mode-btn');
      await expect(demoBtn).toBeVisible();
      await demoBtn.click();
      await page.waitForTimeout(500);

      // Verify Reflections Home loaded
      await expect(page.locator('#nav-tab-reflections')).toBeVisible();
      const reflectionCards = page.locator('div[role="button"][aria-label^="Reflection:"]');
      await expect(reflectionCards.first()).toBeVisible();
      await captureAuditScreen(page, currentTheme, '02_reflections_home');

      // ================= 3. SESSION WORKSPACE (EMPTY STATE) =================
      const newBtn = page.locator('#navbar-new-reflection-btn');
      await expect(newBtn).toBeVisible();
      await newBtn.click();
      await page.waitForTimeout(400);

      await expect(page.locator('#workspace-prompt-textarea')).toBeVisible();
      await expect(page.locator('#workspace-mic-button')).toBeVisible();
      await captureAuditScreen(page, currentTheme, '03_workspace_empty');

      // ================= 4. SESSION WORKSPACE (ACTIVE CONVERSATION) =================
      // Enter a reflection message and submit
      const composer = page.locator('#workspace-prompt-textarea');
      await composer.fill('Reflecting on today: stepping back from the rush and feeling grounded.');
      const sendBtn = page.locator('#workspace-send-button');
      await expect(sendBtn).toBeEnabled();
      await sendBtn.click();
      await page.waitForTimeout(1000);

      await captureAuditScreen(page, currentTheme, '04_workspace_conversation');

      // ================= 5. ENTRY READER WITH STRATA MARGINS =================
      // Return to reflections home and click into a sealed reflection
      await page.locator('#nav-tab-reflections').click();
      await page.waitForTimeout(600);

      // Click concluded reflection card (index 1 is a concluded founder entry) to open immutable reader
      const concludedCard = page.locator('div[role="button"][aria-label^="Reflection:"]').nth(1);
      await expect(concludedCard).toBeVisible();
      await concludedCard.click();
      await page.waitForTimeout(800);

      await expect(page.locator('text=The Page is Set · Immutable')).toBeVisible();
      await captureAuditScreen(page, currentTheme, '05_entry_margins');

      // ================= 6. THEMES & TRAJECTORIES (TIMELINE VIEW) =================
      const navThemesTab = page.locator('#nav-tab-themes');
      await expect(navThemesTab).toBeVisible();
      await navThemesTab.click();
      await page.waitForTimeout(500);

      // Ensure timeline tab is active
      const timelineSubTab = page.locator('button:has-text("Timeline")');
      if (await timelineSubTab.isVisible()) {
        await timelineSubTab.click();
        await page.waitForTimeout(300);
      }
      await captureAuditScreen(page, currentTheme, '06_themes_timeline');

      // ================= 7. CONCEPT GRAPH (MACRO CONSTELLATION) =================
      const graphSubTab = page.locator('#themes-tab-graph, button:has-text("Concept Graph")');
      await expect(graphSubTab).toBeVisible();
      await graphSubTab.click();
      await page.waitForTimeout(1200); // Allow bloom & springs to settle

      await expect(page.locator('#concept-graph-svg')).toBeVisible();
      await captureAuditScreen(page, currentTheme, '07_concept_graph_macro');

      // ================= 8. CONCEPT GRAPH (MICRO ZOOMED TRAJECTORY) =================
      // Double click first theme node to trigger zoomed spiral bloom
      const firstThemeNode = page.locator('g[id^="theme-node-"]').first();
      await expect(firstThemeNode).toBeVisible();
      await firstThemeNode.dblclick();
      await page.waitForTimeout(1400); // Wait for observation spiral bloom animation

      await expect(page.locator('#graph-back-to-constellation')).toBeVisible();
      await captureAuditScreen(page, currentTheme, '08_concept_graph_zoomed');

      // ================= 9. THE RETURN (LOOKING BACK VIEW) =================
      const lookingBackTab = page.locator('#nav-tab-return');
      if (await lookingBackTab.isVisible()) {
        await lookingBackTab.click();
        await page.waitForTimeout(600);
        await captureAuditScreen(page, currentTheme, '09_the_return_view');
      }

      // ================= 10. SETTINGS DRAWER =================
      // Return to Reflections to open settings cleanly
      await page.locator('#nav-tab-reflections').click();
      await page.waitForTimeout(300);

      const settingsBtn = page.locator('#navbar-open-settings-btn');
      await expect(settingsBtn).toBeVisible();
      await settingsBtn.click();
      await page.waitForTimeout(400);

      await expect(page.locator('#settings-drawer-panel')).toBeVisible();
      await captureAuditScreen(page, currentTheme, '10_settings_drawer');

      // Close settings drawer
      const closeSettingsBtn = page.locator('#settings-close-drawer-btn');
      if (await closeSettingsBtn.isVisible()) {
        await closeSettingsBtn.click();
      } else {
        await page.locator('button:has-text("Cancel")').first().click();
      }
      await page.waitForTimeout(400);

      // ================= 11. GUIDED TOUR MODAL =================
      const tourBtn = page.locator('#navbar-open-tour-btn');
      if (await tourBtn.isVisible()) {
        await tourBtn.click();
        await page.waitForTimeout(500);
        await expect(page.locator('#walkthrough-modal')).toBeVisible();
        await captureAuditScreen(page, currentTheme, '11_guided_tour_modal');
      }
    });
  }

});
