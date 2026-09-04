import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  compileMorningDigest,
  checkWebhookRateLimit,
  MAX_WEBHOOKS_PER_HOUR,
  dispatchWebhook,
  dispatchMorningDigestEmail,
} from '../../src/integrations/notifications';
import { Entry, Theme } from '../../src/types';
import * as ssrfValidator from '../../src/integrations/notifications/ssrfValidator';

describe('Notification Dispatcher & Morning Digest (Tier 2 TDD)', () => {
  const sampleEntries: Entry[] = [
    {
      id: 'e1',
      userId: 'user-notif',
      title: 'Balancing Speed and Care',
      createdAt: new Date().toISOString(),
      concludedAt: new Date().toISOString(),
      status: 'concluded',
      summary: 'Realized that deliberate pacing increases overall development velocity.',
    },
  ];

  const sampleThemes: Theme[] = [
    {
      id: 't1',
      userId: 'user-notif',
      title: 'Mindful Velocity',
      currentSynthesis: 'Speed is sustainable only with clear emotional boundaries.',
      observationCount: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it('compiles a structured morning digest from recent entries and ready themes', () => {
    const digest = compileMorningDigest('user-notif', sampleEntries, sampleThemes);

    expect(digest.userId).toBe('user-notif');
    expect(digest.yesterdayHighlights).toHaveLength(1);
    expect(digest.yesterdayHighlights[0].title).toBe('Balancing Speed and Care');
    expect(digest.readyThemes).toHaveLength(1);
    expect(digest.readyThemes[0].observationCount).toBe(3);
    expect(digest.dayFramingPrompt).toContain('Mindful Velocity');
  });

  it('enforces rate limits (blocks the 6th webhook dispatch in an hour)', () => {
    const rateLimitUserId = 'user-ratelimit-test';
    for (let i = 0; i < MAX_WEBHOOKS_PER_HOUR; i++) {
      expect(checkWebhookRateLimit(rateLimitUserId)).toBe(true);
    }
    // 6th attempt must be rejected
    expect(checkWebhookRateLimit(rateLimitUserId)).toBe(false);
  });

  it('blocks webhook dispatch if send-time SSRF validation fails', async () => {
    vi.spyOn(ssrfValidator, 'validateWebhookUrl').mockResolvedValueOnce({
      isValid: false,
      error: 'Blocked internal IP address.',
    });

    const digest = compileMorningDigest('user-ssrf-blocked', sampleEntries, sampleThemes);
    const result = await dispatchWebhook('https://evil-internal-rebinder.com/hook', digest);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Blocked internal IP/i);
  });

  it('handles email dispatch in development with zero external API key requirements', async () => {
    const digest = compileMorningDigest('user-email', sampleEntries, sampleThemes);
    const result = await dispatchMorningDigestEmail('reyna@example.com', digest);

    expect(result.success).toBe(true);
    expect(result.channel).toBe('email');
    expect(result.statusCode).toBe(200);
  });
});
