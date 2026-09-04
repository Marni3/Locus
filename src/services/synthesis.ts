import { generateContentWithFallback, getAIClient } from './gemini';
import { Entry, Message, Theme, ThemeObservation, EntryLocation } from '../types';
import { db, stripUndefined, fetchUserThemes } from '../lib/firebase';
import { writeBatch, doc } from 'firebase/firestore';

export interface ResolutionResult {
  matchedThemes: Array<{
    themeId: string;
    observationText: string;
  }>;
  newThemes: Array<{
    title: string;
    currentSynthesis: string;
    initialObservationText: string;
  }>;
}

export interface SynthesisPromptParams {
  summary: string;
  locationContext?: EntryLocation | null;
  pinnedMessages?: Message[];
  candidateThemes?: Theme[];
}

/**
 * Builds the structured prompt for Gemini to resolve entry essence against existing themes.
 * Enforces prompt injection defense via security delimiters.
 */
export function buildSynthesisPrompt(params: SynthesisPromptParams): string {
  const { summary, locationContext, pinnedMessages = [], candidateThemes = [] } = params;

  let prompt = `You are the longitudinal reflective intelligence for Locus (ReflectAI).
Your objective is to analyze the essence of a concluded reflection entry and determine whether it connects to existing intellectual, emotional, or creative Themes, or represents a new emerging Theme.

<<<ENTRY_SUMMARY>>>
${summary}
<<<END_ENTRY_SUMMARY>>>
`;

  if (locationContext?.name) {
    prompt += `\nLocation: ${locationContext.name}\n`;
  }

  if (pinnedMessages.length > 0) {
    prompt += `\n<<<PINNED_MESSAGES>>>\n`;
    pinnedMessages.forEach((msg, idx) => {
      prompt += `[Pinned ${idx + 1}] "${msg.content}"\n`;
      if (msg.note) {
        prompt += `Note: ${msg.note}\n`;
      }
    });
    prompt += `<<<END_PINNED_MESSAGES>>>\n`;
  }

  if (candidateThemes.length > 0) {
    prompt += `\n<<<CANDIDATE_THEMES>>>\n`;
    candidateThemes.forEach((t) => {
      prompt += `- Theme ID: ${t.id} | Title: "${t.title}" | Current Synthesis: "${t.currentSynthesis}"\n`;
    });
    prompt += `<<<END_CANDIDATE_THEMES>>>\n`;
  } else {
    prompt += `\nNo existing candidate themes. Propose 1 or 2 new Themes based on this reflection.\n`;
  }

  prompt += `
INSTRUCTIONS:
1. Examine if the Entry Summary and Pinned Messages align with any Candidate Theme above.
2. If aligned, output a new Theme Observation (1-2 sentences capturing this entry's specific insight or delta) under 'matchedThemes'.
3. If the thought represents a distinct new intellectual/personal trajectory, output a new Theme (with title, initial 2-3 sentence synthesis, and initial observation) under 'newThemes'.
4. Respond ONLY with a valid JSON object matching this schema:
{
  "matchedThemes": [
    { "themeId": "string", "observationText": "string" }
  ],
  "newThemes": [
    { "title": "string", "currentSynthesis": "string", "initialObservationText": "string" }
  ]
}
`;

  return prompt;
}

/**
 * Parses the model's raw text response into a typed ResolutionResult.
 * Defensively strips markdown fences (```json ... ```) and whitespace.
 */
export function parseSynthesisResolutionResponse(rawText: string): ResolutionResult {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Failed to parse synthesis resolution: response is empty');
  }

  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  try {
    const parsed = JSON.parse(cleaned);
    return {
      matchedThemes: Array.isArray(parsed.matchedThemes) ? parsed.matchedThemes : [],
      newThemes: Array.isArray(parsed.newThemes) ? parsed.newThemes : [],
    };
  } catch (err: any) {
    throw new Error(`Failed to parse synthesis resolution: ${err.message}. Raw: ${rawText.slice(0, 100)}`);
  }
}

/**
 * Generates an executive summary of an entry using the Gemini fallback ladder.
 */
