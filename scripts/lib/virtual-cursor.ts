import { Page, Locator } from '@playwright/test';

export class VirtualCursor {
  private page: Page;
  private currentX: number = 200;
  private currentY: number = 200;
  private defaultPause: number = 1800; // 1.8s calm default pause

  constructor(page: Page, defaultPause = 1800) {
    this.page = page;
    this.defaultPause = defaultPause;
  }

  /**
   * Injects the virtual cursor elements and animation scripts into the DOM.
   */
  async init(startX = 200, startY = 200) {
    this.currentX = startX;
    this.currentY = startY;

    await this.page.addInitScript(() => {
      window.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('playwright-virtual-cursor')) return;

        const cursorContainer = document.createElement('div');
        cursorContainer.id = 'playwright-virtual-cursor';
        cursorContainer.style.cssText = `
          position: fixed;
          left: 0;
          top: 0;
          width: 24px;
          height: 24px;
          z-index: 2147483647;
          pointer-events: none;
          transform: translate(200px, 200px);
          filter: drop-shadow(0 2px 5px rgba(0,0,0,0.4));
          transition: opacity 0.2s ease;
        `;

        // Modern macOS / iOS inspired sleek dark arrow pointer with white hairline
        cursorContainer.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.5 3.2L18.5 13.5L12.5 14.5L9.5 20.8L7.2 19.8L10.2 13.8L5.5 13.2L5.5 3.2Z" 
                  fill="#1E1D19" 
                  stroke="#FFFFFF" 
                  stroke-width="1.8" 
                  stroke-linejoin="round"/>
          </svg>
        `;

        const ripple = document.createElement('div');
        ripple.id = 'playwright-cursor-ripple';
        ripple.style.cssText = `
          position: fixed;
          left: 0;
          top: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(59, 122, 87, 0.45);
          border: 1.5px solid rgba(59, 122, 87, 0.85);
          z-index: 2147483646;
          pointer-events: none;
          transform: translate(200px, 200px) scale(0);
          opacity: 0;
          transition: transform 0.45s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 0.45s ease-out;
        `;

        document.body.appendChild(ripple);
        document.body.appendChild(cursorContainer);
      });
    });

    // Also inject immediately if page is already loaded
    await this.page.evaluate(({ sx, sy }) => {
      if (document.getElementById('playwright-virtual-cursor')) return;

      const cursorContainer = document.createElement('div');
      cursorContainer.id = 'playwright-virtual-cursor';
      cursorContainer.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 24px;
        height: 24px;
        z-index: 2147483647;
        pointer-events: none;
        transform: translate(${sx}px, ${sy}px);
        filter: drop-shadow(0 2px 5px rgba(0,0,0,0.4));
        transition: opacity 0.2s ease;
      `;

      cursorContainer.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.5 3.2L18.5 13.5L12.5 14.5L9.5 20.8L7.2 19.8L10.2 13.8L5.5 13.2L5.5 3.2Z" 
                fill="#1E1D19" 
                stroke="#FFFFFF" 
                stroke-width="1.8" 
                stroke-linejoin="round"/>
        </svg>
      `;

      const ripple = document.createElement('div');
      ripple.id = 'playwright-cursor-ripple';
      ripple.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(59, 122, 87, 0.45);
        border: 1.5px solid rgba(59, 122, 87, 0.85);
        z-index: 2147483646;
        pointer-events: none;
        transform: translate(${sx}px, ${sy}px) scale(0);
        opacity: 0;
        transition: transform 0.45s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 0.45s ease-out;
      `;

      document.body.appendChild(ripple);
      document.body.appendChild(cursorContainer);
    }, { sx: startX, sy: startY });

    await this.page.mouse.move(startX, startY);
  }

  /**
   * Smoothly moves virtual cursor from current position to (targetX, targetY)
   * using cubic-bezier interpolation while dispatching real mouse moves.
   */
  async moveToCoords(targetX: number, targetY: number, durationMs = 600) {
    const startX = this.currentX;
    const startY = this.currentY;
    const steps = Math.max(15, Math.floor(durationMs / 16)); // ~60fps steps
    const stepDuration = durationMs / steps;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      // easeOutCubic: 1 - Math.pow(1 - t, 3)
      const eased = 1 - Math.pow(1 - t, 3);
      const x = Math.round(startX + (targetX - startX) * eased);
      const y = Math.round(startY + (targetY - startY) * eased);

      await this.page.evaluate(({ px, py }) => {
        const c = document.getElementById('playwright-virtual-cursor');
        if (c) c.style.transform = `translate(${px}px, ${py}px)`;
      }, { px: x, py: y });

      await this.page.mouse.move(x, y);
      await this.page.waitForTimeout(stepDuration);
    }

    this.currentX = targetX;
    this.currentY = targetY;
  }

  /**
   * Moves to center of an element identified by selector or Locator.
   */
  async moveTo(target: string | Locator, durationMs = 600) {
    let locator: Locator;
    if (typeof target === 'string') {
      locator = this.page.locator(target).first();
    } else {
      locator = target.first();
    }

    const box = await locator.boundingBox();
    if (!box) {
      console.warn(`[VirtualCursor] Element not visible for bounding box: ${target}`);
      return;
    }

    const targetX = Math.round(box.x + box.width / 2);
    const targetY = Math.round(box.y + box.height / 2);
    await this.moveToCoords(targetX, targetY, durationMs);
  }

  /**
   * Triggers a subtle click-pulse ripple at the cursor's current position.
   */
  async clickPulse() {
    await this.page.evaluate(({ x, y }) => {
      const r = document.getElementById('playwright-cursor-ripple');
      if (!r) return;
      r.style.transition = 'none';
      r.style.transform = `translate(${x - 16}px, ${y - 16}px) scale(0)`;
      r.style.opacity = '0.9';

      // Force reflow
      void r.offsetWidth;

      r.style.transition = 'transform 0.45s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 0.45s ease-out';
      r.style.transform = `translate(${x - 16}px, ${y - 16}px) scale(1.75)`;
      r.style.opacity = '0';
    }, { x: this.currentX, y: this.currentY });
  }

  /**
   * Smoothly glides to an element, pulses, clicks it, and pauses for viewer readability.
   */
  async click(target: string | Locator, pauseAfterMs?: number, moveDurationMs = 600) {
    let locator: Locator;
    if (typeof target === 'string') {
      locator = this.page.locator(target).first();
    } else {
      locator = target.first();
    }

    await this.moveTo(locator, moveDurationMs);
    await this.page.waitForTimeout(150); // slight settle pause
    await this.clickPulse();
    await locator.click();

    const pause = pauseAfterMs ?? this.defaultPause;
    await this.page.waitForTimeout(pause);
  }

  /**
   * Drags from an element by deltaX, deltaY to showcase liquid spring physics.
   */
  async drag(target: string | Locator, deltaX: number, deltaY: number, durationMs = 800) {
    await this.moveTo(target, 600);
    await this.page.waitForTimeout(200);

    await this.page.mouse.down();
    await this.page.waitForTimeout(100);

    const destX = this.currentX + deltaX;
    const destY = this.currentY + deltaY;
    await this.moveToCoords(destX, destY, durationMs);
    await this.page.waitForTimeout(300);

    await this.page.mouse.up();
    await this.page.waitForTimeout(this.defaultPause);
  }

  /**
   * Pauses the video recording for reader contemplation (1.5s - 2.3s).
   */
  async pause(ms?: number) {
    await this.page.waitForTimeout(ms ?? this.defaultPause);
  }
}
