/**
 * Lazy Reconciliation Engine for Locus / ReflectAI
 * Automatically reconciles active reflection sessions past the 2-hour inactivity threshold
 * on application mount, tab focus, or in-session timer expiration.
 *
 * Adheres to Locus Software Standards (Threat Zone 4: State Integrity & Zero-Crash Hygiene).
 */

import { Entry } from '../types';
import { isEntryEligibleForAutoConclude } from './concludeEngine';

export interface LazyReconcileResult {
  eligibleCount: number;
  reconciledCount: number;
  failedCount: number;
  reconciledEntries: Entry[];
  errors: Array<{ entryId: string; error: string }>;
}

/**
 * Identifies active entries that have exceeded the 2-hour inactivity window.
 */
export function findExpiredActiveEntries(
  entries: Entry[],
  nowMs: number = Date.now()
): Entry[] {
  return entries.filter((entry) => isEntryEligibleForAutoConclude(entry, nowMs));
}

/**
 * Concurrently or sequentially reconciles expired active entries using the provided conclude callback.
 * Implements strict error isolation so one failing entry synthesis never blocks the reconciliation
 * of other entries.
 */
export async function reconcileExpiredEntries(
  entries: Entry[],
  concludeFn: (entry: Entry) => Promise<unknown>,
  nowMs: number = Date.now()
): Promise<LazyReconcileResult> {
  const expired = findExpiredActiveEntries(entries, nowMs);
  const result: LazyReconcileResult = {
    eligibleCount: expired.length,
    reconciledCount: 0,
    failedCount: 0,
    reconciledEntries: [],
    errors: [],
  };

  if (expired.length === 0) {
    return result;
  }

  for (const entry of expired) {
    try {
      await concludeFn(entry);
      result.reconciledCount++;
      result.reconciledEntries.push(entry);
    } catch (err: any) {
      result.failedCount++;
      result.errors.push({
        entryId: entry.id,
        error: err?.message || 'Unknown error during lazy reconciliation',
      });
    }
  }

  return result;
}
