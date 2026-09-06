import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { VirtualCursor } from './lib/virtual-cursor';

interface WalkthroughOptions {
  isMobile: boolean;
  outputName: string;
  baseUrl: string;
}

async function runGuidedWalkthrough(options: WalkthroughOptions) {
  const { isMobile, outputName, baseUrl } = options;
  const recordingsDir = path.resolve('media', 'demo_recordings');
  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true });
  }

  console.log(`\n======================================================`);
  console.log(`🎬 Launching High-Fidelity Video Recording: ${outputName}`);
  console.log(`Profile: ${isMobile ? 'Mobile Flagship (430x932, 100% Full Bleed)' : 'Desktop 1080p (1920x1080 Full HD)'}`);
  console.log(`Features: Animated Virtual Cursor + 7-Step Guided Tour + Deep-Dive`);
  console.log(`Pacing: Calibrated 1.5s - 2.3s Deliberate Contemplative Pauses`);
  console.log(`======================================================\n`);

  const browser = await chromium.launch({
    headless: true,
  });

  // For mobile: viewport 430x932 matches recordVideo 430x932 exactly (1:1 edge-to-edge, zero gray border)
  const context = await browser.newContext({
    viewport: isMobile 
      ? { width: 430, height: 932 } 
      : { width: 1920, height: 1080 },
    isMobile: isMobile,
    hasTouch: isMobile,
    recordVideo: {
      dir: recordingsDir,
      size: isMobile 
        ? { width: 430, height: 932 } 
        : { width: 1920, height: 1080 },
    }
  });

  const page = await context.newPage();
  const cursor = new VirtualCursor(page, 1800);
  let tempVideoPath: string | null = null;

  try {
    // -------------------------------------------------------------
    // ACT 1: Sanctuary Welcome & Archival Theme Toggle (~18s)
    // -------------------------------------------------------------
    console.log('Act 1: Landing Page Ambiance & Archival Theme Toggle...');
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    await cursor.init(isMobile ? 215 : 960, isMobile ? 300 : 400);
    await cursor.pause(1800);

    // Toggle Dark Mode on Landing Page
    const landingThemeBtn = page.locator('#landing-theme-toggle-btn');
    if (await landingThemeBtn.isVisible()) {
      await cursor.click(landingThemeBtn, 2000); // Click and pause 2.0s to showcase Obsidian theme
      // Toggle back to Daylight for balanced demo
      await cursor.click(landingThemeBtn, 1600);
    }

    // Enter Interactive Demo Gateway
    const demoBtn = page.locator('#hero-demo-mode-btn');
    await cursor.click(demoBtn, 2000);
    await page.waitForSelector('#app-navbar');

    // -------------------------------------------------------------
    // ACT 2: The Guided Tour Backbone (All 7 Steps) (~55s)
    // -------------------------------------------------------------
    console.log('Act 2: Launching 7-Step Interactive Guided Tour...');
    // Launch tour via home button or navbar
    const tourTrigger = isMobile 
      ? page.locator('#home-open-tour-btn') 
      : page.locator('#navbar-open-tour-btn');

    if (await tourTrigger.isVisible()) {
      await cursor.click(tourTrigger, 2000);
    } else {
      // Fallback to home button
      const fallbackTour = page.locator('#home-open-tour-btn');
      if (await fallbackTour.isVisible()) {
        await cursor.click(fallbackTour, 2000);
      }
    }

    await page.waitForSelector('#walkthrough-next-btn');

    // Step 1: Canvas (15-entry archive overview)
    console.log('  Tour Step 1: Reflections Canvas...');
    await cursor.pause(2200);
    await cursor.click('#walkthrough-next-btn', 2000);

    // Step 2: Companion / Session Workspace
    console.log('  Tour Step 2: Conversational Session...');
    await cursor.pause(2200);
    await cursor.click('#walkthrough-next-btn', 2000);

    // Step 3: Bookmarking Key Realizations (drawer slides open)
    console.log('  Tour Step 3: Bookmarks Drawer...');
    await cursor.pause(2200);
    await cursor.click('#walkthrough-next-btn', 2000);

    // Step 4: Finite Page Sealing & Immutability
    console.log('  Tour Step 4: Page Sealing...');
    await cursor.pause(2200);
    await cursor.click('#walkthrough-next-btn', 2000);

    // Step 5: Strata Margins Layer
    console.log('  Tour Step 5: Strata Margins...');
    await cursor.pause(2200);
    await cursor.click('#walkthrough-next-btn', 2000);

    // Step 6: The Return (Looking Back Daily Archivist)
    console.log('  Tour Step 6: The Return...');
    await cursor.pause(2200);
    await cursor.click('#walkthrough-next-btn', 2000);

    // Step 7: Longitudinal Themes & Concept Constellation
    console.log('  Tour Step 7: Longitudinal Themes...');
    await cursor.pause(2200);
    
    // Complete Guided Tour
    const finishBtn = page.locator('#walkthrough-finish-btn');
    if (await finishBtn.isVisible()) {
      await cursor.click(finishBtn, 1800);
    }

    // -------------------------------------------------------------
    // ACT 3: Live Deep-Dive into Expanded Features (~75s)
    // -------------------------------------------------------------
    console.log('Act 3: Live Deep-Dive into Expanded Capabilities...');

    // 3.1: Search & Thematic Filtering (Reflections Home)
    console.log('  3.1: Authentic Search & Tag Filtering...');
    const reflectionsNav = page.locator('#nav-tab-reflections');
    await cursor.click(reflectionsNav, 1600);

    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await cursor.click(searchInput, 500);
      // Type Maya's actual course name
      await searchInput.pressSequentially('Chem', { delay: 130 });
      await cursor.pause(2200); // Pause to see filtered Chem reflections
      await searchInput.fill('');
      await cursor.pause(1500);
    }

    // Filter by #academic-pressure qualitative tag
    const tagBtn = page.locator('button:has-text("#academic-pressure")').first();
    if (await tagBtn.isVisible()) {
      await cursor.click(tagBtn, 2000);
      // Click again to clear
      await cursor.click(tagBtn, 1500);
    }

    // 3.2: Interactive Strata Margins (Sealed Reader)
    console.log('  3.2: Sealed Reader & Strata Marginalia...');
    const firstCard = page.locator('div[role="button"][aria-label^="Reflection:"]').first();
    if (await firstCard.isVisible()) {
      await cursor.click(firstCard, 2000);
      await page.waitForSelector('text=The Page is Set');

      // Smoothly scroll down to inspect Strata Margins
      await page.evaluate(() => {
        window.scrollBy({ top: 380, behavior: 'smooth' });
      });
      await cursor.pause(2300); // 2.3s contemplation of 24-Hour Review and 30-Day Synthesis notes

      // Return to reflections home
      const backBtn = page.locator('button:has-text("Back to Reflections"), button[aria-label*="Back"]').first();
      if (await backBtn.isVisible()) {
        await cursor.click(backBtn, 1600);
      }
    }

    // 3.3: Active Session Workspace & Voice Dictation
    console.log('  3.3: Session Workspace & Voice Dictation Mic...');
    const newReflBtn = page.locator('#navbar-new-reflection-btn');
    await cursor.click(newReflBtn, 1800);
    await page.waitForSelector('#workspace-prompt-textarea');

    // Hover Voice Dictation Mic Button
    const micBtn = page.locator('#workspace-mic-button');
    if (await micBtn.isVisible()) {
      await cursor.moveTo(micBtn, 600);
      await cursor.pause(1800); // Showing accessible dictation tooltip and active target
    }

    // Type a reflective thought in the prompt composer
    const textarea = page.locator('#workspace-prompt-textarea');
    await cursor.click(textarea, 400);
    await textarea.pressSequentially(
      'Reflecting on how to maintain intellectual stamina without burning out during midterm week.',
      { delay: 35 }
    );
    await cursor.pause(2000);

    // 3.4: Spiral Petal Bloom & Liquid Physics (Themes & Concept Graph)
    console.log('  3.4: Concept Graph Spiral Bloom & Physics...');
    const themesNav = page.locator('#nav-tab-themes');
    await cursor.click(themesNav, 1800);

    const graphTab = page.locator('#themes-tab-graph');
    if (await graphTab.isVisible()) {
      await cursor.click(graphTab, 600);
      await page.waitForSelector('#concept-graph-svg');
      // Pause 2.3s to watch the Fibonacci Spiral Petal Bloom unfurl smoothly
      await cursor.pause(2300);

      // Liquid Physics: Drag a theme node across the canvas on desktop
      if (!isMobile) {
        const themeNode = page.locator('g[id^="node-group-theme-"]').first();
        if (await themeNode.isVisible()) {
          console.log('    Dragging theme node to demonstrate orbital liquid springs...');
          await cursor.drag(themeNode, 90, 70, 900);
          await cursor.pause(2000);
        }
      }

      // Micro-Trajectory Zoom: Focus Trajectory
      const focusBtn = page.locator('button:has-text("Focus Trajectory")');
      if (await focusBtn.isVisible()) {
        await cursor.click(focusBtn, 2300); // 2.3s pause viewing observation satellites
      }
    }

    // 3.5: Archival Preferences & Local Data Export
    console.log('  3.5: Archival Settings & Privacy Sanctuary...');
    const settingsBtn = page.locator('#navbar-open-settings-btn');
    await cursor.click(settingsBtn, 1800);
    await page.waitForSelector('text=Settings & Preferences');

    // Archival & Aesthetic tab
    const appearanceTab = page.locator('#settings-tab-appearance');
    if (await appearanceTab.isVisible()) {
      await cursor.click(appearanceTab, 1600);

      // Preview Obsidian dark mode
      const obsidianBtn = page.locator('button:has-text("Obsidian")');
      if (await obsidianBtn.isVisible()) {
        await cursor.click(obsidianBtn, 2000);
      }

      // Preview Daylight mode
      const daylightBtn = page.locator('button:has-text("Daylight")');
      if (await daylightBtn.isVisible()) {
        await cursor.click(daylightBtn, 1800);
      }
    }

    // Close settings drawer
    const closeBtn = page.locator('#settings-close-drawer-btn');
    if (await closeBtn.isVisible()) {
      await cursor.click(closeBtn, 1600);
    }

    // Return home for serene final closing posture
    await cursor.click('#nav-tab-reflections', 2300);

    console.log(`\n✅ Finished All 3 Acts Smoothly for: ${outputName}\n`);
  } catch (error) {
    console.error(`❌ Error during recording of ${outputName}:`, error);
  } finally {
    const video = page.video();
    if (video) {
      tempVideoPath = await video.path();
    }
    await page.close();
    await context.close();
    await browser.close();

    if (tempVideoPath && fs.existsSync(tempVideoPath)) {
      const destination = path.join(recordingsDir, outputName);
      if (fs.existsSync(destination)) {
        fs.unlinkSync(destination);
      }
      fs.renameSync(tempVideoPath, destination);
      console.log(`🎉 Successfully saved demo recording to: ${destination}`);
      const stats = fs.statSync(destination);
      console.log(`📦 Video File Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    } else {
      console.warn('⚠️ No video file generated or found at temp path.');
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  const doDesktop = args.includes('--desktop') || args.length === 0;
  const doMobile = args.includes('--mobile') || args.length === 0;

  if (doDesktop) {
    await runGuidedWalkthrough({
      isMobile: false,
      outputName: 'locus_desktop_walkthrough_1080p.webm',
      baseUrl
    });
  }

  if (doMobile) {
    await runGuidedWalkthrough({
      isMobile: true,
      outputName: 'locus_mobile_walkthrough_retina.webm',
      baseUrl
    });
  }
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
