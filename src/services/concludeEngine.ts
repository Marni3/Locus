/**
 * Locus / ReflectAI Auto-Conclude Engine
 * Evaluates reflection entry inactivity against the non-negotiable 2-hour lifecycle boundary.
 */

export const TWO_HOURS_MS = 2 * 60 * 60 * 1000; // 7,200,000 ms

export interface InactivityTarget {
  status: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Determines whether an entry has exceeded the 2-hour inactivity threshold and should conclude.
 */
export function isEntryEligibleForAutoConclude(
  entry: InactivityTarget,
  currentTimeMs: number = Date.now()
): boolean {
  if (entry.status !== 'active') {
    return false;
  }

  const lastActivityIso = entry.updatedAt || entry.createdAt;
  const lastActivityTime = new Date(lastActivityIso).getTime();

  if (isNaN(lastActivityTime)) {
    return false;
  }

  const elapsed = currentTimeMs - lastActivityTime;
  return elapsed > TWO_HOURS_MS;
}

/**
 * Calculates remaining active duration in milliseconds before auto-conclusion occurs.
 */
export function getRemainingActiveMs(
  entry: InactivityTarget,
  currentTimeMs: number = Date.now()
): number {
  if (entry.status !== 'active') {
    return 0;
  }

  const lastActivityIso = entry.updatedAt || entry.createdAt;
  const lastActivityTime = new Date(lastActivityIso).getTime();

  if (isNaN(lastActivityTime)) {
    return TWO_HOURS_MS;
  }

  const elapsed = currentTimeMs - lastActivityTime;
  const remaining = TWO_HOURS_MS - elapsed;
  return Math.max(0, remaining);
}

/**
 * Formats remaining active duration into calm, non-gamified human copy.
 */
export function formatRemainingTime(remainingMs: number): string {
  if (remainingMs <= 0) {
    return 'Concluded';
  }

  const totalMinutes = Math.floor(remainingMs / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
}
