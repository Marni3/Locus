import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildSynthesisPrompt, generateEntrySummary } from '../../src/services/synthesis';
import { Entry } from '../../src/types';
import * as geminiService from '../../src/services/gemini';

describe('PII Egress Gate Tests (Tier 2 TDD)', () => {
  let capturedOutboundPrompt: string = '';

  beforeEach(() => {
    capturedOutboundPrompt = '';
    vi.spyOn(geminiService, 'generateContentWithFallback').mockImplementation(async (options) => {
      capturedOutboundPrompt = typeof options.contents === 'string' 
        ? options.contents 
        : JSON.stringify(options.contents);
      return {
        text: 'Clean distilled summary.',
        modelUsed: 'gemini-3.6-flash',
      };
    });
  });

  it('scrubs PII from transcripts before sending to Gemini in generateEntrySummary', async () => {
    const sensitiveEntry: Entry = {
      id: 'entry-pii-test',
      userId: 'user-123',
      title: 'Confidential Strategy Call',
      createdAt: '2026-09-04T12:00:00.000Z',
      status: 'active',
      turns: [
        {
          id: 'turn-1',
          entryId: 'entry-pii-test',
          role: 'user',
          content: 'I discussed hiring terms with legal at 415-555-8921 and emailed reyna@confidential.org.',
          timestamp: '2026-09-04T12:01:00.000Z',
        },
        {
          id: 'turn-2',
          entryId: 'entry-pii-test',
          role: 'model',
          content: 'What was the primary hesitation raised during that discussion?',
          timestamp: '2026-09-04T12:02:00.000Z',
        },
      ],
    };

    const summary = await generateEntrySummary(sensitiveEntry);
    expect(summary).toBe('Clean distilled summary.');

    // Assert that outbound prompt scrubbed phone and email
    expect(capturedOutboundPrompt).toContain('[PHONE_REDACTED]');
    expect(capturedOutboundPrompt).toContain('[EMAIL_REDACTED]');
    expect(capturedOutboundPrompt).not.toContain('415-555-8921');
    expect(capturedOutboundPrompt).not.toContain('reyna@confidential.org');

    // Assert that original entry object was NOT mutated (outbound only)
    expect(sensitiveEntry.turns![0].content).toContain('415-555-8921');
    expect(sensitiveEntry.turns![0].content).toContain('reyna@confidential.org');
  });

  it('scrubs PII from summary and pinned messages in buildSynthesisPrompt', () => {
    const prompt = buildSynthesisPrompt({
      summary: 'Met John at 742 Evergreen Terrace and agreed to call 212-555-0199.',
      pinnedMessages: [
        {
          id: 'pin-1',
          entryId: 'e1',
          role: 'user',
          content: 'Wire the initial deposit to payment@privatebank.com.',
          note: 'Confirm with CFO at 555-888-9999 first.',
          timestamp: '2026-09-04T12:00:00Z',
        },
      ],
      candidateThemes: [],
    });

    expect(prompt).toContain('[ADDRESS_REDACTED]');
    expect(prompt).toContain('[PHONE_REDACTED]');
    expect(prompt).toContain('[EMAIL_REDACTED]');
    expect(prompt).not.toContain('742 Evergreen Terrace');
    expect(prompt).not.toContain('212-555-0199');
    expect(prompt).not.toContain('payment@privatebank.com');
    expect(prompt).not.toContain('555-888-9999');
  });
});
