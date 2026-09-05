/**
 * Text Utility Functions for Locus
 * Provides whole-word semantic title distillation and clean prose sanitization.
 */

/**
 * Extracts a clean, dignified reflection title from a raw user prompt.
 * 
 * Rules:
 * 1. Honors natural sentence punctuation breaks ([.?!;\n]) if the first sentence is reasonably sized.
 * 2. If longer than maxLen (default 48), truncates cleanly at a whole-word boundary.
 * 3. Never severs a word in half (e.g. "hesita..." or "gen...").
 * 4. Appends a typographic ellipsis (…) only when truncated.
 */
export function extractCleanTitle(prompt: string, maxLen: number = 48): string {
  if (!prompt || typeof prompt !== 'string') {
    return 'Untitled Reflection';
  }

  const trimmed = prompt.trim();
  if (!trimmed) {
    return 'Untitled Reflection';
  }

  // Check if first sentence or line is under maxLen
  const sentenceMatch = trimmed.match(/^([^.?!;\n]+)/);
  const firstSentence = sentenceMatch ? sentenceMatch[1].trim() : trimmed;

  if (firstSentence.length > 0 && firstSentence.length <= maxLen) {
    return firstSentence;
  }

  // Truncate at word boundary
  const candidate = firstSentence.length > 0 ? firstSentence : trimmed;
  if (candidate.length <= maxLen) {
    return candidate;
  }

  const slice = candidate.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(' ');

  // If there is a space after character 18, break on that word boundary
  if (lastSpace >= 18) {
    return slice.slice(0, lastSpace).trim() + '…';
  }

  // Fallback if there's an unusually long word
  return slice.trim() + '…';
}

/**
 * Strips raw markdown syntax, heading markers, blockquotes, and raw LLM section labels
 * so that reflection summaries display as pure, dignified prose without machine leaks.
 * 
 * Specifically cleans:
 * - Markdown headings: `## Executive Synthesis`, `# Summary`, `### Insights`
 * - Leading section labels: `Executive Synthesis:`, `Synthesis:`, `Key Takeaway:`
 * - Bold/Italic formatting: `**text**`, `*text*`, `__text__`, `_text_`
 * - Blockquotes: `> `
 * - Bullet tokens: `* `, `- `, `+ `
 * - Outer surrounding quotation marks: `"text"`, `“text”`
 */
export function cleanProseSnippet(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let cleaned = text.trim();

  // Strip wrapping outer quotes
  cleaned = cleaned.replace(/^["'“]([\s\S]*)["'”]$/, '$1').trim();

  // Strip markdown headers at the start or on individual lines (e.g. "## Executive Synthesis")
  cleaned = cleaned.replace(/^#{1,6}\s+.*$/gm, '');

  // Strip common label prefixes like "Executive Synthesis:", "Synthesis:", "Summary:"
  cleaned = cleaned.replace(/^(executive synthesis|synthesis|summary|reflection summary)[:\s-]*/i, '');

  // Strip markdown bold and italic markers: **bold**, *italic*, __bold__, _italic_
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');

  // Strip blockquote markers
  cleaned = cleaned.replace(/^>\s+/gm, '');

  // Strip bullet markers at line start
  cleaned = cleaned.replace(/^[-*+]\s+/gm, '');

  // Collapse multiple newlines/whitespace into clean single-spaced prose
  cleaned = cleaned.replace(/\n\s*\n/g, ' ').replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim();

  return cleaned;
}
