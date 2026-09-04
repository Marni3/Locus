import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Copy, 
  AlertCircle, 
  FileText, 
  Tag, 
  Compass, 
  Lightbulb, 
  ListChecks, 
  Flame,
  BookMarked,
  Smile,
  MoreVertical,
  Plus,
  PanelLeftOpen
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Interaction, InteractionTurn, ReflectionMode } from '../types';

interface SessionWorkspaceProps {
  interaction: Interaction;
  onUpdateInteraction: (updated: Interaction) => void;
  onOpenSummary: () => void;
  onOpenSaveNotebook: (excerpt: string) => void;
  isSaving: boolean;
  saveError: string | null;
  onRetrySave: () => void;
  onError: (msg: string) => void;
  categories: string[];
  customInstructions?: string;
  personaTone?: string;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const STANCES: { id: ReflectionMode; label: string; icon: any; desc: string }[] = [
  { id: 'reflect', label: 'Reflect', icon: Compass, desc: 'Mirror emotions & cognitive framing' },
  { id: 'brainstorm', label: 'Brainstorm', icon: Lightbulb, desc: 'Generate novel creative angles' },
  { id: 'actionable', label: 'Actionable', icon: ListChecks, desc: 'Distill crisp execution steps' },
  { id: 'mindful', label: 'Mindful', icon: Flame, desc: 'Grounding presence & calm pacing' },
];

const PRESET_MOODS = ['Calm', 'Reflective', 'Motivated', 'Overwhelmed', 'Grateful', 'Anxious', 'Energized', 'Tired'];

export const SessionWorkspace: React.FC<SessionWorkspaceProps> = ({
  interaction,
  onUpdateInteraction,
  onOpenSummary,
  onOpenSaveNotebook,
  isSaving,
  saveError,
  onRetrySave,
  onError,
  categories,
  customInstructions,
  personaTone,
  isSidebarOpen = true,
  onToggleSidebar,
}) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState(interaction.title);
  const [category, setCategory] = useState(interaction.category);
  const [mood, setMood] = useState(interaction.mood || '');
  const [mode, setMode] = useState<ReflectionMode>(interaction.mode || 'reflect');
  const [copiedTurnId, setCopiedTurnId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state when active interaction changes
  useEffect(() => {
    setTitle(interaction.title);
    setCategory(interaction.category);
    setMood(interaction.mood || '');
    setMode(interaction.mode || 'reflect');
    setInputText('');
  }, [interaction.id]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interaction.turns, isGenerating]);

  const handleTitleBlur = () => {
    if (title.trim() !== interaction.title) {
      onUpdateInteraction({
        ...interaction,
        title: title.trim() || 'Untitled Reflection',
      });
    }
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    onUpdateInteraction({
      ...interaction,
      category: newCat,
    });
  };

  const handleMoodSelect = (selectedMood: string) => {
    const nextMood = mood === selectedMood ? '' : selectedMood;
    setMood(nextMood);
    onUpdateInteraction({
      ...interaction,
      mood: nextMood || undefined,
    });
  };

  const handleModeChange = (newMode: ReflectionMode) => {
    setMode(newMode);
    onUpdateInteraction({
      ...interaction,
      mode: newMode,
    });
  };

