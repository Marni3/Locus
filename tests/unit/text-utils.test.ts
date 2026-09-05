import { describe, it, expect } from 'vitest';
import { extractCleanTitle, cleanProseSnippet } from '../../src/lib/textUtils';

describe('extractCleanTitle (Anti-AI Title Normalization)', () => {
  it('handles empty or non-string inputs with default title', () => {
    expect(extractCleanTitle('')).toBe('Untitled Reflection');
    expect(extractCleanTitle('   ')).toBe('Untitled Reflection');
    expect(extractCleanTitle(null as any)).toBe('Untitled Reflection');
  });

  it('preserves short reflection prompts as-is without ellipsis', () => {
    const prompt = 'Feeling overwhelmed by project priorities';
    expect(extractCleanTitle(prompt)).toBe('Feeling overwhelmed by project priorities');
  });

  it('splits on punctuation for multi-sentence prompts', () => {
    const prompt = 'I feel a wave of overwhelm today. How can I ground myself?';
    expect(extractCleanTitle(prompt)).toBe('I feel a wave of overwhelm today');
  });

  it('breaks on whole-word boundary instead of severing syllables in half', () => {
    const prompt = 'Help me unpack why I am feeling hesitant about this goal and why I am postponing it';
    const title = extractCleanTitle(prompt, 46);
    // Should NOT end in "hesita..." or cut a word
    expect(title).not.toMatch(/[a-z]{3}\.\.\.$/);
    expect(title.endsWith('…')).toBe(true);
    expect(title).toBe('Help me unpack why I am feeling hesitant…');
  });

  it('handles long continuous inputs cleanly', () => {
    const prompt = 'SupercalifragilisticexpialidociousUnusuallyLongWordWithNoSpaces';
    const title = extractCleanTitle(prompt, 30);
    expect(title.endsWith('…')).toBe(true);
  });
});

describe('cleanProseSnippet (Markdown Sanitization)', () => {
  it('strips markdown headers like ## Executive Synthesis from prose snippets', () => {
    const raw = `## Executive Synthesis
The user is experiencing a significant wave of overwhelm and is seeking gentle methods for unpacking and grounding these intense feelings.`;
    const cleaned = cleanProseSnippet(raw);
    expect(cleaned).not.toContain('##');
    expect(cleaned).not.toContain('Executive Synthesis');
    expect(cleaned.startsWith('The user is experiencing a significant wave')).toBe(true);
  });

  it('strips bold and italic markdown tags', () => {
    const raw = 'The **core dilemma** is choosing between *autonomy* and __security__.';
    const cleaned = cleanProseSnippet(raw);
    expect(cleaned).toBe('The core dilemma is choosing between autonomy and security.');
  });

  it('strips leading labels like "Synthesis:" or "Summary:"', () => {
    const raw = 'Synthesis: Shifting from reactive urgency toward deliberate prioritization.';
    const cleaned = cleanProseSnippet(raw);
    expect(cleaned).toBe('Shifting from reactive urgency toward deliberate prioritization.');
  });

  it('strips wrapping quotation marks and extra line breaks', () => {
    const raw = `
"A profound observation on balancing creative ambition with emotional rest.

The pattern continues to mature."
`;
    const cleaned = cleanProseSnippet(raw);
    expect(cleaned).toBe('A profound observation on balancing creative ambition with emotional rest. The pattern continues to mature.');
  });

  it('handles null, undefined, or empty strings gracefully', () => {
    expect(cleanProseSnippet('')).toBe('');
    expect(cleanProseSnippet(null as any)).toBe('');
  });
});
