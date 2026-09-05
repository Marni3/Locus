import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  X, 
  Search, 
  Compass, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Star, 
  Layers,
  Plus
} from 'lucide-react';
import { Entry, Theme } from '../types';

interface ReflectionsHomeProps {
  entries: Entry[];
  themes: Theme[];
  onSelectEntry: (entry: Entry) => void;
  onNewReflection: (initialPrompt?: string) => void;
  onSelectTheme: (theme: Theme) => void;
  isLoading?: boolean;
}

const DAILY_PROMPTS = [
  "What is one decision you are avoiding right now because you already know the answer?",
  "Where did you feel unneeded friction today, and what expectation caused it?",
  "What insight or realization from this week deserve more space to breathe?",
  "If you stepped back from today's urgency, what is the single thread that actually matters?",
  "What are you currently tolerating that is silently draining your creative energy?",
  "What is something you believed six months ago that you no longer hold as true?",
  "In what area of your life are you mistaking motion for real progress?"
];

export const ReflectionsHome: React.FC<ReflectionsHomeProps> = ({
  entries,
  themes,
  onSelectEntry,
  onNewReflection,
  onSelectTheme,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'concluded' | 'starred'>('all');

  // Daily prompt rotation based on day of year
  const dailyPrompt = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
  }, []);

  const [isPromptDismissed, setIsPromptDismissed] = useState<boolean>(() => {
    try {
      const todayKey = new Date().toISOString().split('T')[0];
      return localStorage.getItem(`locus_prompt_dismissed_${todayKey}`) === 'true';
    } catch {
      return false;
    }
  });

  const handleDismissPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPromptDismissed(true);
    try {
      const todayKey = new Date().toISOString().split('T')[0];
      localStorage.setItem(`locus_prompt_dismissed_${todayKey}`, 'true');
    } catch {}
  };

  // Ready for synthesis themes (observationCount >= 2)
  const readyThemes = useMemo(() => {
    return themes.filter(t => (t.observationCount || 0) >= 2);
  }, [themes]);

  // Extract all unique qualitative tags across entries
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach(e => {
      e.tags?.forEach(t => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, [entries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Search term matching title, summary, location, tags
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = (entry.title || '').toLowerCase().includes(query);
        const matchesSummary = (entry.summary || '').toLowerCase().includes(query);
        const matchesLocation = (entry.locationContext?.name || '').toLowerCase().includes(query);
        const matchesTag = (entry.tags || []).some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesSummary && !matchesLocation && !matchesTag) {
          return false;
        }
      }

      // Tag filter
      if (selectedTag && !(entry.tags || []).includes(selectedTag)) {
        return false;
      }

      // Status filter
      if (activeFilter === 'active' && entry.status !== 'active') return false;
      if (activeFilter === 'concluded' && entry.status !== 'concluded') return false;
      if (activeFilter === 'starred' && !entry.starred) return false;

      return true;
    });
  }, [entries, searchTerm, selectedTag, activeFilter]);

  // Relative date formatter
  const formatRelativeDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);

    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-full bg-canvas text-text-primary px-3.5 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Daily Journaling Prompt Banner */}
      {!isPromptDismissed && (
        <div 
          onClick={() => onNewReflection(dailyPrompt)}
          className="relative overflow-hidden bg-surface border border-border-hairline rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#D5D0C7] hover:shadow-sm transition-all cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNewReflection(dailyPrompt)}
          aria-label="Daily Journaling Prompt: Click to reflect"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-accent-sage-tint text-accent-sage flex items-center justify-center shrink-0 mt-0.5">
                <Compass className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-text-muted flex items-center gap-1.5 font-sans">
                  Daily Reflection Prompt
                </span>
                <p className="font-serif text-base sm:text-lg font-medium text-text-primary group-hover:text-accent-sage transition-colors leading-snug">
                  "{dailyPrompt}"
                </p>
                <div className="flex items-center gap-1 text-xs text-accent-sage font-medium pt-1">
                  <span>Start a session with this contemplation</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>

            <button
              onClick={handleDismissPrompt}
              className="p-1 text-text-muted hover:text-text-primary rounded-lg hover:bg-canvas transition-colors shrink-0"
              title="Dismiss prompt"
              aria-label="Dismiss prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Ready for Synthesis Ribbon (Themes with >= 2 observations) */}
      {readyThemes.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent-sage" />
              <h2 className="text-xs uppercase tracking-wider font-semibold text-text-muted font-sans">
                Ready for Longitudinal Synthesis
              </h2>
            </div>
            <span className="text-xs text-text-muted font-sans">
              {readyThemes.length} {readyThemes.length === 1 ? 'theme' : 'themes'}
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {readyThemes.map(theme => (
              <div
                key={theme.id}
                onClick={() => onSelectTheme(theme)}
                className="shrink-0 w-64 sm:w-72 bg-surface border border-border-hairline rounded-xl p-3.5 hover:border-[#D5D0C7] hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-text-muted mb-1 font-sans">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-accent-sage-tint text-accent-sage">
                      {theme.observationCount} observations
                    </span>
                    <span>{formatRelativeDate(theme.updatedAt)}</span>
                  </div>
                  <h3 className="font-serif text-sm sm:text-base font-semibold text-text-primary group-hover:text-accent-sage transition-colors line-clamp-1">
                    {theme.title}
                  </h3>
                  <p className="text-xs text-[#4A4A4A] line-clamp-2 mt-1 leading-relaxed font-sans">
                    {theme.currentSynthesis || 'Observations accumulated and ready to unpack into trajectory insights.'}
                  </p>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-[11px] font-medium text-accent-sage inline-flex items-center gap-0.5">
                    Unpack theme &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Controls Header: Search & Filters */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reflections, takeaways, places..."
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border-hairline rounded-xl text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-sage transition-all font-sans"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'concluded', 'active', 'starred'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all shrink-0 cursor-pointer ${
                  activeFilter === tab
                    ? 'bg-accent-sage text-white shadow-2xs font-semibold'
                    : 'bg-surface text-text-muted hover:text-text-primary hover:bg-[#F2EFEB]'
                }`}
              >
                {tab === 'starred' ? (
                  <span className="inline-flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Starred
                  </span>
                ) : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Qualitative Tag Filter Chips (if tags exist) */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] text-text-muted uppercase tracking-wider font-semibold font-sans shrink-0 mr-1">
              Tags:
            </span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#232323] text-white hover:bg-stone-800 transition-colors shrink-0 cursor-pointer"
              >
                <span>Clear</span>
                <X className="w-3 h-3" />
              </button>
            )}
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-accent-sage text-white font-semibold'
                    : 'bg-[#F4F3EE] text-text-muted hover:text-text-primary hover:bg-[#EAE8DF]'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Google Keep-Style 2-Column Vertical Masonry Card Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-text-muted text-sm font-sans">
          Loading your reflection canvas...
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border-hairline rounded-2xl p-8 bg-surface space-y-3">
          <div className="w-10 h-10 rounded-full bg-accent-sage-tint text-accent-sage flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-text-primary">
            {searchTerm || selectedTag || activeFilter !== 'all'
              ? 'No matching reflections found'
              : 'Your reflection canvas is waiting'}
          </h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto font-sans leading-relaxed">
            {searchTerm || selectedTag || activeFilter !== 'all'
              ? 'Try refining your search query or removing the active filter.'
              : 'Start your first conversational session to accumulate observations and build longitudinal insight.'}
          </p>
          <button
            onClick={() => onNewReflection()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-sage text-white text-xs font-semibold hover:opacity-95 transition-all shadow-xs cursor-pointer mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start a Reflection</span>
          </button>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3.5 space-y-3.5">
          {filteredEntries.map(entry => {
            const hasLocation = Boolean(entry.locationContext?.name);
            const relativeDate = formatRelativeDate(entry.updatedAt || entry.createdAt);
            const isActive = entry.status === 'active';

            return (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className="break-inside-avoid bg-surface border border-border-hairline rounded-xl p-3.5 md:p-4 hover:border-[#D5D0C7] hover:shadow-xs transition-all cursor-pointer flex flex-col text-left group relative"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelectEntry(entry)}
                aria-label={`Reflection: ${entry.title}`}
              >
                {/* Status Indicator & Header */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-sans">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 text-accent-sage font-medium">
                        <span className="w-2 h-2 rounded-full bg-accent-sage animate-pulse" />
                        In Progress
                      </span>
                    ) : (
                      <span>{relativeDate}</span>
                    )}
                    {hasLocation && (
                      <>
                        <span>&middot;</span>
                        <span className="inline-flex items-center gap-0.5 truncate max-w-[110px]" title={entry.locationContext?.name}>
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{entry.locationContext?.name}</span>
                        </span>
                      </>
                    )}
                  </div>

                  {entry.starred && (
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                  )}
                </div>

                {/* Title (Source Serif 4) */}
                <h3 className="font-serif text-sm sm:text-base font-semibold text-text-primary tracking-tight leading-snug group-hover:text-accent-sage transition-colors">
                  {entry.title || 'Untitled Reflection'}
                </h3>

                {/* 3-4 Sentence Conversation Gist / AI Summary */}
                <p className="text-xs sm:text-[13px] text-[#4A4A4A] leading-relaxed line-clamp-6 my-2 font-sans">
                  {entry.summary || (
                    entry.turns && entry.turns.length > 0
                      ? entry.turns[entry.turns.length - 1].content
                      : 'Reflection session in progress. Tap to open and continue dialogue.'
                  )}
                </p>

                {/* Qualitative Tags Chips */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 pt-1.5 border-t border-border-hairline/60">
                    {entry.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F4F3EE] text-[#555] font-sans"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
