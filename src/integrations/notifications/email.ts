import { DispatchResult, MorningDigestPayload, SynthesisEmailPayload } from './types';
import { sanitizeForOutbound } from '../sanitizer';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Dispatches a morning reflective digest email to the user.
 * Escapes HTML entities and degrades gracefully if no external email API key is configured.
 */
export async function dispatchMorningDigestEmail(
  recipientEmail: string,
  payload: MorningDigestPayload
): Promise<DispatchResult> {
  const nowIso = new Date().toISOString();
  const apiKey = process.env.RESEND_API_KEY;

  const sanitizedPrompt = sanitizeForOutbound(payload.dayFramingPrompt);

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #232323; background-color: #FAF9F6; border-radius: 10px; border: 1px solid #E6E3DC;">
      <h1 style="font-family: 'Source Serif 4', Georgia, serif; font-size: 18px; color: #232323; margin-bottom: 8px;">Your Morning Reflection Digest</h1>
      <p style="font-size: 13px; color: #6B6B6B; margin-top: 0;">${escapeHtml(payload.digestDate)}</p>
      
      <div style="background-color: #FFFFFF; border: 1px solid #E6E3DC; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #3B7A57; margin-top: 0;">Today's Focus Inquiry</h2>
        <p style="font-family: 'Source Serif 4', Georgia, serif; font-size: 16px; line-height: 1.5; color: #232323; margin-bottom: 0;">
          "${escapeHtml(sanitizedPrompt)}"
        </p>
      </div>

      ${payload.yesterdayHighlights.length > 0 ? `
        <h3 style="font-size: 15px; color: #232323; margin-top: 24px;">Recent Reflection Highlights</h3>
        ${payload.yesterdayHighlights.map((h) => `
          <div style="margin-bottom: 12px; padding-left: 12px; border-left: 2px solid #3B7A57;">
            <strong style="font-size: 15px;">${escapeHtml(h.title)}</strong>
            <p style="font-size: 13px; color: #6B6B6B; margin: 4px 0 0 0;">${escapeHtml(h.summary)}</p>
          </div>
        `).join('')}
      ` : ''}

      ${payload.readyThemes.length > 0 ? `
        <h3 style="font-size: 15px; color: #232323; margin-top: 24px;">Themes Ready to Unpack</h3>
        ${payload.readyThemes.map((t) => `
          <div style="background: #FFFFFF; border: 1px solid #E6E3DC; border-radius: 6px; padding: 12px; margin-bottom: 8px;">
            <span style="font-size: 13px; font-weight: 600; color: #3B7A57;">${t.observationCount} Observations</span>
            <h4 style="margin: 4px 0; font-size: 15px;">${escapeHtml(t.title)}</h4>
            <p style="font-size: 13px; color: #6B6B6B; margin: 0;">${escapeHtml(t.currentSynthesis)}</p>
          </div>
        `).join('')}
      ` : ''}

      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E6E3DC; text-align: center;">
        <p style="font-size: 13px; color: #6B6B6B;">Sent from your private Locus reflection space.</p>
      </div>
    </div>
  `;

  if (!apiKey) {
    // Development fallback: Log mock email dispatch without crashing
    console.log(`[Email Mock Dispatch] To: ${recipientEmail} | Subject: Morning Reflection Digest (${payload.digestDate})`);
    return {
      success: true,
      channel: 'email',
      statusCode: 200,
      dispatchedAt: nowIso,
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Locus <onboarding@resend.dev>',
        to: [recipientEmail],
        subject: `Morning Reflection Digest • ${payload.digestDate}`,
        html: htmlBody,
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      return {
        success: true,
        channel: 'email',
        statusCode: response.status,
        dispatchedAt: nowIso,
      };
    }

    const errText = await response.text().catch(() => '');
    return {
      success: false,
      channel: 'email',
      statusCode: response.status,
      error: `Resend API returned ${response.status}: ${errText}`,
      dispatchedAt: nowIso,
    };
  } catch (err: any) {
    return {
      success: false,
      channel: 'email',
      error: err.message || 'Email dispatch failed',
      dispatchedAt: nowIso,
    };
  }
}

/**
 * Dispatches an email notification when a reflection session has been concluded and synthesized into Themes.
 * Uses Resend API with calm HTML typography and outbound PII scrubbing.
 */
export async function dispatchSynthesisNotificationEmail(
  recipientEmail: string,
  payload: SynthesisEmailPayload
): Promise<DispatchResult> {
  const nowIso = new Date().toISOString();
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Locus <onboarding@resend.dev>';

  const sanitizedTitle = sanitizeForOutbound(payload.entryTitle);
  const sanitizedSummary = sanitizeForOutbound(payload.entrySummary);
  const dateStr = payload.concludedAt ? new Date(payload.concludedAt).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : 'Recently';

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; color: #232323; background-color: #FAF9F6; border-radius: 10px; border: 1px solid #E6E3DC;">
      <div style="margin-bottom: 20px;">
        <span style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #3B7A57; background: #DCEEE3; padding: 4px 8px; border-radius: 6px;">
          Locus • Reflection Synthesized
        </span>
      </div>

      <h1 style="font-family: 'Source Serif 4', Georgia, serif; font-size: 18px; font-weight: 700; color: #232323; margin: 0 0 6px 0; line-height: 1.3;">
        ${escapeHtml(sanitizedTitle)}
      </h1>
      <p style="font-size: 13px; color: #6B6B6B; margin: 0 0 20px 0;">
        ${escapeHtml(dateStr)}${payload.locationSnapshot ? ` &bull; 📍 ${escapeHtml(payload.locationSnapshot)}` : ''}
      </p>

      <div style="background-color: #FFFFFF; border: 1px solid #E6E3DC; border-radius: 10px; padding: 18px; margin: 16px 0;">
        <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #3B7A57; margin: 0 0 8px 0; font-weight: 600;">
          Executive Synthesis
        </h2>
        <p style="font-family: 'Source Serif 4', Georgia, serif; font-size: 15px; line-height: 1.6; color: #232323; margin: 0; font-style: italic;">
          "${escapeHtml(sanitizedSummary)}"
        </p>
      </div>

      ${payload.newThemes.length > 0 ? `
        <div style="margin-top: 20px;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #6B6B6B; margin-bottom: 8px;">
            ✨ New Theme Formed
          </h3>
          ${payload.newThemes.map((t) => `
            <div style="background: #FFFFFF; border: 1px solid #E6E3DC; border-radius: 6px; padding: 12px; margin-bottom: 8px;">
              <h4 style="margin: 0 0 4px 0; font-size: 15px; color: #232323;">${escapeHtml(t.title)}</h4>
              <p style="font-size: 13px; color: #6B6B6B; margin: 0; line-height: 1.4;">${escapeHtml(t.currentSynthesis)}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${payload.matchedThemes.length > 0 ? `
        <div style="margin-top: 20px;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #6B6B6B; margin-bottom: 8px;">
            🌱 Connected Themes Deepened
          </h3>
          ${payload.matchedThemes.map((t) => `
            <div style="background: #FFFFFF; border: 1px solid #E6E3DC; border-radius: 6px; padding: 12px; margin-bottom: 8px; border-left: 1px solid #3B7A57;">
              <h4 style="margin: 0 0 4px 0; font-size: 15px; color: #232323;">${escapeHtml(t.title)}</h4>
              <p style="font-size: 13px; color: #6B6B6B; margin: 0; line-height: 1.4;">${escapeHtml(t.currentSynthesis)}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #E6E3DC; text-align: center;">
        <p style="font-size: 13px; color: #6B6B6B; margin: 0;">
          Sent from your private Locus reflection space. Longitudinal thought trajectory updated.
        </p>
      </div>
    </div>
  `;

  if (!apiKey) {
    console.log(
      `[Email Mock Dispatch] To: ${recipientEmail} | Subject: Reflection Synthesized: ${sanitizedTitle}`
    );
    return {
      success: true,
      channel: 'email',
      statusCode: 200,
      dispatchedAt: nowIso,
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipientEmail],
        subject: `Reflection Synthesized • ${sanitizedTitle}`,
        html: htmlBody,
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      return {
        success: true,
        channel: 'email',
        statusCode: response.status,
        dispatchedAt: nowIso,
      };
    }

    const errText = await response.text().catch(() => '');
    return {
      success: false,
      channel: 'email',
      statusCode: response.status,
      error: `Resend API returned ${response.status}: ${errText}`,
      dispatchedAt: nowIso,
    };
  } catch (err: any) {
    return {
      success: false,
      channel: 'email',
      error: err.message || 'Email dispatch failed',
      dispatchedAt: nowIso,
    };
  }
}