  // Submit new reflection turn to server
  const handleSendMessage = async () => {
    if (!inputText.trim() || isGenerating) return;

    const userPrompt = inputText.trim();
    setInputText('');

    const nowIso = new Date().toISOString();
    const newTurn: InteractionTurn = {
      id: 'turn-' + Date.now(),
      entryId: interaction.id,
      role: 'user',
      content: userPrompt,
      timestamp: nowIso,
      createdAt: nowIso,
    };

    const updatedTurns = [...(interaction.turns || []), newTurn];
    
    // Auto-update title if it's still default
    let newTitle = interaction.title;
    if (interaction.title === 'New Reflection' || interaction.title === 'Untitled Reflection') {
      newTitle = userPrompt.slice(0, 38) + (userPrompt.length > 38 ? '...' : '');
      setTitle(newTitle);
    }

    const nextInteraction: Interaction = {
      ...interaction,
      title: newTitle,
      category,
      mood: mood || undefined,
      mode,
      turns: updatedTurns,
      updatedAt: new Date().toISOString(),
    };

    // Optimistically persist the user turn
    onUpdateInteraction(nextInteraction);

    // Call server Gemini route
    try {
      setIsGenerating(true);
      const response = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: updatedTurns.map((t) => ({
            role: t.role,
            content: t.content,
          })),
          mode,
          category,
          mood: mood || undefined,
          customInstructions,
          personaTone,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Reflection generation failed with status ${response.status}`);
      }

      const data = await response.json();
      const modelContent = data.response;

      const modelTimestamp = new Date().toISOString();
      const modelTurn: InteractionTurn = {
        id: 'turn-' + (Date.now() + 1),
        entryId: interaction.id,
        role: 'model',
        content: modelContent,
        timestamp: modelTimestamp,
        createdAt: modelTimestamp,
      };

      const finalInteraction: Interaction = {
        ...nextInteraction,
        turns: [...updatedTurns, modelTurn],
        updatedAt: new Date().toISOString(),
      };

      onUpdateInteraction(finalInteraction);
    } catch (err: any) {
      console.error('Reflection request error:', err);
      onError(err.message || 'Could not reach reflection service. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTurnId(id);
    setTimeout(() => setCopiedTurnId(null), 2000);
  };

  const turns = interaction.turns || [];

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-61px)] bg-[#FDFBF7] overflow-hidden">
      {/* Workspace Header */}
      <div className="px-4 sm:px-6 py-3.5 bg-white border-b border-stone-200 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && onToggleSidebar && (
              <button
                id="workspace-show-sidebar-btn"
                onClick={onToggleSidebar}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200/80 rounded-lg border border-stone-200 transition-all cursor-pointer shadow-2xs shrink-0"
                title="Show reflections sidebar (Ctrl+B / ⌘B)"
                aria-label="Show reflections sidebar"
              >
                <PanelLeftOpen className="w-4 h-4 text-emerald-800" />
                <span className="hidden sm:inline">Reflections</span>
              </button>
            )}

            <input
              id="workspace-session-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="font-serif-heading text-lg sm:text-xl font-bold text-stone-900 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-emerald-700 focus:outline-none transition-colors w-full truncate"
              placeholder="Name this reflection session..."
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs text-stone-500">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3 text-stone-400" />
              <select
                id="workspace-category-select"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="bg-[#F9F7F2] border border-stone-200 rounded-md px-2 py-0.5 text-xs text-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Mood selector pill dropdown */}
            <div className="flex items-center gap-1">
              <Smile className="w-3 h-3 text-stone-400" />
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                onBlur={() => onUpdateInteraction({ ...interaction, mood: mood || undefined })}
                className="bg-[#F9F7F2] border border-stone-200 rounded-md px-2 py-0.5 text-xs text-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
              >
                <option value="">Mood: Not specified</option>
                {PRESET_MOODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Save Status Indicator */}
            <div className="flex items-center gap-1.5 ml-auto md:ml-2">
              {isSaving ? (
                <span className="flex items-center gap-1 text-[11px] text-stone-500">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin text-emerald-800" />
                  <span>Saving to Firestore...</span>
                </span>
              ) : saveError ? (
                <button
                  onClick={onRetrySave}
                  className="flex items-center gap-1 text-[11px] text-rose-600 hover:underline cursor-pointer"
                  title={saveError}
                >
                  <AlertCircle className="w-3 h-3" />
                  <span>Save failed (Retry)</span>
                </button>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
                  <Check className="w-3 h-3" />
                  <span>Saved</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Header Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="workspace-summary-drawer-btn"
            onClick={onOpenSummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200/80 rounded-lg transition-colors cursor-pointer"
            title="Generate structured session takeaways and summary"
          >
            <FileText className="w-3.5 h-3.5 text-stone-500" />
            <span>Summary &amp; Insights</span>
          </button>
        </div>
      </div>

      {/* Stance Selector Banner */}
      <div className="px-6 py-2 bg-[#F9F7F2] border-b border-stone-200 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider shrink-0">
          Mode:
        </span>
        {STANCES.map((st) => {
          const Icon = st.icon;
          const isActive = mode === st.id;
          return (
            <button
              key={st.id}
              onClick={() => handleModeChange(st.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-900 text-white shadow-2xs font-semibold'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
              title={st.desc}
            >
              <Icon className="w-3 h-3" />
              <span>{st.label}</span>
            </button>
          );
        })}
      </div>

      {/* Center Reflection Turns Scrollable Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
        {turns.length === 0 ? (
          <div className="max-w-xl mx-auto py-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif-heading text-xl font-bold text-stone-900">
                Begin your reflection
              </h3>
              <p className="text-sm text-stone-500 mt-1.5 leading-relaxed font-sans">
                Write down what's on your mind. Explore a challenge, reflect on a recent decision, or unpack your day.
              </p>
            </div>

            {/* Prompt Starter Pills */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {[
                'What made today feel productive or draining?',
                'I am torn between two choices and want to weigh trade-offs.',
                'Help me unpack why I am feeling hesitant about this goal.',
                'I want to express gratitude for three specific moments today.',
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(prompt)}
                  className="p-3 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 leading-snug transition-all text-left shadow-2xs cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={`mx-auto space-y-6 transition-all duration-300 ${isSidebarOpen ? 'max-w-3xl' : 'max-w-4xl'}`}>
            {turns.map((turn, idx) => {
              const isUser = turn.role === 'user';

              return (
                <div
                  key={turn.id || idx}
                  id={`turn-${turn.id || idx}`}
                  className={`group relative flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  {/* Turn Card */}
                  <div
                    className={`rounded-2xl p-5 shadow-2xs transition-all ${
                      isSidebarOpen ? 'max-w-2xl' : 'max-w-3xl'
                    } ${
                      isUser
                        ? 'bg-stone-900 text-stone-100 rounded-br-xs'
                        : 'bg-white border border-stone-200 text-stone-900 rounded-bl-xs'
                    }`}
                  >
                    {/* Role Header */}
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase">
                        {isUser ? (
                          <span className="text-emerald-300">You &bull; Reflection</span>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-800">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>ReflectAI Companion</span>
                          </div>
                        )}
                      </div>

                      <span className={`text-[10px] ${isUser ? 'text-stone-400' : 'text-stone-400'}`}>
                        {new Date(turn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Turn Content */}
                    {isUser ? (
                      <p className="text-sm font-sans whitespace-pre-wrap leading-relaxed">
                        {turn.content}
                      </p>
                    ) : (
                      <div className="text-sm font-serif leading-relaxed text-stone-800 space-y-2">
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => <h3 className="font-serif-heading font-bold text-base text-stone-900 mt-2 mb-1">{children}</h3>,
                            h2: ({ children }) => <h4 className="font-serif-heading font-bold text-sm text-stone-900 mt-2 mb-1">{children}</h4>,
                            h3: ({ children }) => <h5 className="font-serif-heading font-bold text-sm text-stone-900 mt-2 mb-1">{children}</h5>,
                            p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                            blockquote: ({ children }) => <blockquote className="border-l-2 border-emerald-800 pl-3 italic text-stone-600 my-2">{children}</blockquote>,
                            strong: ({ children }) => <strong className="font-semibold text-stone-900">{children}</strong>,
                          }}
                        >
                          {turn.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Actions on Assistant turns: Copy & Bookmark to Notebook */}
                    {!isUser && (
                      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-end gap-2 text-stone-400">
                        <button
                          onClick={() => onOpenSaveNotebook(turn.content)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-stone-600 hover:text-emerald-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                          title="Save this excerpt to your Notebook"
                        >
                          <BookMarked className="w-3.5 h-3.5 text-emerald-800" />
                          <span className="text-[11px] font-medium">Save to Notebook</span>
                        </button>

                        <button
                          onClick={() => handleCopyText(turn.id, turn.content)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                          title="Copy response"
                        >
                          {copiedTurnId === turn.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* In-Flight Thinking Indicator */}
            {isGenerating && (
              <div className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-emerald-800 shadow-2xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-xs p-4 shadow-2xs space-y-2 max-w-sm">
                  <div className="h-2.5 bg-stone-200 rounded-full w-48" />
                  <div className="h-2.5 bg-stone-200 rounded-full w-32" />
                  <span className="text-[11px] text-stone-500 font-sans italic">
                    Synthesizing reflection...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Composer Bar */}
      <div className="p-4 sm:p-6 bg-white border-t border-stone-200 shrink-0">
        <div className={`mx-auto space-y-2 transition-all duration-300 ${isSidebarOpen ? 'max-w-3xl' : 'max-w-4xl'}`}>
          <div className="relative bg-[#FDFBF7] rounded-2xl border border-stone-200 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20 transition-all p-3 shadow-2xs">
            <textarea
              ref={textareaRef}
              id="workspace-prompt-textarea"
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Reflect on your thoughts, ask for clarity, or brainstorm next steps..."
              className="w-full bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none resize-none font-sans leading-relaxed"
              disabled={isGenerating}
            />

            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <span className="text-[11px] text-stone-400 hidden sm:inline">
                Shift + Enter for new line
              </span>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  id="workspace-send-button"
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isGenerating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Reflecting...</span>
                    </>
                  ) : (
                    <>
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
