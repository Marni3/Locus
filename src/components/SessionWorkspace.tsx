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
  PanelLeftOpen,
  Pin,
  Clock,
  CheckCircle2,
  StickyNote,
  MapPin,
  Navigation,
  Search,
  X,
  Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Interaction, InteractionTurn, ReflectionMode } from '../types';
import { getRemainingActiveMs, formatRemainingTime } from '../services/concludeEngine';

interface SessionWorkspaceProps {
  interaction: Interaction;
  onUpdateInteraction: (updated: Interaction) => void;
  onConcludeEntry?: (entry: Interaction) => Promise<void>;
  onNewSession?: () => void;
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
  onConcludeEntry,
  onNewSession,
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
  const [isConcluding, setIsConcluding] = useState(false);
  const [remainingTimeText, setRemainingTimeText] = useState<string>('');
  const [editingNoteTurnId, setEditingNoteTurnId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');
  const [title, setTitle] = useState(interaction.title);
  const [category, setCategory] = useState(interaction.category);
  const [mood, setMood] = useState(interaction.mood || '');
  const [mode, setMode] = useState<ReflectionMode>(interaction.mode || 'reflect');
  const [copiedTurnId, setCopiedTurnId] = useState<string | null>(null);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const locationPopoverRef = useRef<HTMLDivElement>(null);

  // Close location popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationPopoverRef.current &&
        !locationPopoverRef.current.contains(event.target as Node)
      ) {
        setIsLocationOpen(false);
      }
    };
    if (isLocationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLocationOpen]);

  // Inactivity Countdown Timer
  useEffect(() => {
    const updateCountdown = () => {
      if (interaction.status === 'active') {
        const remainingMs = getRemainingActiveMs(interaction);
        setRemainingTimeText(formatRemainingTime(remainingMs));
      } else {
        setRemainingTimeText('Concluded');
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 15000);
    return () => clearInterval(interval);
  }, [interaction]);

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

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setIsResolvingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch('/api/location/resolve-gps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              storeCoordinates: false,
            }),
          });
          if (!res.ok) {
            throw new Error('Failed to resolve coordinates');
          }
          const data = await res.json();
          if (data.location) {
            onUpdateInteraction({
              ...interaction,
              locationContext: data.location,
            });
            setIsLocationOpen(false);
          }
        } catch (err: any) {
          setLocationError(err.message || 'Could not resolve GPS location.');
        } finally {
          setIsResolvingLocation(false);
        }
      },
      (geoErr) => {
        setIsResolvingLocation(false);
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setLocationError('Permission denied. You can search or type a place name below.');
        } else {
          setLocationError('Unable to retrieve your location.');
        }
      },
      { timeout: 10000 }
    );
  };

  const handleResolveLocationQuery = async () => {
    if (!locationQuery.trim()) return;
    setIsResolvingLocation(true);
    setLocationError(null);
    try {
      const res = await fetch('/api/location/resolve-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: locationQuery.trim(),
          storeCoordinates: false,
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to resolve location query');
      }
      const data = await res.json();
      if (data.location) {
        onUpdateInteraction({
          ...interaction,
          locationContext: data.location,
        });
        setLocationQuery('');
        setIsLocationOpen(false);
      }
    } catch (err: any) {
      setLocationError(err.message || 'Could not set location.');
    } finally {
      setIsResolvingLocation(false);
    }
  };

  const handleRemoveLocation = () => {
    onUpdateInteraction({
      ...interaction,
      locationContext: null,
    });
    setIsLocationOpen(false);
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

  const handleTogglePin = async (turnId: string, currentPinned?: boolean) => {
    const newPinned = !currentPinned;
    const updatedTurns = turns.map((t) =>
      t.id === turnId ? { ...t, isPinned: newPinned } : t
    );
    const updatedInteraction: Interaction = {
      ...interaction,
      turns: updatedTurns,
      updatedAt: new Date().toISOString(),
    };
    onUpdateInteraction(updatedInteraction);

    try {
      await fetch(`/api/entries/${interaction.id}/messages/${turnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: newPinned, userId: interaction.userId }),
      });
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleSaveNote = async (turnId: string, noteText: string) => {
    const trimmed = noteText.trim();
    const updatedTurns = turns.map((t) =>
      t.id === turnId ? { ...t, note: trimmed || undefined } : t
    );
    const updatedInteraction: Interaction = {
      ...interaction,
      turns: updatedTurns,
      updatedAt: new Date().toISOString(),
    };
    onUpdateInteraction(updatedInteraction);
    setEditingNoteTurnId(null);
    setNoteDraft('');

    try {
      await fetch(`/api/entries/${interaction.id}/messages/${turnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: trimmed, userId: interaction.userId }),
      });
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  const turns = interaction.turns || [];

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-61px)] bg-[#FAF9F6] overflow-hidden">
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

            {/* Location Context Pill & Popover */}
            <div className="relative">
              <button
                id="workspace-location-btn"
                type="button"
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className={`inline-flex items-center gap-1 border rounded-md px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer ${
                  interaction.locationContext?.name
                    ? 'bg-[#DCEEE3] text-[#3B7A57] border-[#BCE1CC] hover:bg-[#CFE8D7]'
                    : 'bg-[#F9F7F2] hover:bg-stone-100 text-stone-600 border-stone-200'
                }`}
                title={interaction.locationContext?.name ? `Location: ${interaction.locationContext.name}` : 'Attach location context'}
              >
                <MapPin className={`w-3 h-3 ${interaction.locationContext?.name ? 'text-[#3B7A57]' : 'text-stone-400'}`} />
                <span className="max-w-[130px] sm:max-w-[170px] truncate">
                  {interaction.locationContext?.name || 'Add Location'}
                </span>
              </button>

              {isLocationOpen && (
                <div
                  ref={locationPopoverRef}
                  id="workspace-location-popover"
                  className="absolute left-0 mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-stone-200 p-3.5 z-50 text-xs space-y-3 animate-fade-in"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                    <div>
                      <h4 className="font-semibold text-stone-800 text-xs">Location Context</h4>
                      <p className="text-[10px] text-stone-400">Attach where you are thinking from</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLocationOpen(false)}
                      className="text-stone-400 hover:text-stone-600 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {locationError && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px]">
                      {locationError}
                    </div>
                  )}

                  {/* GPS Option */}
                  <button
                    id="workspace-use-gps-btn"
                    type="button"
                    onClick={handleUseGps}
                    disabled={isResolvingLocation}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isResolvingLocation ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3B7A57]" />
                    ) : (
                      <Navigation className="w-3.5 h-3.5 text-[#3B7A57]" />
                    )}
                    <span>Use Current GPS</span>
                  </button>

                  <div className="flex items-center gap-2 text-[10px] text-stone-400 uppercase tracking-wider">
                    <span className="flex-1 h-px bg-stone-200"></span>
                    <span>Or Search / Type</span>
                    <span className="flex-1 h-px bg-stone-200"></span>
                  </div>

                  {/* Search / Custom place */}
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        id="workspace-location-query-input"
                        type="text"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleResolveLocationQuery();
                          }
                        }}
                        placeholder="e.g. The Mill Coffee SF, Home Office..."
                        className="w-full pl-7 pr-2 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3B7A57]"
                      />
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2 top-2" />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {interaction.locationContext ? (
                        <button
                          type="button"
                          id="workspace-remove-location-btn"
                          onClick={handleRemoveLocation}
                          className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                        >
                          Clear location
                        </button>
                      ) : (
                        <span />
                      )}
                      <button
                        id="workspace-set-location-btn"
                        type="button"
                        onClick={handleResolveLocationQuery}
                        disabled={!locationQuery.trim() || isResolvingLocation}
                        className="px-3 py-1 bg-[#3B7A57] hover:bg-[#2E6145] text-white rounded-md text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Set Place
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Status Indicator */}
            <div className="flex items-center gap-1.5 ml-auto md:ml-2">
              {isSaving ? (
                <span className="flex items-center gap-1 text-[11px] text-stone-500">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin text-emerald-800" />
                  <span>Saving...</span>
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
          {/* Inactivity Countdown Timer */}
          <div
            id="workspace-countdown-badge"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors ${
              interaction.status === 'concluded'
                ? 'bg-stone-100 text-stone-600 border-stone-200'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
            }`}
            title={interaction.status === 'concluded' ? 'Entry is concluded' : 'Auto-concludes after 2 hours of inactivity'}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-800" />
            <span>{remainingTimeText || 'Active'}</span>
          </div>

          {/* Conclude Entry Action */}
          {interaction.status !== 'concluded' ? (
            <button
              id="workspace-conclude-btn"
              onClick={async () => {
                if (isConcluding || !onConcludeEntry) return;
                setIsConcluding(true);
                try {
                  await onConcludeEntry(interaction);
                } finally {
                  setIsConcluding(false);
                }
              }}
              disabled={isConcluding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#3B7A57] hover:bg-[#2E6145] rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Conclude this entry and synthesize insights into persistent Themes"
            >
              {isConcluding ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Conclude Entry</span>
                </>
              )}
            </button>
          ) : (
            onNewSession && (
              <button
                id="workspace-new-entry-btn"
                onClick={onNewSession}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#3B7A57] hover:bg-[#2E6145] rounded-lg shadow-2xs transition-all cursor-pointer"
                title="Start a new reflection entry"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Reflection</span>
              </button>
            )
          )}

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
                        {turn.isPinned && (
                          <span className="inline-flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-900">
                            <Pin className="w-2.5 h-2.5 fill-current" />
                            <span>Pinned</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] ${isUser ? 'text-stone-400' : 'text-stone-400'}`}>
                          {new Date(turn.createdAt || turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {/* Turn Pin Toggle */}
                        <button
                          onClick={() => handleTogglePin(turn.id, turn.isPinned)}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            turn.isPinned
                              ? 'text-amber-500 bg-amber-900/30'
                              : isUser
                              ? 'text-stone-500 hover:text-stone-300'
                              : 'text-stone-400 hover:text-stone-600'
                          }`}
                          title={turn.isPinned ? 'Unpin message' : 'Pin message'}
                          aria-label={turn.isPinned ? 'Unpin message' : 'Pin message'}
                        >
                          <Pin className={`w-3 h-3 ${turn.isPinned ? 'fill-current' : ''}`} />
                        </button>

                        {/* Turn Note Toggle */}
                        <button
                          onClick={() => {
                            setEditingNoteTurnId(editingNoteTurnId === turn.id ? null : turn.id);
                            setNoteDraft(turn.note || '');
                          }}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            turn.note
                              ? 'text-emerald-400'
                              : isUser
                              ? 'text-stone-500 hover:text-stone-300'
                              : 'text-stone-400 hover:text-stone-600'
                          }`}
                          title={turn.note ? 'Edit note' : 'Add personal note'}
                          aria-label={turn.note ? 'Edit note' : 'Add personal note'}
                        >
                          <StickyNote className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Turn Content (Typography division: Serif for user thoughts, Sans for companion) */}
                    {isUser ? (
                      <p className="text-sm font-serif whitespace-pre-wrap leading-relaxed">
                        {turn.content}
                      </p>
                    ) : (
                      <div className="text-sm font-sans leading-relaxed text-stone-800 space-y-2">
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

                    {/* Attached Note Display */}
                    {turn.note && editingNoteTurnId !== turn.id && (
                      <div className="mt-3 p-2.5 bg-amber-50/90 border border-amber-200/80 rounded-xl text-xs text-stone-800 flex items-start gap-2 shadow-2xs">
                        <StickyNote className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-[10px] text-amber-900 uppercase tracking-wide block">Note</span>
                          <p className="mt-0.5 whitespace-pre-wrap font-sans text-stone-700">{turn.note}</p>
                        </div>
                        <button
                          onClick={() => {
                            setEditingNoteTurnId(turn.id);
                            setNoteDraft(turn.note || '');
                          }}
                          className="text-[10px] font-medium text-amber-800 hover:underline cursor-pointer ml-2"
                        >
                          Edit
                        </button>
                      </div>
                    )}

                    {/* Inline Note Editor */}
                    {editingNoteTurnId === turn.id && (
                      <div className="mt-3 p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs">
                        <span className="font-semibold text-stone-700 block">Personal Note</span>
                        <textarea
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          placeholder="Type a reflection note on this message..."
                          rows={2}
                          className="w-full bg-white p-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-sans resize-none text-stone-800"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditingNoteTurnId(null); setNoteDraft(''); }}
                            className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-800 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNote(turn.id, noteDraft)}
                            className="px-3 py-1 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-2xs cursor-pointer"
                          >
                            Save Note
                          </button>
                        </div>
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

      {/* Bottom Composer Bar or Concluded State Banner */}
      {interaction.status === 'concluded' ? (
        <div className="p-4 sm:p-6 bg-white border-t border-stone-200 shrink-0">
          <div className={`mx-auto transition-all duration-300 ${isSidebarOpen ? 'max-w-3xl' : 'max-w-4xl'}`}>
            <div className="bg-[#FAF9F6] border border-stone-200 rounded-2xl p-5 text-center space-y-3 shadow-2xs">
              <div className="flex items-center justify-center gap-2 text-emerald-800 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>This reflection entry is concluded &amp; synthesized</span>
              </div>
              <p className="text-xs text-stone-600 max-w-lg mx-auto font-sans leading-relaxed">
                {interaction.summary
                  ? `Summary: "${interaction.summary}"`
                  : 'Themes and cross-session observations have been linked. Concluded entries are preserved as immutable records.'}
              </p>
              {onNewSession && (
                <button
                  id="workspace-start-new-reflection-btn"
                  onClick={onNewSession}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#3B7A57] hover:bg-[#2E6145] rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start New Reflection</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
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
      )}
    </main>
  );
};
