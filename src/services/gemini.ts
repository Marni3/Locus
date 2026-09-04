import { GoogleGenAI } from '@google/genai';

// 1. Resilient Model Fallback Ladder (Locus Software Standard 2)
export const MODEL_FALLBACK_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite'
];

export interface FallbackOptions {
  systemInstruction?: string;
  temperature?: number;
  contents: string | any[];
}

let aiClient: GoogleGenAI | null = null;

/**
 * Lazy initialization of GoogleGenAI SDK to prevent startup crashes if key is pending.
 */
export function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY environment variable is not configured.');
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || '' });
  }
  return aiClient;
}

/**
 * Standard Helper: Attempts content generation across the model fallback ladder.
 * Catches recoverable status codes (503, 429, 404, 500) and sequentially attempts the next model.
 */
export async function generateContentWithFallback(
  options: FallbackOptions
): Promise<{ text: string; modelUsed: string }> {
  const ai = getAIClient();
  let lastError: any = null;

  const normalizedContents = Array.isArray(options.contents) 
    ? options.contents 
    : [options.contents];

  for (const modelName of MODEL_FALLBACK_LADDER) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: normalizedContents,
        config: {
          systemInstruction: options.systemInstruction,
          temperature: options.temperature ?? 0.7,
        }
      });

      const responseText = response.text || '';
      if (responseText.trim().length > 0) {
        return { text: responseText, modelUsed: modelName };
      }
    } catch (err: any) {
      console.warn(`Model ${modelName} encountered error:`, err?.message || err);
      lastError = err;
      // Recoverable error checks -> Continue to next ladder model
      continue;
    }
  }

  throw new Error(
    `All Gemini models in fallback ladder failed. Last error: ${lastError?.message || 'Unknown error'}`
  );
}
