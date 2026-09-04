import { validateWebhookUrl } from './ssrfValidator';
import { DispatchResult, MorningDigestPayload } from './types';
import { sanitizeForOutbound } from '../sanitizer';

// In-memory rate limiting: userId -> array of timestamps in ms
const userDispatchHistory = new Map<string, number[]>();

export const MAX_WEBHOOKS_PER_HOUR = 5;

/**
 * Checks and updates rate limits (max 5 dispatches per user per hour).
 */
export function checkWebhookRateLimit(userId: string): boolean {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const history = (userDispatchHistory.get(userId) || []).filter((ts) => ts > oneHourAgo);

  if (history.length >= MAX_WEBHOOKS_PER_HOUR) {
    return false;
  }

  history.push(now);
  userDispatchHistory.set(userId, history);
  return true;
}

/**
 * Dispatches an outbound webhook payload to a user-configured endpoint (e.g. Zapier / Make).
 * Enforces:
 * - Dual-pass send-time SSRF validation.
 * - Outbound PII sanitization.
 * - 3-second hard timeout.
 * - No redirects followed (redirect: 'error').
 * - Rate limiting (max 5/hr per user).
 * - Fire-and-forget: never throws unhandled errors or blocks caller.
 */
export async function dispatchWebhook(
  webhookUrl: string,
  payload: MorningDigestPayload
): Promise<DispatchResult> {
  const nowIso = new Date().toISOString();

  // 1. Rate Limiting Check
  if (!checkWebhookRateLimit(payload.userId)) {
    console.warn(`Webhook rate limit exceeded for user ${payload.userId} (max ${MAX_WEBHOOKS_PER_HOUR}/hour).`);
    return {
      success: false,
      channel: 'webhook',
      statusCode: 429,
      error: 'Rate limit exceeded: maximum 5 webhooks per hour.',
      dispatchedAt: nowIso,
    };
  }

  // 2. Send-Time SSRF Validation (DNS Rebinding Defense)
  const validation = await validateWebhookUrl(webhookUrl);
  if (!validation.isValid) {
    console.warn(`Webhook rejected at send-time: ${validation.error}`);
    return {
      success: false,
      channel: 'webhook',
      error: validation.error || 'Blocked by SSRF validation.',
      dispatchedAt: nowIso,
    };
  }

  // 3. Outbound PII Sanitization pass on payload
  const sanitizedPayload: MorningDigestPayload = {
    ...payload,
    yesterdayHighlights: payload.yesterdayHighlights.map((h) => ({
      ...h,
      title: sanitizeForOutbound(h.title),
      summary: sanitizeForOutbound(h.summary),
    })),
    readyThemes: payload.readyThemes.map((t) => ({
      ...t,
      title: sanitizeForOutbound(t.title),
      currentSynthesis: sanitizeForOutbound(t.currentSynthesis),
    })),
    dayFramingPrompt: sanitizeForOutbound(payload.dayFramingPrompt),
  };

  // 4. Dispatch with 3-second timeout and 1 retry
  let lastError: any = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Locus-ReflectAI-Notifier/1.0',
        },
        body: JSON.stringify(sanitizedPayload),
        redirect: 'error',
        signal: AbortSignal.timeout(3000), // 3-second hard timeout
      });

      if (response.ok) {
        return {
          success: true,
          channel: 'webhook',
          statusCode: response.status,
          dispatchedAt: new Date().toISOString(),
        };
      }

      lastError = new Error(`Webhook endpoint returned HTTP ${response.status}`);
    } catch (err: any) {
      lastError = err;
      if (attempt === 1) {
        // Exponential backoff pause before single retry
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  console.warn(`Webhook dispatch failed after 2 attempts: ${lastError?.message || 'Unknown error'}`);
  return {
    success: false,
    channel: 'webhook',
    error: lastError?.message || 'Webhook failed',
    dispatchedAt: new Date().toISOString(),
  };
}
