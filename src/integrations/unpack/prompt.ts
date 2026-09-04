import { Theme, ThemeObservation } from '../../types';
import { UnpackResult, ExplorationPath } from './types';
import { sanitizeForOutbound } from '../sanitizer';

/**
 * Builds the structured prompt for Gemini to unpack a Theme into:
 * 1. Working essay title
 * 2. 1-sentence evolutionary thesis
 * 3. Contextual narrative (1-2 paragraphs detailing cognitive shift across observations)
 * 4. 2-3 divergent exploration paths with creative writing prompts
 */
export function buildUnpackPrompt(theme: Theme, observations: ThemeObservation[]): string {
  // Sort observations chronologically
  const sorted = [...observations].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const observationsTimeline = sorted
    .map((obs, idx) => {
      const dateStr = obs.timestamp ? new Date(obs.timestamp).toLocaleDateString() : `Step ${idx + 1}`;
      const location = obs.locationSnapshot ? ` (Location: ${obs.locationSnapshot})` : '';
      const text = sanitizeForOutbound(obs.observationText);
      return `[${dateStr}${location}] Observation #${idx + 1}:\n${text}`;
    })
    .join('\n\n');

  return `You are an empathetic, intellectually rigorous creative partner for thoughtful writers and knowledge workers.
Analyze this user's longitudinal intellectual/emotional trajectory for the Theme: "${sanitizeForOutbound(theme.title)}".

Current Theme Synthesis:
"${sanitizeForOutbound(theme.currentSynthesis)}"

<<<OBSERVATIONS_TIMELINE>>>
${observationsTimeline}
<<<END_OBSERVATIONS_TIMELINE>>>

INSTRUCTIONS:
1. Distill an evocative, non-generic Working Title for an essay or article based on this theme.
2. Formulate a crisp, provocative 1-sentence Evolutionary Thesis capturing the core realization that unfolded across time.
3. Write a thoughtful Contextual Narrative (1-2 rich paragraphs) explaining specifically HOW this thinking shifted across the timeline. Reference the tensions they faced, what changed between early and later reflections, and the underlying pattern.
4. Instead of a rigid traditional outline, provide 2 to 3 divergent Exploration Paths. Give writers creative freedom:
   - pathTitle: Evocative angle name
   - promptStarter: An inspiring opening question or writing prompt
   - inquiries: 2 specific tensions, paradoxes, or personal questions to unpack

Respond EXCLUSIVELY with a valid JSON object matching this schema:
{
  "workingTitle": "string",
  "thesis": "string",
  "narrative": "string",
  "explorationPaths": [
    {
      "pathTitle": "string",
      "promptStarter": "string",
      "inquiries": ["string", "string"]
    }
  ]
}`;
}

/**
 * Parses Gemini output into typed UnpackResult with fallback recovery.
 */
export function parseUnpackResponse(rawResponse: string, fallbackTheme?: Theme): UnpackResult {
  const themeId = fallbackTheme?.id || 'theme-unknown';
  const now = new Date().toISOString();

  let cleaned = rawResponse.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    const parsed = JSON.parse(cleaned);

    const paths: ExplorationPath[] = Array.isArray(parsed.explorationPaths)
      ? parsed.explorationPaths.map((p: any) => {
          const starter = String(p.promptStarter || p.creativePrompt || 'Reflect on how this pattern influences your work.');
          return {
            pathTitle: String(p.pathTitle || 'Exploration Angle'),
            promptStarter: starter,
            creativePrompt: starter,
            inquiries: Array.isArray(p.inquiries) ? p.inquiries.map(String) : [],
          };
        })
      : [];

    const title = String(parsed.workingTitle || fallbackTheme?.title || 'Reflective Trajectory');
    const thesisText = String(parsed.thesis || fallbackTheme?.currentSynthesis || 'An evolving pattern of thought.');
    const narrativeText = String(parsed.narrative || rawResponse);

    return {
      themeId,
      workingTitle: title,
      thesis: thesisText,
      evolutionaryThesis: thesisText,
      narrative: narrativeText,
      narrativeArc: narrativeText,
      explorationPaths: paths,
      generatedAt: now,
    };
  } catch (err) {
    console.warn('Could not parse JSON from Unpack Further response. Applying graceful fallback.');
    const fallbackTitle = fallbackTheme?.title || 'Reflective Trajectory';
    const fallbackThesis = fallbackTheme?.currentSynthesis || 'An evolving pattern of thought.';
    const defaultStarter = `What is the deeper tension underlying ${fallbackTitle}?`;

    return {
      themeId,
      workingTitle: fallbackTitle,
      thesis: fallbackThesis,
      evolutionaryThesis: fallbackThesis,
      narrative: rawResponse,
      narrativeArc: rawResponse,
      explorationPaths: [
        {
          pathTitle: 'Core Dilemma',
          promptStarter: defaultStarter,
          creativePrompt: defaultStarter,
          inquiries: ['Where does this belief come from?', 'What changes if you let go of this tension?'],
        },
      ],
      generatedAt: now,
    };
  }
}
