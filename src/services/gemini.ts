import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// 1. Resilient Model Fallback Ladder (Locus Software Standard 2)
export const MODEL_FALLBACK_LADDER = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-2.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest'
];

export interface FallbackOptions {
  systemInstruction?: string;
  temperature?: number;
  contents: string | any[];
}

let aiClient: GoogleGenAI | null = null;
let lastApiKey: string | undefined;

/**
 * Lazy initialization of GoogleGenAI SDK. Reinitializes dynamically if GEMINI_API_KEY changes.
 */
export function getAIClient(): GoogleGenAI {
  try {
    dotenv.config({ override: true });
  } catch {
    // Ignore in environments where filesystem is unavailable
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!aiClient || lastApiKey !== apiKey) {
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY environment variable is not configured.');
    }
    lastApiKey = apiKey;
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

  const errorMessage = String(lastError?.message || '');
  const isQuota = lastError?.status === 429 || errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('credits');

  if (isQuota) {
    throw new Error('The reflection companion is temporarily unavailable due to API quota limits. Your entry is safely preserved locally.');
  }

  throw new Error('Unable to reach reflection companion right now. Your entry is safely preserved locally.');
}
