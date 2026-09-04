import { describe, it, expect } from 'vitest';
import { 
  isEntryEligibleForAutoConclude, 
  getRemainingActiveMs, 
  formatRemainingTime,
  TWO_HOURS_MS 
} from '../../src/services/concludeEngine';

describe('Auto-Conclude Engine (Tier 1 Unit TDD)', () => {
  const baseTime = new Date('2026-09-04T12:00:00.000Z').getTime();

  it('evaluates an active entry updated 30 minutes ago as active (not eligible for conclude)', () => {
    const entry = {
      status: 'active' as const,
      createdAt: new Date(baseTime - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(baseTime - 30 * 60 * 1000).toISOString(),
    };

    expect(isEntryEligibleForAutoConclude(entry, baseTime)).toBe(false);
  });

  it('evaluates an active entry updated 119 minutes ago as active', () => {
    const entry = {
      status: 'active' as const,
      createdAt: new Date(baseTime - 120 * 60 * 1000).toISOString(),
      updatedAt: new Date(baseTime - 119 * 60 * 1000).toISOString(),
    };

    expect(isEntryEligibleForAutoConclude(entry, baseTime)).toBe(false);
  });

  it('evaluates an active entry updated 121 minutes ago as eligible for auto-conclude', () => {
    const entry = {
      status: 'active' as const,
      createdAt: new Date(baseTime - 150 * 60 * 1000).toISOString(),
      updatedAt: new Date(baseTime - 121 * 60 * 1000).toISOString(),
    };

    expect(isEntryEligibleForAutoConclude(entry, baseTime)).toBe(true);
  });

  it('never marks an already concluded entry as eligible for conclude', () => {
    const entry = {
      status: 'concluded' as const,
      createdAt: new Date(baseTime - 200 * 60 * 1000).toISOString(),
      updatedAt: new Date(baseTime - 150 * 60 * 1000).toISOString(),
    };

    expect(isEntryEligibleForAutoConclude(entry, baseTime)).toBe(false);
  });

  it('falls back to createdAt if updatedAt is missing', () => {
    const entry = {
      status: 'active' as const,
      createdAt: new Date(baseTime - 130 * 60 * 1000).toISOString(),
    };

    expect(isEntryEligibleForAutoConclude(entry, baseTime)).toBe(true);
  });

  it('calculates remaining active milliseconds correctly', () => {
    const entry = {
      status: 'active' as const,
      createdAt: new Date(baseTime - 45 * 60 * 1000).toISOString(),
      updatedAt: new Date(baseTime - 45 * 60 * 1000).toISOString(),
    };

    const remaining = getRemainingActiveMs(entry, baseTime);
    expect(remaining).toBe(75 * 60 * 1000); // 120m - 45m = 75m
  });

  it('formats remaining active duration in calm human-readable copy', () => {
    expect(formatRemainingTime(75 * 60 * 1000)).toBe('1h 15m');
    expect(formatRemainingTime(25 * 60 * 1000)).toBe('25m');
    expect(formatRemainingTime(0)).toBe('Concluded');
  });
});
