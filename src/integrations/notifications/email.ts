import { DispatchResult, MorningDigestPayload } from './types';
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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #232323; background-color: #FAF9F6; border-radius: 12px;">
      <h1 style="font-family: Georgia, serif; font-size: 24px; color: #1C3829; margin-bottom: 8px;">Your Morning Reflection Digest</h1>
      <p style="font-size: 13px; color: #6B6B6B; margin-top: 0;">${escapeHtml(payload.digestDate)}</p>
      
      <div style="background-color: #FFFFFF; border: 1px solid #E6E3DC; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #3B7A57; margin-top: 0;">Today's Focus Inquiry</h2>
        <p style="font-family: Georgia, serif; font-size: 16px; line-height: 1.5; color: #232323; margin-bottom: 0;">
          "${escapeHtml(sanitizedPrompt)}"
        </p>
      </div>

      ${payload.yesterdayHighlights.length > 0 ? `
        <h3 style="font-size: 14px; color: #4A4A4A; margin-top: 24px;">Recent Reflection Highlights</h3>
        ${payload.yesterdayHighlights.map((h) => `
          <div style="margin-bottom: 12px; padding-left: 12px; border-left: 2px solid #3B7A57;">
            <strong style="font-size: 14px;">${escapeHtml(h.title)}</strong>
            <p style="font-size: 13px; color: #555; margin: 4px 0 0 0;">${escapeHtml(h.summary)}</p>
          </div>
        `).join('')}
      ` : ''}

      ${payload.readyThemes.length > 0 ? `
        <h3 style="font-size: 14px; color: #4A4A4A; margin-top: 24px;">Themes Ready to Unpack</h3>
        ${payload.readyThemes.map((t) => `
          <div style="background: #FFFFFF; border: 1px solid #E6E3DC; border-radius: 6px; padding: 12px; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 600; color: #3B7A57;">${t.observationCount} Observations</span>
            <h4 style="margin: 4px 0; font-size: 14px;">${escapeHtml(t.title)}</h4>
            <p style="font-size: 12px; color: #666; margin: 0;">${escapeHtml(t.currentSynthesis)}</p>
          </div>
        `).join('')}
      ` : ''}

      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E6E3DC; text-align: center;">
        <p style="font-size: 11px; color: #888;">Sent from your private Locus reflection space.</p>
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
        from: 'Locus <reflections@locusjournal.com>',
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
