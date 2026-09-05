import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/reyna/.gemini/antigravity-ide/brain/4fef8806-df7e-4a34-a62c-15640532c803';
const IMAGE_DOCS_DIR = path.join(process.cwd(), 'image_docs');

// Helper to save screenshot to both artifact dir and image_docs
async function saveDualScreenshot(page: any, filename: string, fullPage: boolean = true) {
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  const imageDocsPath = path.join(IMAGE_DOCS_DIR, filename);

  await page.screenshot({ path: artifactPath, fullPage });
  if (fs.existsSync(IMAGE_DOCS_DIR)) {
    fs.copyFileSync(artifactPath, imageDocsPath);
  }
}

test.describe('Phase 3.5 Screen Architecture & Verification Suite', () => {

  test('1. Landing Page -> Demo Mode -> Reflections Home (Ready for Synthesis Ribbon & Tag Wrap)', async ({ page }) => {
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

    // Ready for Synthesis Ribbon (renamed in Phase 3.5)
    const synthesisRibbon = page.locator('text=Ready for Synthesis');
    await expect(synthesisRibbon).toBeVisible();

    // Google Keep-Style Cards
    const cards = page.locator('div[role="button"][aria-label^="Reflection:"]');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(5);

    // Capture Desktop Reflections Home screenshot
    await saveDualScreenshot(page, 'screen1_reflections_home_desktop.png', true);

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
    await saveDualScreenshot(page, 'screen1_reflections_home_mobile.png', false);
  });

  test('2. Screen 2: Concluded Sealed Reader (Transcript Left, Strata Margins Right)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 850 });
    await page.goto('/');

    // Enter Demo Mode
    await page.locator('#hero-demo-mode-btn').click();
    await page.waitForSelector('#nav-tab-reflections');

    // Click on the first concluded reflection card to open sealed reader
    const firstCard = page.locator('div[role="button"][aria-label^="Reflection:"]').first();
    await firstCard.click();

    // Verify Sealed Reader & Margins elements
    await expect(page.locator('text=The Page is Set · Immutable')).toBeVisible();
    await expect(page.locator('text=The Margins')).toBeVisible();

    // Left pane: Reading Turns Stream
    const userBubbles = page.locator('[id^="reader-turn-"]');
    await expect(userBubbles.first()).toBeVisible();

    // Right pane: Margins Gutter with Temporal Stamps & Write Note CTA
    const marginGutter = page.locator('aside');
    await expect(marginGutter).toBeVisible();
    await expect(page.locator('button:has-text("Write Note")')).toBeVisible();

    // Capture Sealed Reader screenshot
    await saveDualScreenshot(page, 'screen2_session_workspace.png', true);

    // Return to Reflections Home
    const backBtn = page.locator('button:has-text("Reflections")').first();
    await backBtn.click();
    await expect(page.locator('#nav-tab-reflections')).toBeVisible();

    // Open an Active Reflection Workspace via New Reflection
    const newReflBtn = page.locator('#navbar-new-reflection-btn');
    await newReflBtn.click();

    // Verify Active Session Workspace elements
    const sessionWorkspace = page.locator('#session-workspace-container');
    await expect(sessionWorkspace).toBeVisible();
    await expect(page.locator('button:has-text("Conclude & Seal")')).toBeVisible();
  });

  test('3. Screen 3: Themes Timeline & Hybrid Concept Graph (Physics, Pills, Sub-Graph Drill-Down)', async ({ page }) => {
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
    await saveDualScreenshot(page, 'screen3_themes_timeline.png', true);

    // Mode B: Switch to Concept Graph
    const graphTabBtn = page.locator('button:has-text("Concept Graph")');
    await graphTabBtn.click();
    await page.waitForTimeout(400);

    // Verify SVG interactive graph rendered
    const svgElement = page.locator('#concept-graph-svg');
    await expect(svgElement).toBeVisible();

    // Verify Center "YOU" Node
    const centerNode = page.locator('text="YOU"');
    await expect(centerNode).toBeVisible();

    // Verify collision-buffered pill badges outside node circles
    const pillBadges = page.locator('g[id^="theme-badge-"]');
    await expect(pillBadges.first()).toBeVisible();

    // Capture Concept Graph constellation screenshot
    await saveDualScreenshot(page, 'screen3_themes_concept_graph.png', true);

    // Test Double-Click Drill-Down into Observation Sub-Graph Trajectory
    const firstThemeNode = page.locator('g[id^="theme-node-"]').first();
    await firstThemeNode.dblclick();
    await page.waitForTimeout(400);

    // Verify Observation Trajectory Sub-Graph view:
    // 1. Breadcrumbs `< Constellation`
    const breadcrumbBtn = page.locator('button:has-text("Constellation")');
    await expect(breadcrumbBtn).toBeVisible();

    // 2. Trajectory directed arrow marker
    const arrowMarker = page.locator('svg marker#trajectory-arrow');
    await expect(arrowMarker).toBeAttached();

    // 3. Observation node pills rendered
    const obsNodes = page.locator('g[id^="obs-node-"]');
    await expect(obsNodes.first()).toBeVisible();

    // Capture Observation Trajectory Sub-Graph screenshot
    await saveDualScreenshot(page, 'screen3_themes_observation_trajectory.png', true);

    // Click breadcrumb to return back to constellation
    await breadcrumbBtn.click();
    await page.waitForTimeout(300);
    await expect(centerNode).toBeVisible();
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
    await saveDualScreenshot(page, 'screen4_settings_drawer.png', true);
  });
});
