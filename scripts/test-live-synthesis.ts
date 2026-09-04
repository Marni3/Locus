import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';
import { MODEL_FALLBACK_LADDER } from '../src/services/gemini';
import { buildSynthesisPrompt, parseSynthesisResolutionResponse } from '../src/services/synthesis';
import { Theme } from '../src/types';

interface TestRecord {
  feature: string;
  prompt: string;
  systemInstruction?: string;
  verbatimResponse: string;
  modelUsed: string;
  latencyMs: number;
  tokens: {
    promptTokens?: number;
    candidatesTokens?: number;
    totalTokens?: number;
  };
  status: 'SUCCESS' | 'FAILED';
  notes?: string;
}

async function runLiveEvaluation() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY is missing in .env file.');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  const records: TestRecord[] = [];

  console.log('=== Starting Live Gemini API Evaluation Suite ===\n');

  // -------------------------------------------------------------
  // Test 1: Reflection Companion Interaction (/api/reflect)
  // -------------------------------------------------------------
  console.log('Running Test 1: Reflection Turn Generation...');
  const test1SystemInstruction = `You are ReflectAI, an empathetic, calm, and intellectually rigorous reflection companion.
Your stance is: REFLECT (Mirror emotions & cognitive framing).
You are holding a private, mindful thinking space for the user.
- Empathize with depth and intellectual clarity.
- Frame recurring mental models and underlying tensions.
- Format your response with beautiful Markdown: bold key insights, use clear paragraphs, and use elegant bullet lists when organizing thoughts.
- Be concise yet deeply thoughtful (2-3 paragraphs typically, never overly verbose or shallow).
- Avoid generic cliches. Speak directly to the specific nuances of what they shared.`;

  const test1UserPrompt = `I feel torn between working on our core architecture refactoring and shipping fast prototypes for user validation. When I work on architecture, I feel guilty about speed; when I prototype quickly, I worry about tech debt.`;

  const test1StartTime = Date.now();
  let test1Record: TestRecord = {
    feature: 'Reflection Companion (/api/reflect)',
    prompt: test1UserPrompt,
    systemInstruction: test1SystemInstruction,
    verbatimResponse: '',
    modelUsed: '',
    latencyMs: 0,
    tokens: {},
    status: 'FAILED',
  };

  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      const response: any = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: test1UserPrompt }] }],
        config: {
          systemInstruction: test1SystemInstruction,
          temperature: 0.7,
        },
      });
      const latency = Date.now() - test1StartTime;
      const text = response.text || '';
      const usage = response.usageMetadata || {};

      test1Record = {
        ...test1Record,
        verbatimResponse: text,
        modelUsed: model,
        latencyMs: latency,
        tokens: {
          promptTokens: usage.promptTokenCount,
          candidatesTokens: usage.candidatesTokenCount,
          totalTokens: usage.totalTokenCount,
        },
        status: 'SUCCESS',
        notes: `Successfully generated via model ladder priority: ${model}`,
      };
      break;
    } catch (err: any) {
      console.warn(`Test 1: Model ${model} failed: ${err.message}`);
    }
  }
  records.push(test1Record);
  console.log(`Test 1 completed in ${test1Record.latencyMs}ms with status: ${test1Record.status}\n`);

  // Small pause to prevent burst rate limiting
  await new Promise((r) => setTimeout(r, 400));

  // -------------------------------------------------------------
  // Test 2: Entry Summary Distillation (generateEntrySummary)
  // -------------------------------------------------------------
  console.log('Running Test 2: Entry Summary Distillation...');
  const test2Transcript = `[User]: ${test1UserPrompt}\n\n[Companion]: ${test1Record.verbatimResponse || 'Reflected on speed vs architecture balance.'}`;
  const test2SystemInstruction = 'You are a calm, deeply insightful reflection summarizer. Deliver only the distilled essence without commentary.';
  const test2Prompt = `You are an expert personal reflection synthesizer.
Analyze the following completed reflective conversation and produce a concise 2-3 sentence synthesis capturing:
1. The user's core dilemma, emotional anchor, or realization.
2. The key insight or resolution articulated.

<<<CONVERSATION_TRANSCRIPT>>>
${test2Transcript}
<<<END_CONVERSATION_TRANSCRIPT>>>`;

  const test2StartTime = Date.now();
  let test2Record: TestRecord = {
    feature: 'Entry Summary Distillation (generateEntrySummary)',
    prompt: test2Prompt,
    systemInstruction: test2SystemInstruction,
    verbatimResponse: '',
    modelUsed: '',
    latencyMs: 0,
    tokens: {},
    status: 'FAILED',
  };

  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      const response: any = await ai.models.generateContent({
        model,
        contents: [test2Prompt],
        config: {
          systemInstruction: test2SystemInstruction,
          temperature: 0.3,
        },
      });
      const latency = Date.now() - test2StartTime;
      const text = response.text || '';
      const usage = response.usageMetadata || {};

      test2Record = {
        ...test2Record,
        verbatimResponse: text,
        modelUsed: model,
        latencyMs: latency,
        tokens: {
          promptTokens: usage.promptTokenCount,
          candidatesTokens: usage.candidatesTokenCount,
          totalTokens: usage.totalTokenCount,
        },
        status: 'SUCCESS',
        notes: `Distilled rolling summary via ${model}`,
      };
      break;
    } catch (err: any) {
      console.warn(`Test 2: Model ${model} failed: ${err.message}`);
    }
  }
  records.push(test2Record);
  console.log(`Test 2 completed in ${test2Record.latencyMs}ms with status: ${test2Record.status}\n`);

  // Small pause
  await new Promise((r) => setTimeout(r, 400));

  // -------------------------------------------------------------
  // Test 3: Embedding Generation Probe (generateSummaryEmbedding)
  // -------------------------------------------------------------
  console.log('Running Test 3: Embedding Generation Probe...');
  const test3Text = test2Record.verbatimResponse || 'Balancing architectural rigor and velocity.';
  const candidateEmbeddingModels = ['gemini-embedding-001', 'gemini-embedding-2'];
  let test3Record: TestRecord = {
    feature: 'Vector Embedding (generateSummaryEmbedding)',
    prompt: `Text to embed: "${test3Text}"`,
    verbatimResponse: '',
    modelUsed: '',
    latencyMs: 0,
    tokens: {},
    status: 'FAILED',
  };

  const test3StartTime = Date.now();
  for (const embModel of candidateEmbeddingModels) {
    try {
      const embRes: any = await ai.models.embedContent({
        model: embModel,
        contents: test3Text,
      });
      const latency = Date.now() - test3StartTime;
      const values = embRes.embeddings?.[0]?.values || embRes.embedding?.values || [];

      test3Record = {
        ...test3Record,
        verbatimResponse: `Vector generated: ${values.length} dimensions. Sample: [${values.slice(0, 5).join(', ')}...]`,
        modelUsed: embModel,
        latencyMs: latency,
        tokens: {},
        status: 'SUCCESS',
        notes: `Validated working embedding model: ${embModel}`,
      };
      break;
    } catch (err: any) {
      console.warn(`Test 3: Embedding model ${embModel} failed: ${err.message}`);
      test3Record.notes = `Error on ${embModel}: ${err.message}`;
    }
  }
  records.push(test3Record);
  console.log(`Test 3 completed in ${test3Record.latencyMs}ms with status: ${test3Record.status}\n`);

  // Small pause
  await new Promise((r) => setTimeout(r, 400));

  // -------------------------------------------------------------
  // Test 4: Longitudinal Theme Resolution Prompt
  // -------------------------------------------------------------
  console.log('Running Test 4: Theme Resolution Prompt (JSON output)...');
  const candidateThemes: Theme[] = [
    {
      id: 'theme-1',
      userId: 'test-user',
      title: 'Technical Debt vs Velocity Tension',
      currentSynthesis: 'The user frequently balances speed of shipping against software architectural integrity, experiencing guilt when choosing prototyping over refactoring.',
      observationCount: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'theme-2',
      userId: 'test-user',
      title: 'Mindful Leadership & Cognitive Pacing',
      currentSynthesis: 'Explores emotional resilience, self-compassion, and resisting urgency traps in high-stakes environments.',
      observationCount: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const test4Prompt = buildSynthesisPrompt({
    summary: test2Record.verbatimResponse || 'Dilemma of refactoring vs prototyping.',
    candidateThemes,
  });
  const test4StartTime = Date.now();
  let test4Record: TestRecord = {
    feature: 'Longitudinal Theme Resolution (buildSynthesisPrompt)',
    prompt: test4Prompt,
    systemInstruction: 'You are an objective intellectual taxonomy specialist. Respond exclusively with valid JSON matching the requested schema.',
    verbatimResponse: '',
    modelUsed: '',
    latencyMs: 0,
    tokens: {},
    status: 'FAILED',
  };

  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      const response: any = await ai.models.generateContent({
        model,
        contents: [test4Prompt],
        config: {
          systemInstruction: 'You are an objective intellectual taxonomy specialist. Respond exclusively with valid JSON matching the requested schema.',
          temperature: 0.2,
        },
      });
      const latency = Date.now() - test4StartTime;
      const text = response.text || '';
      const usage = response.usageMetadata || {};

      const parsed = parseSynthesisResolutionResponse(text);

      const matchedCount = parsed.matchedThemes.length;
      const newCount = parsed.newThemes.length;
      test4Record = {
        ...test4Record,
        verbatimResponse: text,
        modelUsed: model,
        latencyMs: latency,
        tokens: {
          promptTokens: usage.promptTokenCount,
          candidatesTokens: usage.candidatesTokenCount,
          totalTokens: usage.totalTokenCount,
        },
        status: 'SUCCESS',
        notes: `JSON parsed successfully: ${matchedCount} matched theme(s), ${newCount} new theme(s) proposed.`,
      };
      break;
    } catch (err: any) {
      console.warn(`Test 4: Model ${model} failed: ${err.message}`);
    }
  }
  records.push(test4Record);
  console.log(`Test 4 completed in ${test4Record.latencyMs}ms with status: ${test4Record.status}\n`);

  // Print Summary JSON to console
  console.log('=== EVALUATION SUMMARY ===');
  console.log(JSON.stringify(records, null, 2));
}

runLiveEvaluation().catch((err) => {
  console.error('Fatal evaluation script error:', err);
  process.exit(1);
});
