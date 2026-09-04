import { Theme, ThemeObservation } from '../../types';
import { generateContentWithFallback } from '../../services/gemini';
import { buildUnpackPrompt, parseUnpackResponse } from './prompt';
import { UnpackResult } from './types';

/**
 * Unpacks a Theme with $\ge 2$ Observations into a rich writing thesis,
 * contextual evolution narrative, and divergent creative exploration paths.
 */
export async function unpackThemeFurther(
  theme: Theme,
  observations: ThemeObservation[]
): Promise<UnpackResult> {
  if (!observations || observations.length < 2) {
    throw new Error(
      `Theme "${theme.title}" requires at least 2 observations to unpack evolutionary patterns (found ${observations?.length || 0}).`
    );
  }

  const prompt = buildUnpackPrompt(theme, observations);
  const systemInstruction =
    'You are an empathetic, intellectually rigorous creative writing and thinking mentor. Always emit valid JSON matching the requested schema without conversational filler.';

  try {
    const { text, modelUsed } = await generateContentWithFallback({
      contents: prompt,
      systemInstruction,
      temperature: 0.7,
    });

    const result = parseUnpackResponse(text, theme);
    result.modelUsed = modelUsed;
    return result;
  } catch (err: any) {
    console.warn(
      'Gemini API call failed for unpack further, activating resilient heuristic fallback:',
      err?.message || err
    );
    const sorted = [...observations].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const firstObs = sorted[0]?.observationText || '';
    const lastObs = sorted[sorted.length - 1]?.observationText || '';
    const fallbackNarrative = `Across ${observations.length} reflections, thinking around "${theme.title}" developed from early realizations ("${firstObs.slice(0, 100)}...") toward consolidated clarity ("${lastObs.slice(0, 100)}..."). This longitudinal progression reveals how consistent reflection refines core mental models.`;

    const fallbackResult = parseUnpackResponse(fallbackNarrative, theme);
    fallbackResult.narrative = fallbackNarrative;
    fallbackResult.narrativeArc = fallbackNarrative;
    fallbackResult.modelUsed = 'heuristic-resilience-fallback';
    return fallbackResult;
  }
}
