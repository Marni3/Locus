import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
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
  BookOpen,
  Smile,
  MoreVertical,
  Plus,
  PanelLeftOpen,
  Bookmark,
  BookmarkCheck,
  Clock,
  CheckCircle2,
  StickyNote,
  MapPin,
  Navigation,
  Search,
  X,
  Loader2,
  ArrowRight,
  Mic,
  MicOff
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Interaction, InteractionTurn, UserSettings, ReflectionMode } from '../types';
import { extractCleanTitle, cleanProseSnippet } from '../lib/textUtils';
import { LocusMark } from './LocusMark';
import { getRemainingActiveMs, formatRemainingTime } from '../services/concludeEngine';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { apiFetch } from '../lib/api';

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
  initialPrompt?: string;
  onDismissInitialPrompt?: () => void;
  onNavigateToThemes?: () => void;
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
  initialPrompt,
  onDismissInitialPrompt,
  onNavigateToThemes,
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
  const [failedTurnId, setFailedTurnId] = useState<string | null>(null);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const {
    isListening,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    onTranscriptChange: (chunk) => {
      setInputText((prev) => {
        const trimmed = prev.trim();
        const addition = chunk.trim();
        if (!trimmed) return addition;
        return `${trimmed} ${addition}`;
      });
    },
    onError: (msg) => {
      onError(msg);
    },
  });

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

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
          const res = await apiFetch('/api/location/resolve-gps', {
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
      const res = await apiFetch('/api/location/resolve-query', {
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

    if (isListening) {
      stopListening();
    }

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
    
    // Auto-update title if it's still default (using clean whole-word extraction)
    let newTitle = interaction.title;
    if (interaction.title === 'New Reflection' || interaction.title === 'Untitled Reflection') {
      newTitle = extractCleanTitle(userPrompt);
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
      const response = await apiFetch('/api/reflect', {
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

      setFailedTurnId(null);
      onUpdateInteraction(finalInteraction);
    } catch (err: any) {
      console.error('Reflection request error:', err);
      setFailedTurnId(newTurn.id);
      onError(err.message || 'Could not reach reflection service. Your thought is saved.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResendTurn = async (failedTurn: InteractionTurn) => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const allTurns = interaction.turns || [];
      const turnIndex = allTurns.findIndex(t => t.id === failedTurn.id);
      const historyToSend = turnIndex !== -1 ? allTurns.slice(0, turnIndex + 1) : allTurns;

      const response = await apiFetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: historyToSend.map((t) => ({
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
        throw new Error(errJson.error || `Reflection retry failed with status ${response.status}`);
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
        ...interaction,
        turns: [...allTurns, modelTurn],
        updatedAt: new Date().toISOString(),
      };

      setFailedTurnId(null);
      onUpdateInteraction(finalInteraction);
    } catch (err: any) {
      console.error('Reflection retry error:', err);
      setFailedTurnId(failedTurn.id);
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

  const handleToggleBookmark = async (turnId: string, currentBookmarked?: boolean) => {
    const newBookmarked = !currentBookmarked;
    const updatedTurns = turns.map((t) =>
      t.id === turnId ? { ...t, isBookmarked: newBookmarked, isPinned: newBookmarked } : t
    );
    const updatedInteraction: Interaction = {
      ...interaction,
      turns: updatedTurns,
      updatedAt: new Date().toISOString(),
    };
    onUpdateInteraction(updatedInteraction);

    try {
      await apiFetch(`/api/entries/${interaction.id}/messages/${turnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBookmarked: newBookmarked, isPinned: newBookmarked, userId: interaction.userId }),
      });
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
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
      await apiFetch(`/api/entries/${interaction.id}/messages/${turnId}`, {
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
    <main id="session-workspace-container" className="flex-1 flex flex-col h-[calc(100vh-61px)] bg-canvas overflow-hidden">
      {/* Workspace Header */}
      <div className="px-4 sm:px-6 py-3.5 bg-surface border-b border-border-hairline shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && onToggleSidebar && (
              <button
                id="workspace-show-sidebar-btn"
                onClick={onToggleSidebar}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-text-primary bg-canvas hover:bg-surface rounded-lg border border-border-hairline transition-all cursor-pointer shadow-2xs shrink-0"
                title="Show reflections sidebar (Ctrl+B / ⌘B)"
                aria-label="Show reflections sidebar"
              >
                <PanelLeftOpen className="w-4 h-4 text-accent-sage" />
                <span className="hidden sm:inline">Reflections</span>
              </button>
            )}

            <input
              id="workspace-session-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="font-serif-heading text-lg sm:text-xl font-bold text-text-primary bg-transparent border-b border-transparent hover:border-border-hairline focus:border-accent-sage focus:outline-none transition-colors w-full truncate"
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
                className="bg-canvas border border-border-hairline rounded-md px-2 py-0.5 text-xs text-text-primary focus:outline-none focus:border-accent-sage font-medium cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Mood selector pill dropdown */}
            <div className="flex items-center gap-1">
              <Smile className="w-3 h-3 text-text-muted" />
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                onBlur={() => onUpdateInteraction({ ...interaction, mood: mood || undefined })}
                className="bg-canvas border border-border-hairline rounded-md px-2 py-0.5 text-xs text-text-primary focus:outline-none focus:border-accent-sage cursor-pointer"
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
                    ? 'bg-accent-sage-tint text-accent-sage border-accent-sage/30'
                    : 'bg-canvas hover:bg-surface text-text-muted border-border-hairline'
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
                      <p className="text-xs text-stone-400">Attach where you are thinking from</p>
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
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs">
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

                  <div className="flex items-center gap-2 text-xs text-stone-400 uppercase tracking-wider">
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
                          className="text-xs text-rose-600 hover:underline cursor-pointer"
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
                <span className="flex items-center gap-1 text-xs text-stone-500">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin text-emerald-800" />
                  <span>Saving...</span>
                </span>
              ) : saveError ? (
                <button
                  onClick={onRetrySave}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:underline cursor-pointer"
                  title={saveError}
                >
                  <AlertCircle className="w-3 h-3" />
                  <span>Save failed (Retry)</span>
                </button>
              ) : (
                <span className="flex items-center gap-1 text-xs text-emerald-800 font-medium">
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
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-border-hairline bg-canvas text-text-muted font-medium transition-colors"
            title={interaction.status === 'concluded' ? 'Entry is concluded' : 'Auto-concludes after 2 hours of inactivity'}
          >
            <Clock className="w-3.5 h-3.5 text-accent-sage" />
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-accent-sage hover:opacity-90 rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Conclude and seal this reflection. Once sealed, you can write in the margins."
            >
              {isConcluding ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Conclude & Seal</span>
                </>
              )}
            </button>
          ) : (
            onNewSession && (
              <button
                id="workspace-new-entry-btn"
                onClick={onNewSession}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-accent-sage hover:opacity-90 rounded-lg shadow-2xs transition-all cursor-pointer"
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-primary bg-canvas hover:bg-surface border border-border-hairline rounded-lg transition-colors cursor-pointer"
            title="Generate structured session takeaways and summary"
          >
            <FileText className="w-3.5 h-3.5 text-text-muted" />
            <span>Summary &amp; Insights</span>
          </button>
        </div>
      </div>

      {/* Stance Selector Banner */}
      <div className="px-6 py-2 bg-canvas border-b border-border-hairline flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider shrink-0">
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
                  ? 'bg-accent-sage text-white shadow-2xs font-semibold'
                  : 'bg-surface text-text-muted border border-border-hairline hover:text-text-primary hover:bg-canvas'
              }`}
              title={st.desc}
            >
              <Icon className="w-3 h-3" />
              <span>{st.label}</span>
            </button>
          );
        })}
      </div>

      {/* Reflection Turns & Workspace Layout */}
      {(() => {
        const cleanSummary = cleanProseSnippet(interaction.summary || '');

        const renderTurnsFeed = (compact?: boolean) => {
          if (turns.length === 0) {
            return (
              <div className="max-w-xl mx-auto py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-accent-sage-tint text-accent-sage flex items-center justify-center mx-auto shadow-2xs">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif-heading text-xl font-bold text-text-primary">
                    Begin your reflection
                  </h3>
                  <p className="text-sm text-text-muted mt-1.5 leading-relaxed font-sans">
                    Write down what's on your mind. Explore a challenge, reflect on a recent decision, or unpack your day.
                  </p>
                </div>

                {/* Floating Inspiration Chip if launched from daily prompt */}
                {initialPrompt && (
                  <div className="p-4 bg-accent-sage-tint/40 border border-accent-sage/30 rounded-2xl text-left space-y-2 relative group mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider font-semibold text-accent-sage flex items-center gap-1.5 font-sans">
                        <Compass className="w-3.5 h-3.5" />
                        Daily Reflection Inspiration
                      </span>
                      {onDismissInitialPrompt && (
                        <button
                          onClick={onDismissInitialPrompt}
                          className="p-1 text-text-muted hover:text-text-primary rounded-md cursor-pointer"
                          title="Dismiss prompt"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="font-serif text-sm sm:text-base text-text-primary italic leading-snug">
                      "{initialPrompt}"
                    </p>
                    <button
                      onClick={() => setInputText(initialPrompt)}
                      className="text-xs text-accent-sage font-medium hover:underline inline-flex items-center gap-1 font-sans cursor-pointer"
                    >
                      Use this contemplation as your starter &rarr;
                    </button>
                  </div>
                )}

                {/* Prompt Starter Pills */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {[
                    'What made today feel productive or draining?',
                    'I am torn between two choices and want to weigh trade-offs.',
                    'Help me unpack why I am feeling hesitant about this goal.',
                    'I want to express gratitude for three specific moments today.',
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(prompt)}
                      className="p-3 bg-surface hover:bg-canvas border border-border-hairline rounded-xl text-xs text-text-primary leading-snug transition-all text-left shadow-2xs cursor-pointer"
                    >
                      "{prompt}"
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div className={`mx-auto space-y-6 transition-all duration-300 ${compact ? 'max-w-full' : isSidebarOpen ? 'max-w-3xl' : 'max-w-4xl'}`}>
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
                      className={`rounded-2xl p-4 sm:p-5 shadow-2xs transition-all ${
                        compact ? 'max-w-full' : isSidebarOpen ? 'max-w-2xl' : 'max-w-3xl'
                      } ${
                        isUser
                          ? 'bg-paper-deep border border-border-hairline text-text-primary rounded-br-xs'
                          : 'bg-surface border border-border-hairline text-text-primary rounded-bl-xs'
                      }`}
                    >
                      {/* Role Header */}
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase font-sans">
                          {isUser ? (
                            <span className="text-accent-sage">You &bull; Reflection</span>
                          ) : (
                            <div className="flex items-center gap-1.5 text-accent-sage">
                              <LocusMark className="w-3.5 h-3.5" />
                              <span>Reflection Companion</span>
                            </div>
                          )}
                          {(turn.isBookmarked || turn.isPinned) && (
                            <span className="inline-flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-accent-sage-tint text-accent-sage">
                              <Bookmark className="w-2.5 h-2.5 fill-current" />
                              <span>Bookmarked</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-stone-400">
                            {new Date(turn.createdAt || turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          {/* Turn Bookmark Toggle */}
                          <button
                            onClick={() => handleToggleBookmark(turn.id, Boolean(turn.isBookmarked || turn.isPinned))}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              turn.isBookmarked || turn.isPinned
                                ? 'text-[#3B7A57] bg-[#DCEEE3]/60'
                                : isUser
                                ? 'text-stone-500 hover:text-stone-300'
                                : 'text-stone-400 hover:text-stone-600'
                            }`}
                            title={turn.isBookmarked || turn.isPinned ? 'Remove bookmark' : 'Bookmark this realization'}
                            aria-label={turn.isBookmarked || turn.isPinned ? 'Remove bookmark' : 'Bookmark this realization'}
                          >
                            <Bookmark className={`w-3 h-3 ${turn.isBookmarked || turn.isPinned ? 'fill-current' : ''}`} />
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

                      {/* Turn Content */}
                      {isUser ? (
                        <p className="text-sm font-serif whitespace-pre-wrap leading-relaxed">
                          {turn.content}
                        </p>
                      ) : (
                        <div className="text-sm font-sans leading-relaxed text-text-primary space-y-2">
                          <ReactMarkdown
                            components={{
                              h1: ({ children }) => <h3 className="font-serif-heading font-bold text-base text-text-primary mt-2 mb-1">{children}</h3>,
                              h2: ({ children }) => <h4 className="font-serif-heading font-bold text-sm text-text-primary mt-2 mb-1">{children}</h4>,
                              h3: ({ children }) => <h5 className="font-serif-heading font-bold text-sm text-text-primary mt-2 mb-1">{children}</h5>,
                              p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                              blockquote: ({ children }) => <blockquote className="border-l-2 border-accent-sage pl-3 italic text-text-muted my-2">{children}</blockquote>,
                              strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                            }}
                          >
                            {turn.content}
                          </ReactMarkdown>
                        </div>
                      )}

                      {/* Actions on Assistant turns */}
                      {!isUser && (
                        <div className="mt-3 pt-2.5 border-t border-border-hairline flex items-center justify-end gap-2 text-text-muted">

                          <button
                            onClick={() => handleCopyText(turn.id, turn.content)}
                            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-canvas rounded-md transition-colors cursor-pointer"
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
                        <div className="mt-3 p-2.5 bg-amber-50/90 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex items-start gap-2 shadow-2xs">
                          <StickyNote className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-xs text-amber-900 uppercase tracking-wide block">Note</span>
                            <p className="mt-0.5 whitespace-pre-wrap font-sans text-amber-900/90">{turn.note}</p>
                          </div>
                          <button
                            onClick={() => {
                              setEditingNoteTurnId(turn.id);
                              setNoteDraft(turn.note || '');
                            }}
                            className="text-xs font-medium text-amber-800 hover:underline cursor-pointer ml-2"
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
                            className="w-full bg-white p-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#3B7A57] font-sans resize-none text-stone-800"
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
                              className="px-3 py-1 text-xs font-semibold text-white bg-[#3B7A57] hover:bg-[#2E6145] rounded-lg shadow-2xs cursor-pointer"
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Inline Message Resend on Failure */}
                    {failedTurnId === turn.id && (
                      <div className="mt-2 flex items-center justify-between gap-3 p-3 bg-red-50/90 border border-red-200 rounded-xl text-xs text-red-800 shadow-2xs max-w-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                          <span>Unable to send message right now. Your text is safely preserved.</span>
                        </div>
                        <button
                          onClick={() => handleResendTurn(turn)}
                          disabled={isGenerating}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#3B7A57] text-white text-xs font-semibold hover:opacity-95 transition-all shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                          <span>Resend</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* In-Flight Reflection Thought Indicator */}
              {isGenerating && (
                <div className="flex items-center gap-3 py-3 px-1">
                  <div className="w-7 h-7 rounded-lg bg-surface border border-border-hairline flex items-center justify-center text-accent-sage shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-accent-sage animate-ping" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif italic text-sm text-text-muted">
                      Reflecting with you…
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          );
        };

        if (interaction.status === 'concluded') {
          return (
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-canvas">
              {/* Left Column (60% on desktop): Chronological Conversation Transcript */}
              <div className="flex-1 lg:w-3/5 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-border-hairline">
                <div className="flex items-center justify-between pb-3 border-b border-border-hairline/60 max-w-2xl mx-auto">
                  <span className="text-xs uppercase tracking-wider font-semibold text-text-muted font-sans flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-accent-sage" />
                    Chronological Transcript ({turns.length} {turns.length === 1 ? 'turn' : 'turns'})
                  </span>
                  <span className="text-xs text-text-muted font-sans">
                    Preserved Historical Record
                  </span>
                </div>
                {renderTurnsFeed(true)}
              </div>

              {/* Right Column (40% on desktop): Executive Synthesis Dossier */}
              <div id="concluded-synthesis-dossier" className="lg:w-2/5 overflow-y-auto p-5 sm:p-7 bg-surface space-y-6 shrink-0 shadow-xs border-l border-border-hairline text-text-primary">
                {/* Header & Status */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-sage-tint text-accent-sage">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Concluded &amp; Synthesized</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-primary leading-snug">
                    {interaction.title || 'Executive Reflection Synthesis'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted font-sans">
                    <span>
                      {interaction.concludedAt 
                        ? new Date(interaction.concludedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Concluded'}
                    </span>
                    {interaction.locationContext?.name && (
                      <>
                        <span>&middot;</span>
                        <span className="inline-flex items-center gap-1 text-accent-sage">
                          <MapPin className="w-3 h-3" />
                          {interaction.locationContext.name}
                        </span>
                      </>
                    )}
                    {interaction.category && (
                      <>
                        <span>&middot;</span>
                        <span className="capitalize">{interaction.category}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Editorial Synthesis Block (clean quotes) */}
                <div className="p-4 rounded-xl bg-canvas border border-border-hairline space-y-2 shadow-2xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted font-sans block">
                    Executive Synthesis
                  </span>
                  <p className="font-serif text-sm sm:text-base text-text-primary leading-relaxed italic">
                    "{cleanSummary || 'Themes and cross-session observations have been linked into your concept graph. Concluded entries are preserved as immutable records.'}"
                  </p>
                </div>

                {/* Key Insights / Takeaways if present */}
                {interaction.keyTakeaways && interaction.keyTakeaways.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted font-sans flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-accent-sage" />
                      Key Takeaways
                    </h3>
                    <ul className="space-y-2">
                      {interaction.keyTakeaways.map((takeaway, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-text-primary font-sans leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-sage shrink-0 mt-2" />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Qualitative Tags */}
                {interaction.tags && interaction.tags.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted font-sans flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-accent-sage" />
                      Qualitative Tags
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {interaction.tags.map(t => (
                        <span key={t} className="px-2.5 py-1 rounded-md text-xs font-medium bg-canvas border border-border-hairline text-text-muted font-sans">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Immutability Assurance */}
                <div className="p-3 bg-canvas border border-border-hairline rounded-xl text-xs text-text-muted font-sans space-y-1">
                  <span className="font-semibold text-text-primary block">Immutable Record</span>
                  <p>This reflection session is preserved in full. Observations have been extracted and mapped into your Concept Graph.</p>
                </div>

                {/* Call to Actions */}
                <div className="pt-4 border-t border-border-hairline space-y-2.5">
                  {onNewSession && (
                    <button
                      id="workspace-start-new-reflection-btn"
                      onClick={onNewSession}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-sage hover:opacity-95 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Start New Reflection</span>
                    </button>
                  )}
                  {onNavigateToThemes && (
                    <button
                      id="workspace-dossier-view-themes-btn"
                      onClick={onNavigateToThemes}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border-hairline hover:border-accent-sage text-text-primary hover:text-accent-sage text-xs font-medium transition-all cursor-pointer"
                    >
                      <span>Explore Themes &amp; Concept Graph</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        }

        return (
          <>
            {/* Center Reflection Turns Scrollable Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
              {renderTurnsFeed(false)}
            </div>

            {/* Bottom Composer Bar */}
            <div className="p-4 sm:p-6 bg-surface border-t border-border-hairline shrink-0">
              <div className={`mx-auto space-y-2 transition-all duration-300 ${isSidebarOpen ? 'max-w-3xl' : 'max-w-4xl'}`}>
                <div className="relative bg-canvas rounded-2xl border border-border-hairline focus-within:border-accent-sage focus-within:ring-2 focus-within:ring-accent-sage/20 transition-all p-3 shadow-2xs">
                  <textarea
                    ref={textareaRef}
                    id="workspace-prompt-textarea"
                    rows={3}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Reflect on your thoughts, ask for clarity, or brainstorm next steps..."
                    className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none resize-none font-sans leading-relaxed"
                    disabled={isGenerating}
                  />

                  <div className="flex items-center justify-between pt-2 border-t border-border-hairline/60">
                    <span className="text-xs text-text-muted hidden sm:inline">
                      Shift + Enter for new line
                    </span>

                    <div className="flex items-center gap-2 ml-auto">
                      {/* Voice-to-Text Microphone Button */}
                      <button
                        id="workspace-mic-button"
                        type="button"
                        onClick={toggleListening}
                        disabled={!isSpeechSupported || isGenerating}
                        title={
                          !isSpeechSupported
                            ? 'Speech recognition is not supported in this browser'
                            : isListening
                            ? 'Stop voice recording'
                            : 'Start voice dictation'
                        }
                        aria-label={isListening ? 'Stop voice recording' : 'Start voice dictation'}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                          isListening
                            ? 'bg-rose-50 border-rose-300 text-rose-600 ring-2 ring-rose-400/40 animate-pulse dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400'
                            : 'bg-surface border-border-hairline text-text-muted hover:text-text-primary hover:border-accent-sage'
                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                            <span className="text-rose-600 dark:text-rose-400">Listening...</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5" />
                            <span className="hidden xs:inline">Dictate</span>
                          </>
                        )}
                      </button>

                      <button
                        id="workspace-send-button"
                        onClick={handleSendMessage}
                        disabled={!inputText.trim() || isGenerating}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-accent-sage hover:opacity-95 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
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
          </>
        );
      })()}
    </main>
  );
};
