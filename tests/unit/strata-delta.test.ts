import { describe, it, expect } from 'vitest';
import { 
  calculateDaysLater, 
  formatTemporalDistance, 
  getStanceSemanticColor,
  saveStratum,
  fetchStrataForEntry,
  deleteStratum,
  getSampleDemoStrata
} from '../../src/services/strataService';
import { Stratum } from '../../src/types';

describe('Strata Marginalia & Temporal Delta (Tier 1 TDD)', () => {
  describe('calculateDaysLater', () => {
    it('returns 0 for timestamps on the same calendar day', () => {
      const conclusion = '2026-09-01T10:00:00.000Z';
      const note = '2026-09-01T18:00:00.000Z';
      expect(calculateDaysLater(conclusion, note)).toBe(0);
    });

    it('returns 1 for exactly 24 hours later', () => {
      const conclusion = '2026-09-01T10:00:00.000Z';
      const note = '2026-09-02T10:00:00.000Z';
      expect(calculateDaysLater(conclusion, note)).toBe(1);
    });

    it('accurately calculates 94 days later', () => {
      const conclusion = '2026-01-01T12:00:00.000Z';
      const note = new Date(new Date(conclusion).getTime() + 94 * 24 * 60 * 60 * 1000).toISOString();
      expect(calculateDaysLater(conclusion, note)).toBe(94);
    });

    it('handles leap years and negative drift defensively', () => {
      const conclusion = '2026-05-01T12:00:00.000Z';
      const noteBefore = '2026-04-01T12:00:00.000Z'; // note before conclusion
      expect(calculateDaysLater(conclusion, noteBefore)).toBe(0);
    });

    it('returns 0 on malformed or unparseable ISO strings without throwing', () => {
      expect(calculateDaysLater('invalid-iso', '2026-09-01')).toBe(0);
      expect(calculateDaysLater('2026-09-01', 'malformed')).toBe(0);
    });
  });

  describe('formatTemporalDistance', () => {
    it('formats same day as "written on conclusion day"', () => {
      expect(formatTemporalDistance(0)).toBe('written on conclusion day');
      expect(formatTemporalDistance(-5)).toBe('written on conclusion day');
    });

    it('formats 1 day singular', () => {
      expect(formatTemporalDistance(1)).toBe('written 1 day later');
    });

    it('formats 2 to 29 days with plural days', () => {
      expect(formatTemporalDistance(14)).toBe('written 14 days later');
      expect(formatTemporalDistance(29)).toBe('written 29 days later');
    });

    it('formats months when elapsed days are under a year', () => {
      expect(formatTemporalDistance(30)).toBe('written 1 month later');
      expect(formatTemporalDistance(60)).toBe('written 2 months later');
    });

    it('formats compound years and months when over 365 days', () => {
      expect(formatTemporalDistance(365)).toBe('written 1 year later');
      expect(formatTemporalDistance(395)).toBe('written 1 year, 1 month later');
      expect(formatTemporalDistance(730)).toBe('written 2 years later');
    });
  });

  describe('getStanceSemanticColor', () => {
    it('returns distinct archival ink tokens for correction stance', () => {
      const color = getStanceSemanticColor('correction');
      expect(color.label).toBe('Correction');
      expect(color.inkClass).toBe('text-[#8A3A22]');
      expect(color.borderClass).toBe('border-[#8A3A22]');
    });

    it('returns distinct archival ink tokens for confirmation stance', () => {
      const color = getStanceSemanticColor('confirmation');
      expect(color.label).toBe('Confirmation');
      expect(color.inkClass).toBe('text-[#3B5540]');
    });

    it('returns distinct archival ink tokens for question stance', () => {
      const color = getStanceSemanticColor('question');
      expect(color.label).toBe('Question');
      expect(color.inkClass).toBe('text-[#2C3A4F]');
    });

    it('returns distinct archival ink tokens for grief stance', () => {
      const color = getStanceSemanticColor('grief');
      expect(color.label).toBe('Grief');
      expect(color.inkClass).toBe('text-[#5A5648]');
    });

    it('returns distinct archival ink tokens for gratitude stance', () => {
      const color = getStanceSemanticColor('gratitude');
      expect(color.label).toBe('Gratitude');
      expect(color.inkClass).toBe('text-[#3B7A57]');
    });
  });

  describe('Strata CRUD & Memory Fallback', () => {
    it('saves, retrieves, and deletes strata in memory store', async () => {
      const entryId = 'test-entry-immutability-101';
      const userId = 'demo-evaluator';
      
      const newStratum: Stratum = {
        id: 'stratum-unit-1',
        entryId,
        userId,
        bodyMarkdown: 'Margin note testing archival preservation.',
        depth: 1,
        daysLater: 94,
        stance: 'correction',
        createdAt: new Date().toISOString(),
        sealedAt: new Date().toISOString(),
      };

      await saveStratum(userId, newStratum);
      const fetched = await fetchStrataForEntry(userId, entryId);
      expect(fetched.length).toBe(1);
      expect(fetched[0].id).toBe('stratum-unit-1');
      expect(fetched[0].stance).toBe('correction');
      expect(fetched[0].daysLater).toBe(94);

      // Delete stratum
      await deleteStratum(userId, entryId, 'stratum-unit-1');
      const afterDelete = await fetchStrataForEntry(userId, entryId);
      expect(afterDelete.length).toBe(0);
    });

    it('provides multi-depth sample strata for demo mode', () => {
      const strata = getSampleDemoStrata('demo-entry-1');
      expect(strata.length).toBe(2);
      expect(strata[0].depth).toBe(1);
      expect(strata[0].stance).toBe('correction');
      expect(strata[1].depth).toBe(2);
      expect(strata[1].parentStratumId).toBe('stratum-demo-1-1');
      expect(strata[1].stance).toBe('confirmation');
    });
  });
});
