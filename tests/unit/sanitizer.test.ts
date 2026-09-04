import { describe, it, expect } from 'vitest';
import { sanitizeForOutbound } from '../../src/integrations/sanitizer';

describe('Outbound PII Sanitizer (Tier 1 TDD)', () => {
  describe('Positive PII Detection & Redaction', () => {
    // 1. Standard North American phone numbers
    it('redacts standard 10-digit dashed phone numbers', () => {
      const input = 'Call me at 415-555-2671 when you finish.';
      const output = sanitizeForOutbound(input);
      expect(output).toBe('Call me at [PHONE_REDACTED] when you finish.');
    });

    it('redacts parenthesized area code phone numbers', () => {
      const input = 'My doctor is reached at (212) 555-0199.';
      const output = sanitizeForOutbound(input);
      expect(output).toBe('My doctor is reached at [PHONE_REDACTED].');
    });

    it('redacts dotted phone numbers', () => {
      const input = 'Reach support on 800.555.0142 today.';
      const output = sanitizeForOutbound(input);
      expect(output).toBe('Reach support on [PHONE_REDACTED] today.');
    });

    it('redacts international E.164 phone numbers with country code', () => {
      const input = 'Contact our Manila branch at +63 917 555 1234 or +44 20 7946 0958.';
      const output = sanitizeForOutbound(input);
      expect(output).toContain('[PHONE_REDACTED]');
      expect(output).not.toContain('+63 917 555 1234');
      expect(output).not.toContain('+44 20 7946 0958');
    });

    // 2. Email addresses
    it('redacts standard personal email addresses', () => {
      const input = 'I sent the confidential deck to reyna.developer@gmail.com this morning.';
      const output = sanitizeForOutbound(input);
      expect(output).toBe('I sent the confidential deck to [EMAIL_REDACTED] this morning.');
    });

    it('redacts corporate and subdomain email addresses', () => {
      const input = 'Escalate issues to founder+urgent@sub.company.co.uk immediately.';
      const output = sanitizeForOutbound(input);
      expect(output).toBe('Escalate issues to [EMAIL_REDACTED] immediately.');
    });

    // 3. Physical street addresses
    it('redacts standard street addresses with numbered street', () => {
      const input = 'We signed the lease for our studio at 742 Evergreen Terrace yesterday.';
      const output = sanitizeForOutbound(input);
      expect(output).toBe('We signed the lease for our studio at [ADDRESS_REDACTED] yesterday.');
    });

    it('redacts avenue, boulevard, road, and drive addresses', () => {
      const input1 = 'I visited 1600 Pennsylvania Ave for the event.';
      const input2 = 'They moved to 450 Sunset Blvd last week.';
      const input3 = 'The warehouse is at 120 Industrial Road.';
      const input4 = 'Meet me at 88 Ocean Drive before noon.';

      expect(sanitizeForOutbound(input1)).toBe('I visited [ADDRESS_REDACTED] for the event.');
      expect(sanitizeForOutbound(input2)).toBe('They moved to [ADDRESS_REDACTED] last week.');
      expect(sanitizeForOutbound(input3)).toBe('The warehouse is at [ADDRESS_REDACTED].');
      expect(sanitizeForOutbound(input4)).toBe('Meet me at [ADDRESS_REDACTED] before noon.');
    });

    it('redacts multiple mixed PII instances in a single reflection narrative', () => {
      const input = 'Met with Sarah (sarah.k@acme.org, 555-839-2011) at 123 Market Street to discuss the contract.';
      const output = sanitizeForOutbound(input);
      expect(output).toBe('Met with Sarah ([EMAIL_REDACTED], [PHONE_REDACTED]) at [ADDRESS_REDACTED] to discuss the contract.');
    });
  });

  describe('Non-PII False Positive Resistance', () => {
    it('preserves distances, metrics, and quantitative numbers', () => {
      const input = 'I ran 500 meters and completed 12 laps in 45 minutes.';
      expect(sanitizeForOutbound(input)).toBe(input);
    });

    it('preserves chapter, section, and page references', () => {
      const input = 'Read chapter 12, page 34 of the architecture handbook.';
      expect(sanitizeForOutbound(input)).toBe(input);
    });

    it('preserves ISO dates, timestamps, and currency amounts', () => {
      const input = 'On 2026-09-04 at 14:30, we closed the $50,000 round.';
      expect(sanitizeForOutbound(input)).toBe(input);
    });

    it('preserves software version numbers and tech specs', () => {
      const input = 'Upgraded to Node v22.14.0 with TypeScript 5.8 and React 19.0.4.';
      expect(sanitizeForOutbound(input)).toBe(input);
    });

    it('preserves general emotional reflections containing numbers', () => {
      const input = 'I spent 3 hours reflecting on 2 big decisions that affected 5 teammates.';
      expect(sanitizeForOutbound(input)).toBe(input);
    });

    it('preserves normal words with at-symbols or hyphens in code discussions', () => {
      const input = 'The package @google/genai is great for low-latency calls.';
      expect(sanitizeForOutbound(input)).toBe(input);
    });
  });

  describe('Idempotency & Edge Cases', () => {
    it('is completely idempotent (re-sanitizing already sanitized text produces identical output)', () => {
      const input = 'Email me at test@example.com or call 415-555-1234 at 100 Main St.';
      const firstPass = sanitizeForOutbound(input);
      const secondPass = sanitizeForOutbound(firstPass);
      expect(secondPass).toBe(firstPass);
    });

    it('safely handles empty string, whitespace, and nullish inputs', () => {
      expect(sanitizeForOutbound('')).toBe('');
      expect(sanitizeForOutbound('   ')).toBe('   ');
      expect(sanitizeForOutbound(null as any)).toBe('');
      expect(sanitizeForOutbound(undefined as any)).toBe('');
    });
  });
});