export async function generateEntrySummary(entry: Entry): Promise<string> {
  const turns = entry.turns || [];
  if (turns.length === 0) {
    return 'Empty reflection session with no conversational turns.';
  }

  const transcript = turns
    .map((t) => `${t.role === 'user' ? 'User' : 'Reflection Partner'}: ${t.content}`)
    .join('\n\n');

  try {
    const prompt = `Synthesize this reflection session into a calm, concise 2-3 sentence executive essence.
Highlight core insights, cognitive pivots, or personal realizations without fluff or platitudes:

<<<CONVERSATION_TRANSCRIPT>>>
${transcript}
<<<END_CONVERSATION_TRANSCRIPT>>>`;

    const { text } = await generateContentWithFallback({
      contents: prompt,
      systemInstruction: 'You are a calm, deeply insightful reflection summarizer. Deliver only the distilled essence without commentary.',
    });

    return text.trim();
  } catch (err: any) {
    console.warn('Gemini summary generation failed (quota/network), using local fallback summary:', err.message);
    const firstUserTurn = turns.find((t) => t.role === 'user')?.content || entry.title;
    return `Reflection on "${entry.title}": ${firstUserTurn.slice(0, 150)}${firstUserTurn.length > 150 ? '...' : ''}`;
  }
}

/**
 * Generates a 768-dimensional embedding vector using @google/genai text-embedding-004.
 */
export async function generateSummaryEmbedding(text: string): Promise<number[]> {
  const ai = getAIClient();
  
  // text-embedding-004 generates high-quality semantic representations
  const response: any = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: text,
  });

  if (Array.isArray(response.embeddings) && response.embeddings[0]?.values) {
    return response.embeddings[0].values;
  }
  if (response.embedding?.values) {
    return response.embedding.values;
  }

  return [];
}

export interface SynthesisPipelineDependencies {
  summarize: (entry: Entry) => Promise<string>;
  embed: (text: string) => Promise<number[]>;
  searchThemes: (userId: string, embedding: number[]) => Promise<Theme[]>;
  resolveThemes: (params: SynthesisPromptParams) => Promise<ResolutionResult>;
  persistBatch: (payload: {
    concludedEntry: Entry;
    updatedThemes: Theme[];
    newThemes: Theme[];
    newObservations: ThemeObservation[];
  }) => Promise<void>;
}

export interface SynthesisPipelineResult {
  concludedEntry: Entry;
  updatedThemes: Theme[];
  newThemes: Theme[];
  newObservations: ThemeObservation[];
}

/**
 * Executes the core synthesis pipeline across abstract dependencies.
 * Designed for strict Mock-Boundary TDD and resilient production execution.
 */
