import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  validateCronAuth, 
  selectEligibleEntriesForSweep, 
  runAutoConcludeSweep 
} from '../../src/services/cronSweep';
import { Entry } from '../../src/types';

describe('Cloud Scheduler Auto-Conclude Sweep (Tier 1 Unit TDD)', () => {
  const baseTime = new Date('2026-09-06T12:00:00.000Z').getTime();
  const SECRET = 'test_cron_secret_abc123';

  describe('validateCronAuth() (Threat Zone 3 Guardrail)', () => {
    it('approves requests matching X-Cron-Secret header', () => {
      const headers = { 'x-cron-secret': SECRET };
      expect(validateCronAuth(headers, SECRET)).toBe(true);
    });

    it('approves requests with Bearer Authorization token', () => {
      const headers = { authorization: `Bearer ${SECRET}` };
      expect(validateCronAuth(headers, SECRET)).toBe(true);
    });

    it('rejects requests with mismatched secret', () => {
      const headers = { 'x-cron-secret': 'wrong_secret' };
      expect(validateCronAuth(headers, SECRET)).toBe(false);
    });

    it('rejects requests missing secret header when secret is configured', () => {
      const headers = {};
      expect(validateCronAuth(headers, SECRET)).toBe(false);
    });
  });

  describe('selectEligibleEntriesForSweep()', () => {
    const makeEntry = (id: string, ageMinutes: number, status: 'active' | 'concluded' = 'active'): Entry => ({
      id,
      userId: 'usr_1',
      title: `Reflection ${id}`,
      status,
      createdAt: new Date(baseTime - ageMinutes * 60 * 1000).toISOString(),
      updatedAt: new Date(baseTime - ageMinutes * 60 * 1000).toISOString(),
      turns: []
    });

    it('selects only active entries older than 2 hours (120 minutes)', () => {
      const entries: Entry[] = [
        makeEntry('1', 30),   // active, 30m old -> not eligible
        makeEntry('2', 125),  // active, 125m old -> ELIGIBLE
        makeEntry('3', 90),   // active, 90m old -> not eligible
        makeEntry('4', 180),  // active, 180m old -> ELIGIBLE
        makeEntry('5', 300, 'concluded') // already concluded -> not eligible
      ];

      const eligible = selectEligibleEntriesForSweep(entries, baseTime, 5);
      expect(eligible.map(e => e.id)).toEqual(['2', '4']);
    });

    it('strictly caps the batch to maxBatch to prevent Cloud Run timeout and quota exhaustion', () => {
      const entries: Entry[] = [
        makeEntry('1', 130),
        makeEntry('2', 140),
        makeEntry('3', 150),
        makeEntry('4', 160),
        makeEntry('5', 170),
        makeEntry('6', 180),
        makeEntry('7', 190)
      ];

      const eligible = selectEligibleEntriesForSweep(entries, baseTime, 3);
      expect(eligible.length).toBe(3);
      expect(eligible.map(e => e.id)).toEqual(['1', '2', '3']);
    });
  });

  describe('runAutoConcludeSweep()', () => {
    it('concludes eligible entries with auto_timer metadata and returns summary metrics', async () => {
      const activeEntries: Entry[] = [
        {
          id: 'entry_old_1',
          userId: 'usr_1',
          title: 'Old Reflection',
          status: 'active',
          createdAt: new Date(baseTime - 150 * 60 * 1000).toISOString(),
          turns: []
        },
        {
          id: 'entry_recent_2',
          userId: 'usr_1',
          title: 'Recent Reflection',
          status: 'active',
          createdAt: new Date(baseTime - 20 * 60 * 1000).toISOString(),
          turns: []
        }
      ];

      const concludedLog: Entry[] = [];
      const mockConcludeFn = vi.fn(async (entry: Entry) => {
        concludedLog.push(entry);
        return { success: true };
      });

      const result = await runAutoConcludeSweep(activeEntries, mockConcludeFn, { nowMs: baseTime, maxBatch: 5 });

      expect(result.status).toBe('ok');
      expect(result.sweptCount).toBe(2);
      expect(result.eligibleCount).toBe(1);
      expect(result.concludedCount).toBe(1);
      expect(result.failedCount).toBe(0);

      expect(mockConcludeFn).toHaveBeenCalledTimes(1);
      expect(concludedLog[0].id).toBe('entry_old_1');
      expect(concludedLog[0].status).toBe('concluded');
      expect(concludedLog[0].concludedBy).toBe('auto_timer');
      expect(concludedLog[0].concludedAt).toBe(new Date(baseTime).toISOString());
    });

    it('isolates failures so one failing synthesis does not abort other conclusions', async () => {
      const activeEntries: Entry[] = [
        {
          id: 'failing_entry',
          userId: 'usr_1',
          title: 'Failing Entry',
          status: 'active',
          createdAt: new Date(baseTime - 200 * 60 * 1000).toISOString(),
          turns: []
        },
        {
          id: 'succeeding_entry',
          userId: 'usr_1',
          title: 'Succeeding Entry',
          status: 'active',
          createdAt: new Date(baseTime - 180 * 60 * 1000).toISOString(),
          turns: []
        }
      ];

      const mockConcludeFn = vi.fn(async (entry: Entry) => {
        if (entry.id === 'failing_entry') {
          throw new Error('Firestore transaction lock error');
        }
        return { success: true };
      });

      const result = await runAutoConcludeSweep(activeEntries, mockConcludeFn, { nowMs: baseTime, maxBatch: 5 });

      expect(result.status).toBe('partial');
      expect(result.eligibleCount).toBe(2);
      expect(result.concludedCount).toBe(1);
      expect(result.failedCount).toBe(1);
      expect(result.errors).toEqual([
        { entryId: 'failing_entry', error: 'Firestore transaction lock error' }
      ]);
    });
  });
});
