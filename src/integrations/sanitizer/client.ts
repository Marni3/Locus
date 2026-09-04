import { EMAIL_REGEX, PHONE_INTL_REGEX, PHONE_STANDARD_REGEX, STREET_ADDRESS_REGEX } from './regex';
import { SanitizeOptions, SanitizationResult } from './types';

/**
 * Sanitizes outbound text by redacting structured PII (emails, phone numbers, street addresses)
 * before egress across third-party network boundaries (Gemini, Embeddings, Webhooks, Emails).
 *
 * Per Locus Data Architecture:
 * - OUTBOUND ONLY. Raw reflections in Firestore remain unredacted.
 * - Idempotent: re-sanitizing already sanitized text produces identical output.
 */
export function sanitizeForOutbound(text: string, options?: SanitizeOptions): string {
  if (typeof text !== 'string') return '';
  if (!text) return '';

  const opts: Required<SanitizeOptions> = {
    maskEmails: options?.maskEmails ?? true,
    maskPhones: options?.maskPhones ?? true,
    maskAddresses: options?.maskAddresses ?? true,
  };

  let sanitized = text;

  // 1. Email Redaction
  if (opts.maskEmails) {
    sanitized = sanitized.replace(EMAIL_REGEX, '[EMAIL_REDACTED]');
  }

  // 2. Phone Redaction (International first, then standard formats)
  if (opts.maskPhones) {
    sanitized = sanitized.replace(PHONE_INTL_REGEX, '[PHONE_REDACTED]');
    sanitized = sanitized.replace(PHONE_STANDARD_REGEX, '[PHONE_REDACTED]');
  }

  // 3. Physical Street Address Redaction
  if (opts.maskAddresses) {
    sanitized = sanitized.replace(STREET_ADDRESS_REGEX, '[ADDRESS_REDACTED]');
  }

  return sanitized;
}

/**
 * Detailed sanitizer returning telemetry on redactions performed.
 */
export function sanitizeForOutboundWithDetails(text: string, options?: SanitizeOptions): SanitizationResult {
  if (typeof text !== 'string' || !text) {
    return {
      sanitizedText: '',
      hasRedactions: false,
      redactedCounts: { emails: 0, phones: 0, addresses: 0 },
    };
  }

  let emailCount = 0;
  let phoneCount = 0;
  let addressCount = 0;

  const emails = text.match(EMAIL_REGEX);
  if (emails) emailCount = emails.length;

  const intlPhones = text.match(PHONE_INTL_REGEX) || [];
  const stdPhones = text.match(PHONE_STANDARD_REGEX) || [];
  phoneCount = intlPhones.length + stdPhones.length;

  const addresses = text.match(STREET_ADDRESS_REGEX);
  if (addresses) addressCount = addresses.length;

  const sanitized = sanitizeForOutbound(text, options);
  const hasRedactions = emailCount > 0 || phoneCount > 0 || addressCount > 0;

  return {
    sanitizedText: sanitized,
    hasRedactions,
    redactedCounts: {
      emails: emailCount,
      phones: phoneCount,
      addresses: addressCount,
    },
  };
}
