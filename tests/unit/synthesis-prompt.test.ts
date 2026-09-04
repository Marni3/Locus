import { describe, it, expect } from 'vitest';
import { 
  buildSynthesisPrompt, 
  parseSynthesisResolutionResponse 
} from '../../src/services/synthesis';
import { Entry, Message, Theme } from '../../src/types';

describe('Synthesis Prompt & Schema Parser (Tier 1 Unit TDD)', () => {
  it('formats prompt enclosing user content within security delimiters', () => {
    const summary = 'Felt exhausted trying to manage team expectations.';
    const locationContext = { name: 'Home Studio', source: 'manual' as const };
    const pinnedMessages: Message[] = [
      {
        id: 'msg-1',
        entryId: 'entry-1',
        userId: 'user-1',
        role: 'user',
        content: 'I must set clearer boundaries.',
        timestamp: '2026-09-04T10:00:00.000Z',
        isPinned: true,
        note: 'Core decision point',
      }
    ];
    const candidateThemes: Theme[] = [
      {
        id: 'theme-101',
        userId: 'user-1',
        title: 'Workplace Boundaries',
        currentSynthesis: 'Struggles with saying no to incoming requests.',
        observationCount: 2,
        createdAt: '2026-08-20T10:00:00.000Z',
        updatedAt: '2026-08-28T10:00:00.000Z',
      }
    ];

    const prompt = buildSynthesisPrompt({
      summary,
      locationContext,
      pinnedMessages,
      candidateThemes,
    });

    // Delimiter & prompt injection defense
    expect(prompt).toContain('<<<ENTRY_SUMMARY>>>');
    expect(prompt).toContain(summary);
    expect(prompt).toContain('<<<PINNED_MESSAGES>>>');
    expect(prompt).toContain('I must set clearer boundaries.');
    expect(prompt).toContain('Note: Core decision point');
    expect(prompt).toContain('Location: Home Studio');
    expect(prompt).toContain('Theme ID: theme-101');
  });

  it('parses clean JSON response into structured resolution object', () => {
    const rawJson = JSON.stringify({
      matchedThemes: [
        {
          themeId: 'theme-101',
          observationText: 'Decided on setting clear boundaries with the team.'
        }
      ],
      newThemes: []
    });

    const parsed = parseSynthesisResolutionResponse(rawJson);
    expect(parsed.matchedThemes).toHaveLength(1);
    expect(parsed.matchedThemes[0].themeId).toBe('theme-101');
    expect(parsed.newThemes).toHaveLength(0);
  });

  it('safely strips markdown code block fences (```json ... ```)', () => {
    const markdownWrapped = "```json\n" + JSON.stringify({
      matchedThemes: [],
      newThemes: [
        {
          title: 'Creative Crossroads',
          currentSynthesis: 'Pivoting between design and engineering.',
          initialObservationText: 'Noticing friction between prototyping speed and architectural purity.'
        }
      ]
    }) + "\n```";

    const parsed = parseSynthesisResolutionResponse(markdownWrapped);
    expect(parsed.newThemes).toHaveLength(1);
    expect(parsed.newThemes[0].title).toBe('Creative Crossroads');
  });

  it('throws a structured error when response is completely unparseable', () => {
    const invalidText = "I am an AI assistant and I cannot format this as JSON.";
    expect(() => parseSynthesisResolutionResponse(invalidText)).toThrow(/Failed to parse synthesis resolution/i);
  });
});
