import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// 1. Top-Level Request Deserialization (Ordering Guarantee)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Lazy initialization of GoogleGenAI SDK to prevent startup crashes if key is pending
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY environment variable is not configured.');
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || '' });
  }
  return aiClient;
}

// 2. Resilient Model Fallback Ladder
const MODEL_FALLBACK_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
  'gemini-2.5-flash'
];

interface FallbackOptions {
  systemInstruction?: string;
  temperature?: number;
  contents: any[];
}

/**
 * Standard Helper: Attempts content generation across the model fallback ladder.
 */
async function generateContentWithFallback(options: FallbackOptions): Promise<{ text: string; modelUsed: string }> {
  const ai = getAIClient();
  let lastError: any = null;

  for (const modelName of MODEL_FALLBACK_LADDER) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: options.contents,
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
      // Recoverable error checks (503, 429, 404, 500, etc.) -> Continue to next ladder model
      continue;
    }
  }

  throw new Error(`All Gemini models in fallback ladder failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

// 3. API Routes

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY)
  });
});

/**
 * Handler for multi-turn reflection
 */
const handleReflectRequest = async (req: Request, res: Response) => {
  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const rawConversation = Array.isArray(body.history) ? body.history : (Array.isArray(body.conversation) ? body.conversation : []);
    const mode = typeof body.mode === 'string' ? body.mode : 'reflect';
    const category = typeof body.category === 'string' ? body.category : 'Personal';
    const title = typeof body.title === 'string' ? body.title : 'Reflection Session';
    const customInstructions = typeof body.customInstructions === 'string' ? body.customInstructions : '';
    const personaTone = typeof body.personaTone === 'string' ? body.personaTone : 'Warm';

    if (rawConversation.length === 0) {
      return res.status(400).json({ error: 'Conversation or history array must not be empty.' });
    }

    let modeInstruction = '';
    switch (mode) {
      case 'brainstorm':
        modeInstruction = `You are a creative brainstorming facilitator. Help the user expand possibilities, identify novel angles, explore unexpected connections, and organize ideas into inspiring categories or actionable sparks.`;
        break;
      case 'actionable':
        modeInstruction = `You are an executive action architect. Help translate the user's thoughts and dilemmas into structured milestones, pragmatic next steps, risk mitigations, and immediate 24-hour micro-actions.`;
        break;
      case 'mindful':
        modeInstruction = `You are an empathetic, calm, and grounded mindfulness mentor. Provide non-judgmental validation, gentle cognitive reframing, emotional spaciousness, and grounding inquiries.`;
        break;
      case 'reflect':
      default:
        modeInstruction = `You are ReflectAI, an insightful, warm, and thoughtful journal companion. Mirror back key emotional truths, ask 1-2 penetrating reflective questions to deepen awareness, and highlight subtle growth patterns in their entry.`;
        break;
    }

    let toneInstruction = '';
    switch (personaTone) {
      case 'Direct':
        toneInstruction = 'Tone: Direct, strategic, crisp, and concise.';
        break;
      case 'Reflective':
        toneInstruction = 'Tone: Probing, deeply philosophical, and reflective.';
        break;
      case 'Mindful':
        toneInstruction = 'Tone: Gentle, spacious, compassionate, and present.';
        break;
      case 'Playful':
        toneInstruction = 'Tone: Playful, creative, light-hearted, and inspiring.';
        break;
      case 'Warm':
      default:
        toneInstruction = 'Tone: Warm, empathic, validating, and supportive.';
        break;
    }

    const systemInstruction = `${modeInstruction}
${toneInstruction}
${customInstructions ? `User Custom Instructions: "${customInstructions}"` : ''}
Focus area/Category: "${category}". Session Title: "${title}".
Guidelines:
- Format your response with beautiful Markdown: bold key insights, use clear paragraphs, and use elegant bullet lists when organizing thoughts.
- Be concise yet deeply thoughtful (2-4 paragraphs typically, never overly verbose or shallow).
- Avoid generic cliches ("I understand how you feel"). Instead, speak directly to the specific nuances of what they shared.`;

    // Map conversation turns to Gemini contents format
    const contents = rawConversation.map((turn: { role: string; content: string }) => ({
      role: turn.role === 'model' || turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(turn.content || '') }]
    }));

    const result = await generateContentWithFallback({
      systemInstruction,
      contents,
      temperature: mode === 'brainstorm' ? 0.9 : 0.7
    });

    return res.json({
      response: result.text,
      reply: result.text,
      modelUsed: result.modelUsed
    });
  } catch (error: any) {
    console.error('Error in reflect endpoint:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error processing AI reflection.'
    });
  }
};

