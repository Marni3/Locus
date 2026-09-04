import { describe, it, expect, vi } from 'vitest';
import { unpackThemeFurther } from '../../src/integrations/unpack';
import { Theme, ThemeObservation } from '../../src/types';
import * as geminiService from '../../src/services/gemini';

describe('Unpack Further Service (Tier 2 Mock-Boundary TDD)', () => {
  const sampleTheme: Theme = {
    id: 'theme-deep-work',
    userId: 'u1',
    title: 'Deep Work & Distraction',
    currentSynthesis: 'Struggles to find uninterrupted morning blocks.',
    observationCount: 2,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z',
  };

  const sampleObs: ThemeObservation[] = [
    {
      id: 'o1',
      userId: 'u1',
      entryId: 'e1',
      themeId: 'theme-deep-work',
      observationText: 'Notifications fragmented morning focus.',
      timestamp: '2026-08-02T10:00:00Z',
    },
    {
      id: 'o2',
      userId: 'u1',
      entryId: 'e2',
      themeId: 'theme-deep-work',
      observationText: 'Airplane mode preserved 3 hours of flow.',
      timestamp: '2026-08-09T10:00:00Z',
    },
  ];

  it('rejects themes with fewer than 2 observations with a clear user-facing error', async () => {
    await expect(unpackThemeFurther(sampleTheme, [sampleObs[0]])).rejects.toThrow(
      'requires at least 2 observations to unpack evolutionary patterns'
    );
  });

  it('successfully unpacks a theme into structured thesis, narrative, and exploration paths', async () => {
    vi.spyOn(geminiService, 'generateContentWithFallback').mockResolvedValueOnce({
      text: JSON.stringify({
        workingTitle: 'The Silent Threshold: Reclaiming Deep Work',
        thesis: 'Flow is not created by willpower, but protected by intentional environmental boundaries.',
        narrative: 'Across two sessions, you moved from feeling helpless against notifications to taking proactive ownership through airplane mode.',
        explorationPaths: [
          {
            pathTitle: 'Environmental Architecture',
            promptStarter: 'How does your physical desk signal focus vs availability?',
            inquiries: ['What is the cost of continuous partial attention?'],
          },
        ],
      }),
      modelUsed: 'gemini-3.6-flash',
    });

    const result = await unpackThemeFurther(sampleTheme, sampleObs);

    expect(result.themeId).toBe('theme-deep-work');
    expect(result.workingTitle).toBe('The Silent Threshold: Reclaiming Deep Work');
    expect(result.thesis).toContain('Flow is not created by willpower');
    expect(result.narrative).toContain('Across two sessions');
    expect(result.explorationPaths).toHaveLength(1);
    expect(result.modelUsed).toBe('gemini-3.6-flash');
  });
});
