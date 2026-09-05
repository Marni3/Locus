import { Entry, Stratum, ReturnCandidate, ReturnReason } from '../types';
import { formatTemporalDistance, calculateDaysLater } from './strataService';

/**
 * Evaluates the user's archive of concluded entries and chooses exactly ONE past entry
 * that deserves reading today, backed by an explainable reason.
 */
export function selectReturnCandidate(
  entries: Entry[],
  allStrata: Stratum[] = []
): ReturnCandidate | null {
  const concludedEntries = entries.filter((e) => e.status === 'concluded' && (e.concludedAt || e.createdAt));
  if (concludedEntries.length === 0) {
    return null;
  }

  const now = new Date();

  // 1. Anniversary Check: Look for entries roughly 1 year ago (365d ± 4d) or 6 months ago (180d ± 3d)
  for (const entry of concludedEntries) {
    const concludedMs = new Date(entry.concludedAt || entry.createdAt).getTime();
    const diffDays = Math.floor((now.getTime() - concludedMs) / (1000 * 60 * 60 * 24));

    if (diffDays >= 360 && diffDays <= 370) {
      const entryStrata = allStrata.filter((s) => s.entryId === entry.id);
      return {
        entry,
        strata: entryStrata,
        reason: 'anniversary',
        evidence: `written 1 year ago today · ${entryStrata.length} ${entryStrata.length === 1 ? 'stratum' : 'strata'}`,
      };
    }
  }

  // 2. Unresolved Threads Check: Entry has marked open threads
  const unresolvedEntry = concludedEntries.find(
    (e) => Array.isArray(e.openThreads) && e.openThreads.length > 0
  );
  if (unresolvedEntry) {
    const entryStrata = allStrata.filter((s) => s.entryId === unresolvedEntry.id);
    const elapsedDays = calculateDaysLater(unresolvedEntry.concludedAt || unresolvedEntry.createdAt);
    return {
      entry: unresolvedEntry,
      strata: entryStrata,
      reason: 'unresolved',
      evidence: `unresolved thread from ${formatTemporalDistance(elapsedDays)} · "${unresolvedEntry.openThreads![0]}"`,
    };
  }

  // 3. Contradiction Check: Find two entries in the same category with contrasting moods (e.g. Overwhelmed vs Energized, Anxious vs Calm)
  const contrastingPairs: [string, string][] = [
    ['Overwhelmed', 'Energized'],
    ['Anxious', 'Calm'],
    ['Stuck', 'Breakthrough'],
    ['Frustrated', 'Grateful'],
  ];

  for (const [moodA, moodB] of contrastingPairs) {
    const foundA = concludedEntries.find((e) => e.mood?.toLowerCase() === moodA.toLowerCase());
    const foundB = concludedEntries.find(
      (e) => e.mood?.toLowerCase() === moodB.toLowerCase() && e.category === foundA?.category && e.id !== foundA?.id
    );

    if (foundA && foundB) {
      const entryStrata = allStrata.filter((s) => s.entryId === foundA.id);
      const daysLater = calculateDaysLater(foundA.concludedAt || foundA.createdAt);
      return {
        entry: foundA,
        strata: entryStrata,
        reason: 'contradiction',
        evidence: `written ${formatTemporalDistance(daysLater)} · contrasting perspective found in "${foundB.title}"`,
        contradictingEntry: {
          id: foundB.id,
          title: foundB.title,
          date: new Date(foundB.concludedAt || foundB.createdAt).toLocaleDateString(),
          excerpt: foundB.summary || foundB.turns?.[0]?.content?.slice(0, 140) || '',
        },
      };
    }
  }

  // 4. Dormant Entry Check: Entry not revisited in the longest duration
  const sortedByDormancy = [...concludedEntries].sort((a, b) => {
    const dateA = new Date(a.lastReturnedAt || a.concludedAt || a.createdAt).getTime();
    const dateB = new Date(b.lastReturnedAt || b.concludedAt || b.createdAt).getTime();
    return dateA - dateB;
  });

  const dormantEntry = sortedByDormancy[0];
  const entryStrata = allStrata.filter((s) => s.entryId === dormantEntry.id);
  const elapsedDays = calculateDaysLater(dormantEntry.concludedAt || dormantEntry.createdAt);

  return {
    entry: dormantEntry,
    strata: entryStrata,
    reason: 'dormant',
    evidence: `unvisited for ${formatTemporalDistance(elapsedDays)} · ${entryStrata.length} strata`,
  };
}