app.post('/api/reflect', handleReflectRequest);
app.post('/api/gemini/reflect', handleReflectRequest);

/**
 * POST /api/notebook/context-hint
 * Generates a 1-sentence analytical context note for a saved excerpt
 */
app.post('/api/notebook/context-hint', async (req: Request, res: Response) => {
  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const excerpt = typeof body.excerpt === 'string' ? body.excerpt : '';
    const sourceTitle = typeof body.sourceTitle === 'string' ? body.sourceTitle : 'Reflection';
    const category = typeof body.category === 'string' ? body.category : 'General';

    if (!excerpt.trim()) {
      return res.status(400).json({ error: 'Excerpt text is required.' });
    }

    const prompt = `Here is a saved excerpt from a user's journal reflection titled "${sourceTitle}" (${category}):
"${excerpt}"

Write a single, concise (maximum 15 words) analytical context note explaining why this insight or realization is valuable. Do not use quotes or introductory fluff.`;

    const result = await generateContentWithFallback({
      systemInstruction: 'You are an insightful summarizer. Provide a crisp 1-sentence analytical takeaway.',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      temperature: 0.3
    });

    return res.json({
      contextHint: result.text.trim(),
      modelUsed: result.modelUsed
    });
  } catch (error: any) {
    console.error('Error in /api/notebook/context-hint:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error generating context hint.'
    });
  }
});


/**
 * POST /api/gemini/summarize
 * Generates an executive summary and key takeaways for a session or collection of reflections
 */
app.post('/api/gemini/summarize', async (req: Request, res: Response) => {
  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const turns = Array.isArray(body.turns) ? body.turns : [];
    const title = typeof body.title === 'string' ? body.title : 'Session';
    const category = typeof body.category === 'string' ? body.category : 'General';

    if (turns.length === 0) {
      return res.status(400).json({ error: 'No interaction turns provided for summarization.' });
    }

    const transcript = turns
      .map((t: any) => `${t.role === 'user' ? 'User Reflection' : 'Gemini Feedback'}:\n${t.content}`)
      .join('\n\n---\n\n');

    const prompt = `Analyze this journaling session titled "${title}" (Category: ${category}):

${transcript}

Provide:
1. A concise 2-sentence **Executive Synthesis** capturing the core emotional or strategic essence of the reflection.
2. 3-4 bulleted **Key Takeaways & Insights**.
3. 2 **Suggested Forward Inquiries** (deep questions for the user's next reflection).

Format with crisp Markdown headers.`;

    const result = await generateContentWithFallback({
      systemInstruction: 'You are an expert executive coach and psychological reflection analyst. Provide clear, structured, and compassionate summaries.',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      temperature: 0.5
    });

    return res.json({
      summary: result.text,
      modelUsed: result.modelUsed
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/summarize:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error generating summary.'
    });
  }
});

/**
 * POST /api/gemini/synthesis
 * Synthesizes cross-session patterns across multiple past journal entries
 */
app.post('/api/gemini/synthesis', async (req: Request, res: Response) => {
  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const entries = Array.isArray(body.entries) ? body.entries : [];

    if (entries.length === 0) {
      return res.status(400).json({ error: 'No entries provided for pattern synthesis.' });
    }

    const compiledHistory = entries
      .slice(0, 15) // Top 15 recent entries
      .map((e: any, index: number) => {
        const firstTurn = e.turns?.[0]?.content || '';
        return `[Entry #${index + 1} | Date: ${e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'N/A'} | Title: ${e.title} | Category: ${e.category} | Mood: ${e.mood || 'Unspecified'}]\nFirst thought: ${firstTurn.slice(0, 300)}...`;
      })
      .join('\n\n');

    const prompt = `Here are the user's recent journal & reflection session logs:

${compiledHistory}

Please perform a multi-session synthesis:
1. **Recurring Themes & Focus Areas**: What topics or mental states appear most frequently?
2. **Growth Trajectory & Positive Shifts**: Where is the user showing development, insight, or resilience?
3. **Potential Blindspots or Cognitive Habits**: Gentle observations of recurring friction points or unexamined assumptions.
4. **Recommended Habit or Reflection Prompt**: One tailor-made prompt for their next journal session.

Format with elegant, inspiring Markdown with clean headings and bullet points.`;

    const result = await generateContentWithFallback({
      systemInstruction: 'You are ReflectAI Master Synthesis Coach. Analyze longitudinal journal patterns with extreme empathy, high emotional intelligence, and structural clarity.',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      temperature: 0.6
    });

    return res.json({
      synthesis: result.text,
      modelUsed: result.modelUsed
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/synthesis:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error generating pattern synthesis.'
    });
  }
});

// 4. Vite Middleware / Static Serving Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReflectAI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
