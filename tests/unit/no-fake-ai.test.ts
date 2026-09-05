import { describe, it, expect, vi } from 'vitest';
import { generateEntrySummary } from '../../src/services/synthesis';
import * as geminiModule from '../../src/services/gemini';
import { Entry } from '../../src/types';

describe('Zero-Fake-AI Resilience & Honest Errors (Tier 1 TDD)', () => {
  it('throws an honest actionable error instead of returning synthetic dummy text on quota failure', async () => {
    // Mock generateContentWithFallback to reject with 429 quota exhaustion
    vi.spyOn(geminiModule, 'generateContentWithFallback').mockRejectedValueOnce(
      new Error('429 Resource has been exhausted (e.g. check quota)')
    );

    const testEntry: Entry = {
      id: 'entry-honest-err',
      userId: 'test-user',
      title: 'Testing Resilience',
      createdAt: new Date().toISOString(),
      status: 'active',
      category: 'Work',
      turns: [
        {
          id: 'turn-1',
          entryId: 'entry-honest-err',
          role: 'user',
          content: 'I need to make a decision on our roadmap.',
          timestamp: new Date().toISOString(),
        },
      ],
      stratumCount: 0,
      returnCount: 0,
    };

    await expect(generateEntrySummary(testEntry)).rejects.toThrow(
      /Summary synthesis unavailable/
    );
  });

  it('returns a literal descriptor when turns are empty without fabricating pseudo-insights', async () => {
    const emptyEntry: Entry = {
      id: 'entry-empty',
      userId: 'test-user',
      title: 'Empty Note',
      createdAt: new Date().toISOString(),
      status: 'active',
      category: 'Work',
      turns: [],
      stratumCount: 0,
      returnCount: 0,
    };

    const summary = await generateEntrySummary(emptyEntry);
    expect(summary).toBe('Empty reflection session with no conversational turns.');
    expect(summary).not.toContain('This reflection explores');
  });
});
