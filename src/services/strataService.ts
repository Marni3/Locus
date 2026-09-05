import { Stratum, Entry, Theme, ThemeObservation, StratumStance } from '../types';
import { db, stripUndefined } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

// In-memory demo strata storage
const memoryStrata = new Map<string, Stratum[]>();

/**
 * Calculates days elapsed between an entry's conclusion date and a stratum note's date.
 */
export function calculateDaysLater(concludedAtIso: string, noteDateIso: string = new Date().toISOString()): number {
  const concludedMs = new Date(concludedAtIso).getTime();
  const noteMs = new Date(noteDateIso).getTime();
  if (isNaN(concludedMs) || isNaN(noteMs)) {
    return 0;
  }
  const diffMs = Math.max(0, noteMs - concludedMs);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formats elapsed days into calm, archival temporal distance in Courier Prime small-caps tracking.
 * Examples: "written 94 days later", "written 2 years, 1 month later"
 */
export function formatTemporalDistance(daysLater: number): string {
  if (daysLater <= 0) {
    return 'written on conclusion day';
  }
  if (daysLater === 1) {
    return 'written 1 day later';
  }
  if (daysLater < 30) {
    return `written ${daysLater} days later`;
  }
  if (daysLater < 365) {
    const months = Math.floor(daysLater / 30);
    const remainderDays = daysLater % 30;
    if (remainderDays >= 7 && remainderDays <= 23) {
      return `written ${months} months, ${remainderDays} days later`;
    }
    return `written ${months} ${months === 1 ? 'month' : 'months'} later`;
  }

  const years = Math.floor(daysLater / 365);
  const remainingMonths = Math.floor((daysLater % 365) / 30);
  if (remainingMonths > 0) {
    return `written ${years} ${years === 1 ? 'year' : 'years'}, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'} later`;
  }
  return `written ${years} ${years === 1 ? 'year' : 'years'} later`;
}

/**
 * Returns semantic ink color variables for each stratum stance
 */
export function getStanceSemanticColor(stance: StratumStance): {
  inkClass: string;
  bgClass: string;
  borderClass: string;
  label: string;
} {
  switch (stance) {
    case 'correction':
      return {
        inkClass: 'text-[#8A3A22]',
        bgClass: 'bg-[#8A3A22]/10',
        borderClass: 'border-[#8A3A22]',
        label: 'Correction',
      };
    case 'confirmation':
      return {
        inkClass: 'text-[#3B5540]',
        bgClass: 'bg-[#3B5540]/10',
        borderClass: 'border-[#3B5540]',
        label: 'Confirmation',
      };
    case 'question':
      return {
        inkClass: 'text-[#2C3A4F]',
        bgClass: 'bg-[#2C3A4F]/10',
        borderClass: 'border-[#2C3A4F]',
        label: 'Question',
      };
    case 'grief':
      return {
        inkClass: 'text-[#5A5648]',
        bgClass: 'bg-[#5A5648]/10',
        borderClass: 'border-[#5A5648]',
        label: 'Grief',
      };
    case 'gratitude':
    default:
      return {
        inkClass: 'text-[#3B7A57]',
        bgClass: 'bg-[#DCEEE3]',
        borderClass: 'border-[#3B7A57]',
        label: 'Gratitude',
      };
  }
}

/**
 * Fetches all strata associated with an entry.
 */
export async function fetchStrataForEntry(userId: string, entryId: string): Promise<Stratum[]> {
  // Check in-memory store (for demo or offline)
  let memList = memoryStrata.get(entryId);
  if (!memList || memList.length === 0) {
    if (userId === 'demo-evaluator' || !db) {
      const demoSamples = getSampleDemoStrata(entryId, userId);
      if (demoSamples.length > 0) {
        memoryStrata.set(entryId, demoSamples);
        memList = demoSamples;
      }
    }
  }
  memList = memList || [];

  if (!db || userId === 'demo-evaluator') {
    return memList;
  }

  try {
    const strataCol = collection(db, 'users', userId, 'entries', entryId, 'strata');
    const q = query(strataCol, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);

    const fromDb: Stratum[] = [];
    snapshot.forEach((docSnap) => {
      fromDb.push(docSnap.data() as Stratum);
    });

    // Merge and deduplicate
    const map = new Map<string, Stratum>();
    memList.forEach((s) => map.set(s.id, s));
    fromDb.forEach((s) => map.set(s.id, s));
    return Array.from(map.values());
  } catch (err) {
    console.warn('Firestore fetchStrataForEntry fallback to memory:', err);
    return memList;
  }
}

/**
 * Saves a new or updated Stratum margin note.
 */
export async function saveStratum(userId: string, stratum: Stratum): Promise<void> {
  // Update memory cache
  const list = memoryStrata.get(stratum.entryId) || [];
  const idx = list.findIndex((s) => s.id === stratum.id);
  if (idx !== -1) {
    list[idx] = stratum;
  } else {
    list.push(stratum);
  }
  memoryStrata.set(stratum.entryId, list);

  if (!db || userId === 'demo-evaluator') {
    return;
  }

  try {
    const docRef = doc(db, 'users', userId, 'entries', stratum.entryId, 'strata', stratum.id);
    const sanitized = stripUndefined(stratum);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    console.warn('Firestore saveStratum fallback to memory:', err);
  }
}

/**
 * Deletes a stratum margin note.
 */
export async function deleteStratum(userId: string, entryId: string, stratumId: string): Promise<void> {
  const list = memoryStrata.get(entryId) || [];
  memoryStrata.set(
    entryId,
    list.filter((s) => s.id !== stratumId)
  );

  if (!db || userId === 'demo-evaluator') {
    return;
  }

  try {
    const docRef = doc(db, 'users', userId, 'entries', entryId, 'strata', stratumId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore deleteStratum fallback to memory:', err);
  }
}

/**
 * Creates seed sample strata for demo mode showcasing temporal layers.
 */
export function getSampleDemoStrata(entryId: string, userId: string = 'demo-evaluator'): Stratum[] {
  const now = new Date();
  const subDays = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  if (entryId === 'demo-entry-1') {
    return [
      {
        id: 'stratum-demo-1-1',
        entryId: 'demo-entry-1',
        userId,
        anchor: {
          startOffset: 12,
          endOffset: 88,
          quotedText: 'rewrite configuration files and reorganizing my workspace, but I have not written a line of core logic',
        },
        bodyMarkdown: 'Notice how whenever I fear user rejection, I invent technical debt to solve. The friction was never the bundler; it was fear of being seen.',
        depth: 1,
        daysLater: 42,
        stance: 'correction',
        createdAt: subDays(15),
        sealedAt: subDays(15),
        isDemo: true,
      },
      {
        id: 'stratum-demo-1-2',
        entryId: 'demo-entry-1',
        userId,
        parentStratumId: 'stratum-demo-1-1',
        bodyMarkdown: 'Two months later: this rule held. Shipping the core loop first eliminated 80% of our anxiety.',
        depth: 2,
        daysLater: 94,
        stance: 'confirmation',
        createdAt: subDays(2),
        sealedAt: subDays(2),
        isDemo: true,
      },
    ];
  }

  if (entryId === 'demo-entry-2') {
    return [
      {
        id: 'stratum-demo-2-1',
        entryId: 'demo-entry-2',
        userId,
        anchor: {
          startOffset: 0,
          endOffset: 54,
          quotedText: 'Cut two redundant backend workers and unified the pipeline synchronously',
        },
        bodyMarkdown: 'Was this architectural purity or exhaustion? Be honest with whether simplicity was earned or rushed.',
        depth: 1,
        daysLater: 60,
        stance: 'question',
        createdAt: subDays(8),
        sealedAt: subDays(8),
        isDemo: true,
      },
    ];
  }

  return [];
}

/**
 * Seeds memoryStrata with demo strata and returns all active demo strata.
 */
export function seedDemoStrata(userId: string = 'demo-evaluator'): Stratum[] {
  const e1 = getSampleDemoStrata('demo-entry-1', userId);
  const e2 = getSampleDemoStrata('demo-entry-2', userId);
  memoryStrata.set('demo-entry-1', e1);
  memoryStrata.set('demo-entry-2', e2);
  return [...e1, ...e2];
}

// Auto-seed for demo mode
seedDemoStrata('demo-evaluator');
