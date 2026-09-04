import { Entry, Theme } from '../../types';
import { MorningDigestPayload } from './types';
import { sanitizeForOutbound } from '../sanitizer';

/**
 * Compiles a calm morning reflective briefing payload.
 */
export function compileMorningDigest(
  userId: string,
  recentEntries: Entry[],
  themes: Theme[]
): MorningDigestPayload {
  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Recent highlights: concluded entries from the last 48 hours
  const now = Date.now();
  const twoDaysAgo = now - 48 * 60 * 60 * 1000;

  const yesterdayHighlights = recentEntries
    .filter((e) => {
      const ts = new Date(e.concludedAt || e.createdAt).getTime();
      return ts > twoDaysAgo && Boolean(e.summary);
    })
    .slice(0, 3)
    .map((e) => ({
      entryId: e.id,
      title: sanitizeForOutbound(e.title),
      summary: sanitizeForOutbound(e.summary || ''),
    }));

  // Themes ready to unpack (observationCount >= 2)
  const readyThemes = themes
    .filter((t) => (t.observationCount || 0) >= 2)
    .slice(0, 3)
    .map((t) => ({
      themeId: t.id,
      title: sanitizeForOutbound(t.title),
      observationCount: t.observationCount,
      currentSynthesis: sanitizeForOutbound(t.currentSynthesis),
    }));

  // Day framing prompt: inspiring intentional starter
  let dayFramingPrompt = 'What is the single most important dilemma or creative tension you want to explore with clarity today?';
  if (readyThemes.length > 0) {
    dayFramingPrompt = `Today, how might your realization about "${readyThemes[0].title}" inform the way you approach your primary commitments?`;
  }

  return {
    userId,
    digestDate: todayStr,
    yesterdayHighlights,
    readyThemes,
    dayFramingPrompt: sanitizeForOutbound(dayFramingPrompt),
  };
}
