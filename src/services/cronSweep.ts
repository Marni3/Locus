/**
 * Cloud Scheduler Auto-Conclude Sweep Service
 * Periodically sweeps active reflection entries past the 2-hour inactivity threshold
 * and transitions them to immutable concluded records with synthesis.
 * Adheres to Locus Software Standards (Threat Zone 3: API Protection & Zone 4: State Integrity).
 */

import { Entry } from '../types';
import { isEntryEligibleForAutoConclude } from './concludeEngine';
import { logger } from '../lib/logger';

export interface SweepOptions {
  nowMs?: number;
  maxBatch?: number;
  cronSecret?: string;
}

export interface SweepResult {
  status: 'ok' | 'partial' | 'error';
  sweptCount: number;
  eligibleCount: number;
  concludedCount: number;
  failedCount: number;
  durationMs: number;
  errors: Array<{ entryId: string; error: string }>;
}

/**
 * Validates request authenticity for Cloud Scheduler invocation.
 * Accepts X-Cron-Secret header, Bearer token, or GCP Cloud Scheduler native header.
 */
export function validateCronAuth(
  headers: Record<string, string | string[] | undefined>,
  expectedSecret?: string
): boolean {
  // If no secret is configured in environment, permit in development but enforce in production
  if (!expectedSecret) {
    return process.env.NODE_ENV !== 'production';
  }

  const customHeader = headers['x-cron-secret'];
  if (typeof customHeader === 'string' && customHeader === expectedSecret) {
    return true;
  }

  const authHeader = headers['authorization'];
  if (typeof authHeader === 'string') {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer' && parts[1] === expectedSecret) {
      return true;
    }
  }

  // Google Cloud Scheduler sets X-CloudScheduler: true
  // Note: Only trust this in conjunction with verified Cloud Run IAM or secret validation
  const cloudSchedulerHeader = headers['x-cloudscheduler'];
  if (cloudSchedulerHeader === 'true' && !expectedSecret) {
    return true;
  }

  return false;
}

/**
 * Filters and batches entries eligible for auto-conclude.
 * Caps batch size (default 5) to prevent timeout & quota starvation.
 */
export function selectEligibleEntriesForSweep(
  entries: Entry[],
  nowMs: number = Date.now(),
  maxBatch = 5
): Entry[] {
  const eligible = entries.filter((entry) => isEntryEligibleForAutoConclude(entry, nowMs));
  return eligible.slice(0, maxBatch);
}

/**
 * Executes the sweep pass across a provided candidate list or fetcher.
 */
export async function runAutoConcludeSweep(
  activeEntries: Entry[],
  concludeFn: (entry: Entry) => Promise<unknown>,
  options: SweepOptions = {}
): Promise<SweepResult> {
  const start = Date.now();
  const nowMs = options.nowMs || Date.now();
  const maxBatch = options.maxBatch || 5;

  const eligible = selectEligibleEntriesForSweep(activeEntries, nowMs, maxBatch);
  const errors: Array<{ entryId: string; error: string }> = [];
  let concludedCount = 0;

  logger.info(`Starting auto-conclude sweep: ${eligible.length} eligible entries out of ${activeEntries.length} active`, {
    component: 'cron-sweep',
    activeCount: activeEntries.length,
    eligibleCount: eligible.length
  });

  for (const entry of eligible) {
    try {
      const entryToConclude: Entry = {
        ...entry,
        status: 'concluded',
        concludedAt: new Date(nowMs).toISOString(),
        concludedBy: 'auto_timer'
      };

      await concludeFn(entryToConclude);
      concludedCount++;

      logger.info(`Auto-concluded idle entry ${entry.id}`, {
        component: 'cron-sweep',
        entryId: entry.id,
        userId: entry.userId
      });
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      errors.push({ entryId: entry.id, error: errorMsg });

      logger.error(`Failed to auto-conclude entry ${entry.id}`, err, {
        component: 'cron-sweep',
        entryId: entry.id
      });
    }
  }

  const durationMs = Date.now() - start;
  const status = errors.length === 0 ? 'ok' : concludedCount > 0 ? 'partial' : 'error';

  logger.info(`Auto-conclude sweep pass finished in ${durationMs}ms with status: ${status}`, {
    component: 'cron-sweep',
    durationMs,
    concludedCount,
    failedCount: errors.length
  });

  return {
    status,
    sweptCount: activeEntries.length,
    eligibleCount: eligible.length,
    concludedCount,
    failedCount: errors.length,
    durationMs,
    errors
  };
}
