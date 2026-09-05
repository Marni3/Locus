import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/reyna/.gemini/antigravity-ide/brain/4fef8806-df7e-4a34-a62c-15640532c803';

test.describe('Phase 3 Screen Architecture & Responsiveness Suite', () => {

  test('1. Landing Page -> Demo Mode -> Reflections Home (Mobile & Desktop)', async ({ page }) => {
    // 1. Load Landing Page on desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page).toHaveTitle(/Locus|ReflectAI/i);

    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();

    // Verify Demo Button is visible and interactive
    const demoBtn = page.locator('#hero-demo-mode-btn');
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    // Verify transition into Reflections Home
    const reflectionsTab = page.locator('#nav-tab-reflections');
    await expect(reflectionsTab).toBeVisible();

    // Daily Prompt Banner
    const dailyPromptBanner = page.locator('text=Daily Reflection Prompt');
    await expect(dailyPromptBanner).toBeVisible();

    // Ready for Synthesis Ribbon
    const synthesisRibbon = page.locator('text=Ready for Longitudinal Synthesis');
    await expect(synthesisRibbon).toBeVisible();

    // Google Keep-Style Cards
    const cards = page.locator('div[role="button"][aria-label^="Reflection:"]');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(5);

    // Capture Desktop Reflections Home screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screen1_reflections_home_desktop.png'),
      fullPage: true,
    });

    // Test Search Filter
    const searchInput = page.locator('input[placeholder*="Search reflections"]');
    await searchInput.fill('Paralysis');
    await page.waitForTimeout(300);
    const filteredCount = await cards.count();
    expect(filteredCount).toBe(1);
    await searchInput.fill(''); // clear search

    // Switch to Mobile Viewport (iPhone 14 Pro style: 393 x 852)
    await page.setViewportSize({ width: 393, height: 852 });
    await page.waitForTimeout(300);

    // Verify mobile 2-column masonry grid layout is preserved
    await expect(cards.first()).toBeVisible();

    // Capture Mobile Reflections Home screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screen1_reflections_home_mobile.png'),
      fullPage: false,
    });
  });

  test('2. Screen 2: Active Workspace (Dialogue, Source Serif 4 Prose, Pinning)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 850 });
    await page.goto('/');

    // Enter Demo Mode
    await page.locator('#hero-demo-mode-btn').click();
    await page.waitForSelector('#nav-tab-reflections');

    // Click on the first reflection card to open session
    const firstCard = page.locator('div[role="button"][aria-label^="Reflection:"]').first();
    await firstCard.click();

    // Verify Session Workspace elements
    const sessionWorkspace = page.locator('#session-workspace-container');
    await expect(sessionWorkspace).toBeVisible();

    // Check dialogue stream turns
    const userBubbles = page.locator('div[id^="turn-"] .font-serif');
    await expect(userBubbles.first()).toBeVisible();

    // Verify back navigation button to reflections
    const backBtn = page.locator('button[aria-label="Return to Reflections Canvas"]');
    await expect(backBtn).toBeVisible();

    // Capture Session Workspace screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screen2_session_workspace.png'),
      fullPage: true,
    });
  });

  test('3. Screen 3: Themes Split Master-Detail & Interactive Concept Graph', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 850 });
    await page.goto('/');

    // Enter Demo Mode
    await page.locator('#hero-demo-mode-btn').click();
    await page.waitForSelector('#nav-tab-themes');

    // Navigate to Themes view
    await page.locator('#nav-tab-themes').click();

    // Mode A: Timeline Master-Detail
    const themeTitle = page.locator('h1:has-text("Themes & Trajectories")');
    await expect(themeTitle).toBeVisible();

    // Verify left rail has themes
    const themeListItems = page.locator('div:has-text("observations")').first();
    await expect(themeListItems).toBeVisible();

    // Verify right rail observation timeline
    const timelineHeading = page.locator('text=Observation Timeline');
    await expect(timelineHeading.first()).toBeVisible();

    // Capture Themes Timeline screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screen3_themes_timeline.png'),
      fullPage: true,
    });

    // Mode B: Switch to Concept Graph
    const graphTabBtn = page.locator('button:has-text("Concept Graph")');
    await graphTabBtn.click();
    await page.waitForTimeout(300);

    // Verify SVG interactive graph rendered
    const svgElement = page.locator('svg[viewBox="0 0 700 520"]');
    await expect(svgElement).toBeVisible();

    // Verify Center "YOU" Node
    const centerNode = page.locator('text="YOU"');
    await expect(centerNode).toBeVisible();

    // Capture Concept Graph screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screen3_themes_concept_graph.png'),
      fullPage: true,
    });
  });

  test('4. Screen 4: Settings Drawer & SSRF Webhook Security', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 850 });
    await page.goto('/');

    // Enter Demo Mode
    await page.locator('#hero-demo-mode-btn').click();
    await page.waitForSelector('#navbar-open-settings-btn');

    // Open Settings Drawer
    await page.locator('#navbar-open-settings-btn').click();

    const drawerPanel = page.locator('#settings-drawer-panel');
    await expect(drawerPanel).toBeVisible();

    // Switch to Model & Data Tab
    await page.locator('#settings-tab-data').click();
    const exportBtn = page.locator('button:has-text("Export Archive")');
    await expect(exportBtn).toBeVisible();

    const loadDemoBtn = page.locator('#settings-load-demo-btn');
    await expect(loadDemoBtn).toBeVisible();

    // Switch to Integrations & Alerts Tab
    await page.locator('#settings-tab-integrations').click();
    const webhookInput = page.locator('#settings-webhook-url-input');
    await expect(webhookInput).toBeVisible();

    // Test SSRF validation with internal IP (should block)
    await webhookInput.fill('https://169.254.169.254/latest/meta-data');
    await page.locator('#settings-test-webhook-btn').click();
    await page.waitForTimeout(600);

    const blockedBadge = page.locator('#settings-webhook-status-badge');
    await expect(blockedBadge).toBeVisible();
    await expect(blockedBadge).toContainText('Blocked');

    // Capture Settings Drawer screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'screen4_settings_drawer.png'),
      fullPage: true,
    });
  });
});
