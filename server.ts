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

// 2. Resilient Model Fallback Ladder & Gemini Client
import { generateContentWithFallback, getAIClient, MODEL_FALLBACK_LADDER } from './src/services/gemini';
import { concludeAndSynthesizeEntry } from './src/services/synthesis';
import { fetchUserEntries, saveEntryToFirestore } from './src/lib/firebase';
import { unpackThemeFurther } from './src/integrations/unpack';
import { resolveGpsCoordinates, resolvePlaceQuery } from './src/integrations/geocoding';
import { validateWebhookUrl } from './src/integrations/notifications';

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

/**
 * POST /api/entries/:id/conclude
 * Concludes an active reflection entry and triggers synchronous synthesis pipeline
 */
app.post('/api/entries/:id/conclude', async (req: Request, res: Response) => {
  try {
    const entryId = req.params.id;
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const entry = body.entry;

    if (!entry) {
      return res.status(400).json({ error: 'Missing entry payload in request body' });
    }

    entry.id = entryId;
    const result = await concludeAndSynthesizeEntry(entry);
    return res.json({ success: true, result });
  } catch (error: any) {
    console.error('Error in /api/entries/:id/conclude:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error concluding entry.'
    });
  }
});

/**
 * PATCH /api/entries/:id/messages/:messageId
 * Toggles message pinning and updates user notes
 */
app.patch('/api/entries/:id/messages/:messageId', async (req: Request, res: Response) => {
  try {
    const { id: entryId, messageId } = req.params;
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const { userId, isPinned, note } = body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing required userId' });
    }

    // Persist to Firestore if entry exists
    try {
      const entries = await fetchUserEntries(userId);
      const existingEntry = entries.find((e) => e.id === entryId);

      if (existingEntry && Array.isArray(existingEntry.turns)) {
        const turnIndex = existingEntry.turns.findIndex((t) => t.id === messageId);
        if (turnIndex !== -1) {
          if (typeof isPinned === 'boolean') {
            existingEntry.turns[turnIndex].isPinned = isPinned;
          }
          if (typeof note === 'string') {
            existingEntry.turns[turnIndex].note = note;
          }
          await saveEntryToFirestore(userId, existingEntry);
        }
      }
    } catch (fsErr) {
      console.warn('Firestore update in message patch failed (fallback mode active):', fsErr);
    }

    return res.json({
      success: true,
      updated: {
        id: messageId,
        entryId,
        isPinned: typeof isPinned === 'boolean' ? isPinned : undefined,
        note: typeof note === 'string' ? note : undefined,
      }
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/entries/:id/messages/:messageId:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error updating message.'
    });
  }
});

/**
 * POST /api/themes/:id/unpack
 * Unpacks a Theme with >= 2 observations into an evolutionary thesis, narrative, and exploration paths
 */
app.post('/api/themes/:id/unpack', async (req: Request, res: Response) => {
  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const theme = body.theme;
    const observations = Array.isArray(body.observations) ? body.observations : [];

    if (!theme) {
      return res.status(400).json({ error: 'Theme object is required.' });
    }

    if (observations.length < 2) {
      return res.status(400).json({
        error: `Theme requires at least 2 observations to unpack evolutionary patterns (found ${observations.length}).`
      });
    }

    const result = await unpackThemeFurther(theme, observations);
    return res.json({
      success: true,
      unpackResult: result,
    });
  } catch (error: any) {
    console.error('Error in /api/themes/:id/unpack:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error unpacking theme.'
    });
  }
});

/**
 * POST /api/location/resolve-gps
 * Reverse geocodes device GPS coordinates into a place name with coordinate minimization
 */
app.post('/api/location/resolve-gps', async (req: Request, res: Response) => {
  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const lat = typeof body.latitude === 'number' ? body.latitude : NaN;
    const lng = typeof body.longitude === 'number' ? body.longitude : NaN;
    const storeCoordinates = Boolean(body.storeCoordinates);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Valid latitude and longitude numbers are required.' });
    }

    const result = await resolveGpsCoordinates(lat, lng, storeCoordinates);
    return res.json({
      success: true,
      location: result,
    });
  } catch (error: any) {
    console.error('Error in /api/location/resolve-gps:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error resolving coordinates.'
    });
  }
});

/**
 * POST /api/location/resolve-query
 * Forward geocodes text query to standardized place, or falls back to custom place tag
 */
app.post('/api/location/resolve-query', async (req: Request, res: Response) => {
  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const query = typeof body.query === 'string' ? body.query : '';
    const storeCoordinates = Boolean(body.storeCoordinates);

    if (!query.trim()) {
      return res.status(400).json({ error: 'Location query string is required.' });
    }

    const result = await resolvePlaceQuery(query, storeCoordinates);
    return res.json({
      success: true,
      location: result,
    });
  } catch (error: any) {
    console.error('Error in /api/location/resolve-query:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error resolving place query.'
    });
  }
});

/**
 * POST /api/notifications/test-webhook
 * Tests a webhook URL with SSRF validation at save time
 */
app.post('/api/notifications/test-webhook', async (req: Request, res: Response) => {
  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const webhookUrl = typeof body.webhookUrl === 'string' ? body.webhookUrl : '';

    if (!webhookUrl.trim()) {
      return res.status(400).json({ error: 'Webhook URL is required.' });
    }

    const validation = await validateWebhookUrl(webhookUrl);
    return res.json({
      success: validation.isValid,
      isValid: validation.isValid,
      error: validation.error,
    });
  } catch (error: any) {
    console.error('Error in /api/notifications/test-webhook:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error validating webhook URL.'
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
