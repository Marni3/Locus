import { describe, it, expect, vi } from 'vitest';
import { 
  findExpiredActiveEntries, 
  reconcileExpiredEntries 
} from '../../src/services/lazyReconcile';
import { Entry } from '../../src/types';

describe('Lazy Reconciliation Engine (Tier 1 Unit TDD)', () => {
  const baseTime = new Date('2026-09-08T12:00:00.000Z').getTime();

  const createMockEntry = (
    id: string, 
    status: 'active' | 'concluded', 
    minutesAgo: number
  ): Entry => ({
    id,
    userId: 'user-123',
    title: `Entry ${id}`,
    status,
    createdAt: new Date(baseTime - minutesAgo * 60 * 1000).toISOString(),
    updatedAt: new Date(baseTime - minutesAgo * 60 * 1000).toISOString(),
    turns: [],
    stratumCount: 0,
    returnCount: 0,
  });

  describe('findExpiredActiveEntries()', () => {
    it('identifies entries active for longer than 2 hours (120 minutes)', () => {
      const entries: Entry[] = [
        createMockEntry('fresh-active', 'active', 30),
        createMockEntry('expired-active-1', 'active', 125),
        createMockEntry('expired-active-2', 'active', 300),
        createMockEntry('old-concluded', 'concluded', 500),
      ];

      const expired = findExpiredActiveEntries(entries, baseTime);
      expect(expired.map((e) => e.id)).toEqual(['expired-active-1', 'expired-active-2']);
    });

    it('returns empty array if all active entries are within the 2-hour window', () => {
      const entries: Entry[] = [
        createMockEntry('fresh-1', 'active', 10),
        createMockEntry('fresh-2', 'active', 119),
      ];

      const expired = findExpiredActiveEntries(entries, baseTime);
      expect(expired).toEqual([]);
    });

    it('never includes concluded entries regardless of their elapsed age', () => {
      const entries: Entry[] = [
        createMockEntry('concluded-1', 'concluded', 200),
        createMockEntry('concluded-2', 'concluded', 2000),
      ];

      const expired = findExpiredActiveEntries(entries, baseTime);
      expect(expired).toEqual([]);
    });
  });

  describe('reconcileExpiredEntries()', () => {
    it('invokes concludeFn for every expired entry and returns metrics', async () => {
      const entries: Entry[] = [
        createMockEntry('e1', 'active', 130),
        createMockEntry('e2', 'active', 45),
        createMockEntry('e3', 'active', 240),
      ];

      const concludeMock = vi.fn().mockResolvedValue({ status: 'ok' });

      const result = await reconcileExpiredEntries(entries, concludeMock, baseTime);

      expect(concludeMock).toHaveBeenCalledTimes(2);
      expect(concludeMock).toHaveBeenCalledWith(entries[0]);
      expect(concludeMock).toHaveBeenCalledWith(entries[2]);

      expect(result.eligibleCount).toBe(2);
      expect(result.reconciledCount).toBe(2);
      expect(result.failedCount).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('isolates errors so a failed conclusion does not abort remaining entries', async () => {
      const entries: Entry[] = [
        createMockEntry('fail-entry', 'active', 150),
        createMockEntry('success-entry', 'active', 180),
      ];

      const concludeMock = vi.fn().mockImplementation(async (entry: Entry) => {
        if (entry.id === 'fail-entry') {
          throw new Error('Synthesis quota error');
        }
        return { status: 'ok' };
      });

      const result = await reconcileExpiredEntries(entries, concludeMock, baseTime);

      expect(concludeMock).toHaveBeenCalledTimes(2);
      expect(result.eligibleCount).toBe(2);
      expect(result.reconciledCount).toBe(1);
      expect(result.failedCount).toBe(1);
      expect(result.errors).toEqual([
        { entryId: 'fail-entry', error: 'Synthesis quota error' }
      ]);
    });

    it('returns 0 counts immediately if there are no entries to reconcile', async () => {
      const concludeMock = vi.fn();
      const result = await reconcileExpiredEntries([], concludeMock, baseTime);

      expect(concludeMock).not.toHaveBeenCalled();
      expect(result.eligibleCount).toBe(0);
      expect(result.reconciledCount).toBe(0);
      expect(result.failedCount).toBe(0);
    });
  });
});