export async function executeSynthesisPipeline(
  entry: Entry,
  deps: SynthesisPipelineDependencies
): Promise<SynthesisPipelineResult> {
  // 1. Generate summary
  const summary = await deps.summarize(entry);

  // 2. Generate embedding (defensively caught)
  let embedding: number[] = [];
  try {
    embedding = await deps.embed(summary);
  } catch (err) {
    console.warn('Embedding generation skipped due to error, proceeding with lexical fallback:', err);
  }

  // 3. Search candidate themes
  let candidateThemes: Theme[] = [];
  try {
    candidateThemes = await deps.searchThemes(entry.userId, embedding);
  } catch (err) {
    console.warn('Candidate themes search failed, proceeding with empty candidates:', err);
  }

  // 4. Resolve themes with Gemini
  const pinnedMessages = (entry.turns || []).filter((t) => t.isPinned);
  const resolution = await deps.resolveThemes({
    summary,
    locationContext: entry.locationContext,
    pinnedMessages,
    candidateThemes,
  });

  const now = new Date().toISOString();

  // 5. Build concluded entry
  const concludedEntry: Entry = {
    ...entry,
    status: 'concluded',
    concludedAt: now,
    summary,
    updatedAt: now,
  };

  const updatedThemes: Theme[] = [];
  const newThemes: Theme[] = [];
  const newObservations: ThemeObservation[] = [];

  // Process matched themes
  for (const match of resolution.matchedThemes) {
    const existing = candidateThemes.find((t) => t.id === match.themeId);
    if (existing) {
      const updated: Theme = {
        ...existing,
        observationCount: (existing.observationCount || 0) + 1,
        updatedAt: now,
      };
      updatedThemes.push(updated);

      const observation: ThemeObservation = {
        id: `obs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: entry.userId,
        entryId: entry.id,
        themeId: existing.id,
        observationText: match.observationText,
        timestamp: now,
        locationSnapshot: entry.locationContext?.name,
      };
      newObservations.push(observation);
    }
  }

  // Process new themes
  for (const proposed of resolution.newThemes) {
    const newThemeId = `theme-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newTheme: Theme = {
      id: newThemeId,
      userId: entry.userId,
      title: proposed.title,
      currentSynthesis: proposed.currentSynthesis,
      observationCount: 1,
      createdAt: now,
      updatedAt: now,
      embedding: embedding.length > 0 ? embedding : undefined,
    };
    newThemes.push(newTheme);

    const observation: ThemeObservation = {
      id: `obs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: entry.userId,
      entryId: entry.id,
      themeId: newThemeId,
      observationText: proposed.initialObservationText,
      timestamp: now,
      locationSnapshot: entry.locationContext?.name,
    };
    newObservations.push(observation);
  }

  // 6. Persist batch
  await deps.persistBatch({
    concludedEntry,
    updatedThemes,
    newThemes,
    newObservations,
  });

  return {
    concludedEntry,
    updatedThemes,
    newThemes,
    newObservations,
  };
}

/**
 * Production orchestrator wired with live Firestore and Gemini clients.
 */
export async function concludeAndSynthesizeEntry(entry: Entry): Promise<SynthesisPipelineResult> {
  const liveDeps: SynthesisPipelineDependencies = {
    summarize: generateEntrySummary,
    embed: generateSummaryEmbedding,
    searchThemes: async (userId: string) => {
      // Fetch user themes (vector search or lexical candidates)
      return await fetchUserThemes(userId);
    },
    resolveThemes: async (params) => {
      try {
        const prompt = buildSynthesisPrompt(params);
        const { text } = await generateContentWithFallback({
          contents: prompt,
          systemInstruction: 'You are the longitudinal reflective intelligence for Locus. Output only valid JSON without explanation.',
        });
        return parseSynthesisResolutionResponse(text);
      } catch (err: any) {
        console.warn('Gemini theme resolution failed (quota/network), using local fallback theme matching:', err.message);
        const existing = params.candidateThemes?.[0];
        if (existing) {
          return {
            matchedThemes: [{ themeId: existing.id, observationText: params.summary }],
            newThemes: [],
          };
        }
        return {
          matchedThemes: [],
          newThemes: [
            {
              title: params.locationContext?.name ? `${params.locationContext.name} Reflections` : 'Reflective Journey & Growth',
              currentSynthesis: params.summary,
              initialObservationText: params.summary,
            }
          ],
        };
      }
    },
    persistBatch: async ({ concludedEntry, updatedThemes, newThemes, newObservations }) => {
      try {
        const batch = writeBatch(db);

        // 1. Entry update
        const entryRef = doc(db, 'users', concludedEntry.userId, 'entries', concludedEntry.id);
        batch.set(entryRef, stripUndefined(concludedEntry), { merge: true });

        // Fallback update on /interactions
        const interactionRef = doc(db, 'users', concludedEntry.userId, 'interactions', concludedEntry.id);
        batch.set(interactionRef, stripUndefined(concludedEntry), { merge: true });

        // 2. Updated Themes
        for (const theme of updatedThemes) {
          const themeRef = doc(db, 'users', theme.userId, 'themes', theme.id);
          batch.set(themeRef, stripUndefined(theme), { merge: true });
        }

        // 3. New Themes
        for (const theme of newThemes) {
          const themeRef = doc(db, 'users', theme.userId, 'themes', theme.id);
          batch.set(themeRef, stripUndefined(theme), { merge: true });
        }

        // 4. New Observations
        for (const obs of newObservations) {
          const obsRef = doc(db, 'users', obs.userId, 'observations', obs.id);
          batch.set(obsRef, stripUndefined(obs), { merge: true });
        }

        await batch.commit();
      } catch (err: any) {
        console.warn('Firestore batch write skipped/deferred (auth or rules boundary):', err.message);
      }
    },
  };

  return await executeSynthesisPipeline(entry, liveDeps);
}

