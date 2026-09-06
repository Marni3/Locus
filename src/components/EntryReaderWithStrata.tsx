import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, 
  Bookmark, 
  Clock, 
  MapPin, 
  Tag, 
  Plus, 
  Check, 
  CornerDownRight, 
  MessageSquare, 
  Layers, 
  Trash2,
  Calendar,
  Sparkles,
  Compass
} from 'lucide-react';
import { Entry, Stratum, StratumStance, Message } from '../types';
import { 
  fetchStrataForEntry, 
  saveStratum, 
  deleteStratum, 
  formatTemporalDistance, 
  calculateDaysLater,
  getStanceSemanticColor,
  getSampleDemoStrata
} from '../services/strataService';

interface EntryReaderWithStrataProps {
  entry: Entry;
  onBack: () => void;
  onViewThemes?: () => void;
  onNewReflection?: () => void;
  onUpdateEntry?: (entry: Entry) => void;
}

export const EntryReaderWithStrata: React.FC<EntryReaderWithStrataProps> = ({
  entry,
  onBack,
  onViewThemes,
  onNewReflection,
  onUpdateEntry,
}) => {
  const [strata, setStrata] = useState<Stratum[]>([]);
  const [isLoadingStrata, setIsLoadingStrata] = useState(true);

  // New stratum draft state
  const [isComposing, setIsComposing] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [draftStance, setDraftStance] = useState<StratumStance>('correction');
  const [selectedTextAnchor, setSelectedTextAnchor] = useState<{
    turnId?: string;
    startOffset: number;
    endOffset: number;
    quotedText: string;
  } | null>(null);
  const [parentStratumId, setParentStratumId] = useState<string | null>(null);

  const readingAreaRef = useRef<HTMLDivElement>(null);

  // Load strata on mount or entry change
  useEffect(() => {
    let isMounted = true;
    const loadStrata = async () => {
      setIsLoadingStrata(true);
      try {
        let loaded = await fetchStrataForEntry(entry.userId, entry.id);
        // Inject demo sample strata if demo entry and empty
        if (loaded.length === 0 && entry.isDemo) {
          loaded = getSampleDemoStrata(entry.id, entry.userId);
        }
        if (isMounted) {
          setStrata(loaded);
        }
      } catch (err) {
        console.error('Failed to load strata:', err);
      } finally {
        if (isMounted) setIsLoadingStrata(false);
      }
    };
    loadStrata();
    return () => {
      isMounted = false;
    };
  }, [entry.id, entry.userId, entry.isDemo]);

  // Capture user text selection in reading area
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();
    if (text.length >= 3 && text.length <= 400) {
      setSelectedTextAnchor({
        quotedText: text,
        startOffset: 0,
        endOffset: text.length,
      });
      setParentStratumId(null);
      setIsComposing(true);
    }
  };

  const handleSaveNewStratum = async () => {
    if (!draftContent.trim()) return;

    const concludedDate = entry.concludedAt || entry.createdAt;
    const nowIso = new Date().toISOString();
    const daysLater = calculateDaysLater(concludedDate, nowIso);

    // Calculate depth
    let depth: 1 | 2 | 3 = 1;
    if (parentStratumId) {
      const parent = strata.find((s) => s.id === parentStratumId);
      if (parent) {
        depth = Math.min(3, parent.depth + 1) as 1 | 2 | 3;
      }
    }

    const newStratum: Stratum = {
      id: `stratum-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      entryId: entry.id,
      userId: entry.userId,
      parentStratumId: parentStratumId || null,
      anchor: selectedTextAnchor,
      bodyMarkdown: draftContent.trim(),
      depth,
      daysLater,
      stance: draftStance,
      createdAt: nowIso,
      sealedAt: nowIso,
      isDemo: entry.isDemo,
    };

    const updatedStrata = [...strata, newStratum];
    setStrata(updatedStrata);

    // Update parent entry denormalized count
    if (onUpdateEntry) {
      onUpdateEntry({
        ...entry,
        stratumCount: updatedStrata.length,
      });
    }

    // Persist
    await saveStratum(entry.userId, newStratum);

    // Reset composer
    setDraftContent('');
    setSelectedTextAnchor(null);
    setParentStratumId(null);
    setIsComposing(false);
  };

  const handleDeleteStratum = async (stratumId: string) => {
    const updated = strata.filter((s) => s.id !== stratumId);
    setStrata(updated);
    if (onUpdateEntry) {
      onUpdateEntry({
        ...entry,
        stratumCount: updated.length,
      });
    }
    await deleteStratum(entry.userId, entry.id, stratumId);
  };

  const turns = entry.turns || [];
  const concludedTime = entry.concludedAt ? new Date(entry.concludedAt) : new Date(entry.createdAt);

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-md border-b border-border-hairline px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-ui font-medium text-text-muted hover:text-text-primary bg-canvas hover:bg-surface border border-border-hairline rounded-lg transition-colors cursor-pointer"
              title="Return to reflections"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-accent-sage" />
              <span>Reflections</span>
            </button>

            <div className="h-4 w-px bg-border-hairline hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="font-stamp text-xs text-text-muted uppercase tracking-wider">
                The Page is Set · Immutable
              </span>
              <span className="font-stamp text-xs px-2 py-0.5 bg-canvas border border-border-hairline text-text-muted rounded font-semibold">
                {strata.length} {strata.length === 1 ? 'stratum' : 'strata'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onViewThemes && (
              <button
                onClick={onViewThemes}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-ui font-medium text-accent-sage bg-accent-sage-tint hover:opacity-90 rounded-lg transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Themes</span>
              </button>
            )}

            {onNewReflection && (
              <button
                onClick={onNewReflection}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-ui font-semibold text-white bg-accent-sage hover:opacity-90 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Reflection</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main 2-Column Archival Reader Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left / Center: Reading Measure (34-36rem) */}
          <main 
            ref={readingAreaRef}
            onMouseUp={handleMouseUp}
            className="lg:col-span-8 space-y-8"
          >
            {/* Entry Title & Historical Header */}
            <section className="space-y-3 pb-6 border-b border-border-hairline">
              <div className="flex items-center gap-2 flex-wrap text-xs font-stamp text-text-muted">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-accent-sage" />
                  <span>
                    Concluded {concludedTime.toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </span>

                {entry.category && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>{entry.category}</span>
                    </span>
                  </>
                )}

                {entry.locationContext?.name && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-accent-sage" />
                      <span>{entry.locationContext.name}</span>
                    </span>
                  </>
                )}
              </div>

              <h1 className="font-leaf text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary leading-tight">
                {entry.title}
              </h1>

              {entry.summary && (
                <div className="p-4 bg-surface border-l-3 border-accent-sage rounded-r-lg shadow-2xs font-leaf text-sm sm:text-base text-text-primary leading-relaxed italic">
                  "{entry.summary}"
                </div>
              )}
            </section>

            {/* Selection Hint Callout */}
            <div className="p-3 bg-canvas rounded-lg border border-border-hairline flex items-center justify-between text-xs font-ui text-text-muted">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-accent-sage shrink-0" />
                <span>
                  <strong>Tip:</strong> Highlight any passage in this reflection to anchor a note in the margin.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedTextAnchor(null);
                  setParentStratumId(null);
                  setIsComposing(true);
                }}
                className="underline hover:text-text-primary font-medium cursor-pointer shrink-0 ml-2"
              >
                Annotate overall entry
              </button>
            </div>

            {/* Full Immutable Conversational Transcript */}
            <div className="space-y-6">
              {turns.length === 0 ? (
                <p className="font-leaf text-base text-text-muted italic">
                  No conversational transcript recorded for this reflection.
                </p>
              ) : (
                turns.map((turn, index) => {
                  const isUser = turn.role === 'user';
                  // Check if any stratum is anchored to this turn
                  const matchingStrata = strata.filter(
                    (s) => s.anchor?.quotedText && turn.content.includes(s.anchor.quotedText)
                  );

                  return (
                    <article
                      key={turn.id || index}
                      id={`reader-turn-${turn.id || index}`}
                      className={`relative p-5 sm:p-6 rounded-xl border transition-all ${
                        isUser
                          ? 'bg-surface border-border-hairline shadow-2xs'
                          : 'bg-surface/50 border-border-hairline/60'
                      }`}
                    >
                      {/* Author Line */}
                      <div className="flex items-center justify-between gap-2 mb-3 text-xs font-stamp text-text-muted border-b border-border-hairline/50 pb-2">
                        <span className="font-semibold uppercase tracking-wider">
                          {isUser ? 'User Voice' : 'Reflection Partner'}
                        </span>
                        <span>
                          {new Date(turn.createdAt || turn.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Content in Literata Serif */}
                      <div className="font-leaf text-base sm:text-lg text-text-primary leading-relaxed whitespace-pre-wrap">
                        {turn.content}
                      </div>

                      {/* Bookmark Indicator if marked */}
                      {(turn.isBookmarked || turn.isPinned) && (
                        <div className="mt-3 pt-2 border-t border-border-hairline/40 flex items-center gap-1.5 text-xs font-stamp text-accent-sage">
                          <Bookmark className="w-3.5 h-3.5 fill-current" />
                          <span>Bookmarked realization</span>
                        </div>
                      )}

                      {/* Marginalia Anchor Badges */}
                      {matchingStrata.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border-hairline/60 flex items-center gap-2 flex-wrap">
                          <span className="font-stamp text-[10px] text-vermilion uppercase tracking-wider">
                            Annotated in margins:
                          </span>
                          {matchingStrata.map((s) => (
                            <span
                              key={s.id}
                              className="font-stamp text-[11px] px-2 py-0.5 rounded bg-vermilion/10 text-vermilion border border-vermilion/30"
                            >
                              {formatTemporalDistance(s.daysLater)}
                            </span>
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </main>

          {/* Right Column: Margins Column (Gutter on Desktop) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-20 space-y-6">
              {/* Margin Gutter Header */}
              <div className="flex items-center justify-between pb-2 border-b border-border-hairline">
                <div>
                  <h2 className="font-ui text-sm font-bold uppercase tracking-wider text-text-primary">
                    The Margins
                  </h2>
                  <p className="font-stamp text-xs text-text-muted">
                    Sediment of past re-reads across time
                  </p>
                </div>

                {!isComposing && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTextAnchor(null);
                      setParentStratumId(null);
                      setIsComposing(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-ui font-medium text-white bg-accent-sage hover:opacity-90 rounded-md transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Write Note</span>
                  </button>
                )}
              </div>

              {/* Active Stratum Composer */}
              {isComposing && (
                <div className="p-4 bg-surface border-2 border-vermilion rounded-xl shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-stamp text-xs font-bold text-vermilion uppercase tracking-wider">
                      {parentStratumId ? 'Annotate Note (Depth 2)' : 'New Margin Stratum'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsComposing(false);
                        setSelectedTextAnchor(null);
                        setParentStratumId(null);
                      }}
                      className="text-xs text-text-muted hover:text-text-primary underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {selectedTextAnchor && (
                    <div className="p-2 bg-canvas border-l-2 border-vermilion text-xs font-leaf italic text-text-muted rounded-r">
                      "{selectedTextAnchor.quotedText.slice(0, 90)}..."
                    </div>
                  )}

                  {/* Semantic Stance Picker */}
                  <div className="space-y-1">
                    <label className="font-ui text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                      Semantic Ink / Stance
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 text-xs font-stamp">
                      {(['correction', 'confirmation', 'question', 'grief', 'gratitude'] as StratumStance[]).map((st) => {
                        const style = getStanceSemanticColor(st);
                        const isSelected = draftStance === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setDraftStance(st)}
                            className={`px-2 py-1 rounded border text-left cursor-pointer transition-colors ${
                              isSelected
                                ? `${style.bgClass} ${style.inkClass} ${style.borderClass} font-bold shadow-2xs`
                                : 'border-border-hairline text-text-muted hover:bg-canvas'
                            }`}
                          >
                            {style.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Note Body Input */}
                  <textarea
                    rows={4}
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    placeholder="Write in the margins of your past self..."
                    className="w-full p-2.5 text-xs sm:text-sm font-leaf bg-canvas border border-border-hairline rounded-lg focus:outline-none focus:border-vermilion text-text-primary leading-relaxed resize-y"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-stamp text-[11px] text-text-muted">
                      {formatTemporalDistance(calculateDaysLater(entry.concludedAt || entry.createdAt))}
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveNewStratum}
                      disabled={!draftContent.trim()}
                      className="px-3 py-1.5 bg-vermilion hover:opacity-90 text-white rounded-md text-xs font-ui font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      Seal in Margin
                    </button>
                  </div>
                </div>
              )}

              {/* Strata Feed in Margin */}
              <div className="space-y-4">
                {isLoadingStrata ? (
                  <p className="font-stamp text-xs text-text-muted">Loading margin strata...</p>
                ) : strata.length === 0 ? (
                  <div className="text-center py-8 px-4 border border-dashed border-border-hairline rounded-xl">
                    <p className="font-ui text-xs font-semibold text-text-primary mb-1">
                      No strata recorded yet
                    </p>
                    <p className="font-leaf text-xs text-text-muted">
                      This page is set. Re-read it when you have lived further, and annotate how your thinking has evolved.
                    </p>
                  </div>
                ) : (
                  strata.map((s) => {
                    const style = getStanceSemanticColor(s.stance);
                    const isDepth2 = s.depth >= 2;

                    return (
                      <article
                        key={s.id}
                        style={{ marginLeft: isDepth2 ? '1rem' : '0' }}
                        className={`p-3.5 bg-surface border-l-3 ${style.borderClass} border-t border-r border-b border-border-hairline rounded-r-lg shadow-2xs space-y-2 relative transition-all`}
                      >
                        {/* Temporal Distance & Stance Badge */}
                        <div className="flex items-center justify-between text-[11px] font-stamp">
                          <span className={`px-1.5 py-0.5 rounded ${style.bgClass} ${style.inkClass} font-semibold uppercase tracking-wider`}>
                            {style.label}
                          </span>
                          <span className="text-text-muted">
                            {formatTemporalDistance(s.daysLater)}
                          </span>
                        </div>

                        {/* Anchored text fragment if present */}
                        {s.anchor?.quotedText && (
                          <div className="text-[11px] font-leaf italic text-text-muted pl-2 border-l-2 border-border-hairline">
                            "{s.anchor.quotedText.slice(0, 80)}..."
                          </div>
                        )}

                        {/* Stratum Body */}
                        <p className="font-leaf text-xs sm:text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                          {s.bodyMarkdown}
                        </p>

                        {/* Note Actions */}
                        <div className="flex items-center justify-between pt-1 border-t border-border-hairline/40 text-[10px] font-stamp text-text-muted">
                          <span>Depth {s.depth} of 3</span>
                          <div className="flex items-center gap-2">
                            {s.depth < 3 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setParentStratumId(s.id);
                                  setSelectedTextAnchor(null);
                                  setIsComposing(true);
                                }}
                                className="text-accent-sage hover:underline cursor-pointer flex items-center gap-0.5"
                              >
                                <CornerDownRight className="w-2.5 h-2.5" />
                                <span>Annotate</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteStratum(s.id)}
                              className="text-vermilion hover:underline cursor-pointer"
                              title="Delete stratum"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
