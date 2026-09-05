import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Compass, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Star, 
  Layers,
  Plus,
  Bookmark
} from 'lucide-react';
import { Entry, Theme } from '../types';
import { cleanProseSnippet } from '../lib/textUtils';

interface ReflectionsHomeProps {
  entries: Entry[];
  themes: Theme[];
  onSelectEntry: (entry: Entry) => void;
  onNewReflection: (initialPrompt?: string) => void;
  onSelectTheme: (theme: Theme) => void;
  onOpenTheReturn?: () => void;
  onOpenBookmarks?: () => void;
  onStartTour?: () => void;
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
  onOpenTheReturn,
  onOpenBookmarks,
  onStartTour,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'concluded' | 'active' | 'bookmarked' | 'starred' | 'ready-to-unpack'>('all');

  // Daily prompt rotation based on day of year
  const dailyPrompt = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
  }, []);

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
      if (activeFilter === 'bookmarked') {
        const hasBookmark = (entry.turns || []).some(t => t.isBookmarked || t.isPinned);
        if (!hasBookmark) return false;
      }

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
      {/* Option B: Ambient Daily Reflection Prompt Bar */}
      <div 
        id="daily-contemplation-bar"
        onClick={() => onNewReflection(dailyPrompt)}
        className="p-3.5 bg-surface border border-border-hairline rounded-2xl shadow-2xs hover:border-[#D5D0C7] hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onNewReflection(dailyPrompt)}
        aria-label={`Daily Reflection Prompt: ${dailyPrompt}. Click to reflect.`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-xl bg-accent-sage-tint text-accent-sage flex items-center justify-center text-xs shrink-0 font-bold border border-accent-sage/15">
            ⊙
          </span>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-text-muted font-sans hidden sm:inline shrink-0">
            Daily Reflection Prompt ·
          </span>
          <span className="font-serif italic text-xs sm:text-sm text-text-primary group-hover:text-accent-sage transition-colors truncate">
            "{dailyPrompt}"
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-accent-sage shrink-0">
          <span>Reflect</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Controls Header: Search & Filters */}
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
            {(['all', 'concluded', 'active', 'bookmarked', 'starred'] as const).map(tab => (
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
                ) : tab === 'bookmarked' ? (
                  <span className="inline-flex items-center gap-1">
                    <Bookmark className="w-3 h-3 fill-current" /> Bookmarked
                  </span>
                ) : tab}
              </button>
            ))}

            {/* Ready for Synthesis Filter Tab */}
            {readyThemes.length > 0 && (
              <button
                id="filter-ready-themes"
                onClick={() => setActiveFilter(activeFilter === 'ready-to-unpack' ? 'all' : 'ready-to-unpack')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'ready-to-unpack'
                    ? 'bg-accent-sage text-white shadow-2xs font-semibold'
                    : 'bg-accent-sage-tint text-accent-sage hover:bg-accent-sage/20'
                }`}
              >
                <Layers className="w-3 h-3 text-current" />
                <span>Ready for Synthesis ({readyThemes.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Qualitative Tag Filter Chips (if tags exist) */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[13px] text-text-muted uppercase tracking-wider font-semibold font-sans shrink-0 mr-1">
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

      {/* 4. Google Keep-Style 2-Column Vertical Masonry Card Grid or Ready Themes Grid */}
      {activeFilter === 'ready-to-unpack' ? (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-border-hairline">
            <h3 className="font-serif text-base font-semibold text-text-primary flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent-sage" />
              <span>Themes Ready for Synthesis</span>
            </h3>
            <span className="text-xs text-text-muted font-sans">{readyThemes.length} available</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyThemes.map(theme => (
              <div
                key={theme.id}
                onClick={() => onSelectTheme(theme)}
                className="bg-surface border border-border-hairline rounded-2xl p-5 hover:border-accent-sage hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between text-left group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelectTheme(theme)}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-sans">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-sage-tint text-accent-sage">
                      {theme.observationCount} observations
                    </span>
                    <span>{formatRelativeDate(theme.updatedAt)}</span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-text-primary group-hover:text-accent-sage transition-colors">
                    {theme.title}
                  </h4>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed line-clamp-3 font-sans">
                    {theme.currentSynthesis || 'Observations accumulated and ready to synthesize into trajectory insights.'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border-hairline flex items-center justify-between text-xs font-semibold text-accent-sage">
                  <span>Unpack Trajectory</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isLoading ? (
        <div className="text-center py-16 text-text-muted text-sm font-sans">
          Loading your reflection canvas...
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border-hairline rounded-2xl p-8 bg-surface space-y-3">
          <div className="w-10 h-10 rounded-full bg-accent-sage-tint text-accent-sage flex items-center justify-center mx-auto shadow-2xs">
            <Compass className="w-5 h-5" />
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
        <div className={
          filteredEntries.length === 1
            ? 'max-w-xl mx-auto'
            : filteredEntries.length === 2
            ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
        }>
          {filteredEntries.map(entry => {
            const hasLocation = Boolean(entry.locationContext?.name);
            const relativeDate = formatRelativeDate(entry.updatedAt || entry.createdAt);
            const isActive = entry.status === 'active';

            return (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className="bg-surface border border-border-hairline rounded-2xl p-4 md:p-5 hover:border-[#D5D0C7] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between text-left group relative"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelectEntry(entry)}
                aria-label={`Reflection: ${entry.title}`}
              >
                {/* Status Indicator & Header */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 text-[13px] text-text-muted font-sans">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-accent-sage font-medium">
                        <span className="w-2 h-2 rounded-full bg-accent-sage ring-2 ring-accent-sage/25 shrink-0" />
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

                  <div className="flex items-center gap-1.5 shrink-0">
                    {(entry.turns || []).some(t => t.isBookmarked || t.isPinned) && (
                      <span title="Contains bookmarked realizations">
                        <Bookmark className="w-3.5 h-3.5 text-[#3B7A57] fill-[#3B7A57]" />
                      </span>
                    )}
                    {entry.starred && (
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                </div>

                {/* Title (Literata / Source Serif 4) */}
                <h3 className="font-serif text-sm sm:text-base font-semibold text-text-primary tracking-tight leading-snug group-hover:text-accent-sage transition-colors">
                  {entry.title || 'Untitled Reflection'}
                </h3>

                {/* 3-4 Sentence Conversation Gist / AI Summary */}
                <p className="text-xs sm:text-[13px] text-text-primary/80 leading-relaxed line-clamp-6 my-2 font-sans">
                  {cleanProseSnippet(
                    entry.summary || (
                      entry.turns && entry.turns.length > 0
                        ? entry.turns[entry.turns.length - 1].content
                        : 'Reflection session in progress. Tap to open and continue dialogue.'
                    )
                  )}
                </p>

                {/* Stratum count & Qualitative Tags Chips */}
                <div className="flex items-center justify-between gap-1.5 mt-2 pt-2 border-t border-border-hairline/60">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {entry.tags && entry.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-block text-xs font-medium px-2 py-0.5 rounded-md bg-[#F4F3EE] text-text-muted font-sans border border-border-hairline/40"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {(entry.stratumCount || 0) > 0 && (
                    <span className="font-stamp text-[10px] px-1.5 py-0.5 rounded bg-[#EAE6DC] text-[#191813] font-semibold shrink-0">
                      {entry.stratumCount} {entry.stratumCount === 1 ? 'stratum' : 'strata'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
