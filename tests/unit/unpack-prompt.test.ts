import { describe, it, expect } from 'vitest';
import { buildUnpackPrompt, parseUnpackResponse } from '../../src/integrations/unpack/prompt';
import { Theme, ThemeObservation } from '../../src/types';

describe('Unpack Further Prompt & Parser (Tier 1 TDD)', () => {
  const sampleTheme: Theme = {
    id: 'theme-velocity',
    userId: 'user-1',
    title: 'Architectural Rigor vs Velocity',
    currentSynthesis: 'Balancing speed of shipping against clean software abstractions.',
    observationCount: 3,
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-09-04T12:00:00Z',
  };

  const sampleObservations: ThemeObservation[] = [
    {
      id: 'obs-2',
      userId: 'user-1',
      entryId: 'entry-2',
      themeId: 'theme-velocity',
      observationText: 'Realized that tech debt is not just code quality, but cognitive overhead for the team.',
      timestamp: '2026-08-25T14:00:00Z',
    },
    {
      id: 'obs-1',
      userId: 'user-1',
      entryId: 'entry-1',
      themeId: 'theme-velocity',
      observationText: 'Felt intense anxiety about shipping a messy prototype under time pressure.',
      timestamp: '2026-08-16T10:00:00Z',
    },
    {
      id: 'obs-3',
      userId: 'user-1',
      entryId: 'entry-3',
      themeId: 'theme-velocity',
      observationText: 'Adopted a 3-tier TDD boundary that allows fast iterations with zero test friction.',
      timestamp: '2026-09-02T16:00:00Z',
    },
  ];

  it('sorts observations in strict chronological order with date headers in the prompt', () => {
    const prompt = buildUnpackPrompt(sampleTheme, sampleObservations);

    // Assert that earliest observation (Aug 16) appears before subsequent ones (Aug 25, Sep 2)
    const posObs1 = prompt.indexOf('Felt intense anxiety about shipping a messy prototype');
    const posObs2 = prompt.indexOf('Realized that tech debt is not just code quality');
    const posObs3 = prompt.indexOf('Adopted a 3-tier TDD boundary');

    expect(posObs1).toBeGreaterThan(-1);
    expect(posObs2).toBeGreaterThan(posObs1);
    expect(posObs3).toBeGreaterThan(posObs2);

    expect(prompt).toContain('Theme: "Architectural Rigor vs Velocity"');
    expect(prompt).toContain('<<<OBSERVATIONS_TIMELINE>>>');
    expect(prompt).toContain('<<<END_OBSERVATIONS_TIMELINE>>>');
  });

  it('parses valid JSON response into complete UnpackResult structure', () => {
    const rawJson = JSON.stringify({
      workingTitle: 'The Architecture Trap: When Velocity Breeds Clarity',
      thesis: 'True development velocity is not the speed of initial coding, but the pace at which a team can sustainably modify working software.',
      narrative: 'Over the course of three weeks, your reflections evolved from raw anxiety about messy prototypes to recognizing tech debt as cognitive fatigue. The pivotal shift occurred when you realized automated test boundaries serve as creative confidence rather than bureaucratic ceremony.',
      explorationPaths: [
        {
          pathTitle: 'Angle A: Cognitive Debt over Code Debt',
          promptStarter: 'Write an opening reflection exploring why messy code exhausts our working memory long before it breaks tests.',
          inquiries: [
            'Where does prototype guilt come from in your workflow?',
            'What is the minimum viable structure needed to keep thinking clearly?',
          ],
        },
        {
          pathTitle: 'Angle B: Guardrails as Accelerators',
          promptStarter: 'Examine how contract-driven TDD can act as a catalyst for creative exploration rather than a constraint.',
          inquiries: [
            'How did mock-boundary testing change your relationship with speed?',
            'What does a calm engineering cadence feel like in practice?',
          ],
        },
      ],
    });

    const parsed = parseUnpackResponse(rawJson);
    expect(parsed.workingTitle).toBe('The Architecture Trap: When Velocity Breeds Clarity');
    expect(parsed.thesis).toContain('True development velocity is not the speed');
    expect(parsed.narrative).toContain('Over the course of three weeks');
    expect(parsed.explorationPaths).toHaveLength(2);
    expect(parsed.explorationPaths[0].pathTitle).toBe('Angle A: Cognitive Debt over Code Debt');
    expect(parsed.explorationPaths[0].inquiries).toHaveLength(2);
  });

  it('strips markdown code fences (```json ... ```) cleanly when parsing', () => {
    const fencedJson = '```json\n{\n  "workingTitle": "Fenced Title",\n  "thesis": "Fenced Thesis.",\n  "narrative": "Fenced Narrative.",\n  "explorationPaths": []\n}\n```';
    const parsed = parseUnpackResponse(fencedJson);
    expect(parsed.workingTitle).toBe('Fenced Title');
    expect(parsed.thesis).toBe('Fenced Thesis.');
    expect(parsed.narrative).toBe('Fenced Narrative.');
  });

  it('recovers gracefully from malformed or non-JSON output without throwing an unhandled exception', () => {
    const malformed = 'Here is what I think about your theme: It is very interesting and you should write about it!';
    const parsed = parseUnpackResponse(malformed, sampleTheme);

    expect(parsed.workingTitle).toBe(sampleTheme.title);
    expect(parsed.thesis).toBe(sampleTheme.currentSynthesis);
    expect(parsed.narrative).toBe(malformed);
    expect(parsed.explorationPaths.length).toBeGreaterThan(0);
  });
});
