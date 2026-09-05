import { describe, it, expect } from 'vitest';
import { selectReturnCandidate } from '../../src/services/returnRouter';
import { Entry, Stratum } from '../../src/types';

describe('The Return Explainable Daily Routing (Tier 1 TDD)', () => {
  const createBaseEntry = (id: string, overrides: Partial<Entry> = {}): Entry => ({
    id,
    userId: 'user-return-test',
    title: `Entry ${id}`,
    createdAt: new Date().toISOString(),
    concludedAt: new Date().toISOString(),
    status: 'concluded',
    category: 'Work',
    turns: [],
    stratumCount: 0,
    returnCount: 0,
    ...overrides,
  });

  it('returns null when there are no concluded entries', () => {
    const activeOnly: Entry[] = [
      createBaseEntry('e1', { status: 'active', concludedAt: undefined }),
    ];
    expect(selectReturnCandidate(activeOnly)).toBeNull();
  });

  it('routes to anniversary when an entry was written roughly 1 year ago', () => {
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const entryAnniversary = createBaseEntry('e-anniversary', {
      title: 'A Year of Growth',
      concludedAt: oneYearAgo,
    });
    const entryRecent = createBaseEntry('e-recent', {
      concludedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const candidate = selectReturnCandidate([entryRecent, entryAnniversary]);
    expect(candidate).not.toBeNull();
    expect(candidate?.reason).toBe('anniversary');
    expect(candidate?.entry.id).toBe('e-anniversary');
    expect(candidate?.evidence).toContain('written 1 year ago today');
  });

  it('routes to unresolved when an entry contains open threads', () => {
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
    const entryUnresolved = createBaseEntry('e-open-thread', {
      title: 'Deciding on Team Architecture',
      concludedAt: sixMonthsAgo,
      openThreads: ['Should we migrate to serverless or keep dedicated compute?'],
    });

    const candidate = selectReturnCandidate([entryUnresolved]);
    expect(candidate).not.toBeNull();
    expect(candidate?.reason).toBe('unresolved');
    expect(candidate?.entry.id).toBe('e-open-thread');
    expect(candidate?.evidence).toContain('unresolved thread');
    expect(candidate?.evidence).toContain('Should we migrate');
  });

  it('routes to contradiction when two entries have contrasting emotional stances', () => {
    const entryAnxious = createBaseEntry('e-anxious', {
      title: 'Facing the Launch',
      category: 'Work',
      mood: 'Anxious',
      concludedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const entryCalm = createBaseEntry('e-calm', {
      title: 'Post-Launch Clarity',
      category: 'Work',
      mood: 'Calm',
      concludedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const candidate = selectReturnCandidate([entryAnxious, entryCalm]);
    expect(candidate).not.toBeNull();
    expect(candidate?.reason).toBe('contradiction');
    expect(candidate?.entry.id).toBe('e-anxious');
    expect(candidate?.contradictingEntry).toBeDefined();
    expect(candidate?.contradictingEntry?.id).toBe('e-calm');
    expect(candidate?.contradictingEntry?.title).toBe('Post-Launch Clarity');
  });

  it('falls back to dormant entry when no special heuristic matches', () => {
    const oldestDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const newestDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();

    const entryOld = createBaseEntry('e-old', { concludedAt: oldestDate, mood: 'Neutral' });
    const entryNew = createBaseEntry('e-new', { concludedAt: newestDate, mood: 'Neutral' });

    const candidate = selectReturnCandidate([entryNew, entryOld]);
    expect(candidate).not.toBeNull();
    expect(candidate?.reason).toBe('dormant');
    expect(candidate?.entry.id).toBe('e-old');
    expect(candidate?.evidence).toContain('unvisited');
  });

  it('associates existing strata with the chosen return candidate', () => {
    const entry = createBaseEntry('e-with-strata', {
      concludedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const strata: Stratum[] = [
      {
        id: 's1',
        entryId: 'e-with-strata',
        userId: 'u1',
        bodyMarkdown: 'Early marginal note.',
        depth: 1,
        daysLater: 20,
        stance: 'gratitude',
        createdAt: new Date().toISOString(),
        sealedAt: new Date().toISOString(),
      },
    ];

    const candidate = selectReturnCandidate([entry], strata);
    expect(candidate).not.toBeNull();
    expect(candidate?.strata.length).toBe(1);
    expect(candidate?.strata[0].id).toBe('s1');
  });
});
