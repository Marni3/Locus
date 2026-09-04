import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  executeSynthesisPipeline, 
  SynthesisPipelineDependencies 
} from '../../src/services/synthesis';
import { Entry, Theme, ThemeObservation } from '../../src/types';

describe('Synthesis Pipeline Service (Tier 2 Mock-Boundary TDD)', () => {
  const mockEntry: Entry = {
    id: 'entry-123',
    userId: 'user-abc',
    title: 'Time Sovereignty Reflection',
    createdAt: '2026-09-04T10:00:00.000Z',
    status: 'active',
    turns: [
      {
        id: 'turn-1',
        entryId: 'entry-123',
        userId: 'user-abc',
        role: 'user',
        content: 'I need to stop saying yes to every meeting request.',
        timestamp: '2026-09-04T10:00:00.000Z',
        isPinned: true,
        note: 'High cognitive friction'
      },
      {
        id: 'turn-2',
        entryId: 'entry-123',
        userId: 'user-abc',
        role: 'ai',
        content: 'What would happen if you blocked mornings for deep work?',
        timestamp: '2026-09-04T10:01:00.000Z'
      }
    ]
  };

  const existingTheme: Theme = {
    id: 'theme-boundaries',
    userId: 'user-abc',
    title: 'Time Sovereignty & Boundaries',
    currentSynthesis: 'Prioritizing focus blocks over reactive calendar invites.',
    observationCount: 3,
    createdAt: '2026-08-15T09:00:00.000Z',
    updatedAt: '2026-08-25T14:00:00.000Z',
    embedding: [0.1, 0.2, 0.3]
  };

  it('successfully connects an entry to an existing theme with a new observation delta', async () => {
    const deps: SynthesisPipelineDependencies = {
      summarize: vi.fn().mockResolvedValue('Recognized that meeting overload is draining focus.'),
      embed: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
      searchThemes: vi.fn().mockResolvedValue([existingTheme]),
      resolveThemes: vi.fn().mockResolvedValue({
        matchedThemes: [
          {
            themeId: 'theme-boundaries',
            observationText: 'Decided to protect morning hours as non-negotiable deep work.'
          }
        ],
        newThemes: []
      }),
      persistBatch: vi.fn().mockResolvedValue(undefined)
    };

    const result = await executeSynthesisPipeline(mockEntry, deps);

    expect(result.concludedEntry.status).toBe('concluded');
    expect(result.concludedEntry.concludedAt).toBeDefined();
    expect(result.concludedEntry.summary).toBe('Recognized that meeting overload is draining focus.');

    expect(result.newObservations).toHaveLength(1);
    expect(result.newObservations[0].themeId).toBe('theme-boundaries');
    expect(result.newObservations[0].entryId).toBe('entry-123');
    expect(result.newObservations[0].observationText).toBe('Decided to protect morning hours as non-negotiable deep work.');

    expect(result.updatedThemes).toHaveLength(1);
    expect(result.updatedThemes[0].observationCount).toBe(4); // incremented 3 -> 4

    expect(deps.persistBatch).toHaveBeenCalledOnce();
  });

  it('creates a new theme and initial observation when no candidate theme matches', async () => {
    const deps: SynthesisPipelineDependencies = {
      summarize: vi.fn().mockResolvedValue('Exploring woodworking as a tactile meditation away from screens.'),
      embed: vi.fn().mockResolvedValue([0.8, 0.9, 0.1]),
      searchThemes: vi.fn().mockResolvedValue([]),
      resolveThemes: vi.fn().mockResolvedValue({
        matchedThemes: [],
        newThemes: [
          {
            title: 'Tactile Craft & Embodiment',
            currentSynthesis: 'Engaging in physical craft to counter digital cognitive fatigue.',
            initialObservationText: 'Started manual woodworking to experience tangible creation.'
          }
        ]
      }),
      persistBatch: vi.fn().mockResolvedValue(undefined)
    };

    const result = await executeSynthesisPipeline(mockEntry, deps);

    expect(result.concludedEntry.status).toBe('concluded');
    expect(result.newThemes).toHaveLength(1);
    expect(result.newThemes[0].title).toBe('Tactile Craft & Embodiment');
    expect(result.newThemes[0].observationCount).toBe(1);

    expect(result.newObservations).toHaveLength(1);
    expect(result.newObservations[0].themeId).toBe(result.newThemes[0].id);
    expect(result.newObservations[0].entryId).toBe('entry-123');
  });

  it('resiliently handles embedding failures without crashing the conclusion pipeline', async () => {
    const deps: SynthesisPipelineDependencies = {
      summarize: vi.fn().mockResolvedValue('A brief thought.'),
      embed: vi.fn().mockRejectedValue(new Error('Quota exceeded on embedding model')),
      searchThemes: vi.fn().mockResolvedValue([]),
      resolveThemes: vi.fn().mockResolvedValue({
        matchedThemes: [],
        newThemes: [
          {
            title: 'Spontaneous Musings',
            currentSynthesis: 'Short unstructured thoughts.',
            initialObservationText: 'Captured quick insight.'
          }
        ]
      }),
      persistBatch: vi.fn().mockResolvedValue(undefined)
    };

    const result = await executeSynthesisPipeline(mockEntry, deps);

    // Should complete cleanly despite embedding rejection!
    expect(result.concludedEntry.status).toBe('concluded');
    expect(result.concludedEntry.summary).toBe('A brief thought.');
    expect(result.newThemes).toHaveLength(1);
  });
});
