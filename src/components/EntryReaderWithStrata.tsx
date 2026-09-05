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
    <div className="min-h-screen bg-[#FAF9F6] text-[#191813] flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-20 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#DCD7CD] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-ui font-medium text-[#5A5648] hover:text-[#191813] bg-[#FAF9F6] hover:bg-[#EAE6DC] border border-[#DCD7CD] rounded-lg transition-colors cursor-pointer"
              title="Return to reflections"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#3B7A57]" />
              <span>Reflections</span>
            </button>

            <div className="h-4 w-px bg-[#DCD7CD] hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="font-stamp text-xs text-[#5A5648] uppercase tracking-wider">
                The Page is Set · Immutable
              </span>
              <span className="font-stamp text-xs px-2 py-0.5 bg-[#EAE6DC] text-[#191813] rounded font-semibold">
                {strata.length} {strata.length === 1 ? 'stratum' : 'strata'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onViewThemes && (
              <button
                onClick={onViewThemes}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-ui font-medium text-[#3B7A57] bg-[#DCEEE3] hover:bg-[#CFE8D7] rounded-lg transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Themes</span>
              </button>
            )}

            {onNewReflection && (
              <button
                onClick={onNewReflection}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-ui font-semibold text-white bg-[#3B7A57] hover:bg-[#2E6145] rounded-lg transition-colors cursor-pointer shadow-xs"
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
            <section className="space-y-3 pb-6 border-b border-[#DCD7CD]">
              <div className="flex items-center gap-2 flex-wrap text-xs font-stamp text-[#5A5648]">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#3B7A57]" />
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
                      <MapPin className="w-3 h-3 text-[#3B7A57]" />
                      <span>{entry.locationContext.name}</span>
                    </span>
                  </>
                )}
              </div>

              <h1 className="font-leaf text-2xl sm:text-3xl lg:text-4xl font-bold text-[#191813] leading-tight">
                {entry.title}
              </h1>

              {entry.summary && (
                <div className="p-4 bg-[#FFFFFF] border-l-3 border-[#3B7A57] rounded-r-lg shadow-2xs font-leaf text-sm sm:text-base text-[#191813] leading-relaxed italic">
                  "{entry.summary}"
                </div>
              )}
            </section>

            {/* Selection Hint Callout */}
            <div className="p-3 bg-[#EAE6DC]/60 rounded-lg border border-[#DCD7CD] flex items-center justify-between text-xs font-ui text-[#5A5648]">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#3B7A57] shrink-0" />
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
                className="underline hover:text-[#191813] font-medium cursor-pointer shrink-0 ml-2"
              >
                Annotate overall entry
              </button>
            </div>

            {/* Full Immutable Conversational Transcript */}
            <div className="space-y-6">
              {turns.length === 0 ? (
                <p className="font-leaf text-base text-[#5A5648] italic">
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
                          ? 'bg-[#FFFFFF] border-[#DCD7CD] shadow-2xs'
                          : 'bg-[#F4F1EA]/60 border-[#DCD7CD]/60'
                      }`}
                    >
                      {/* Author Line */}
                      <div className="flex items-center justify-between gap-2 mb-3 text-xs font-stamp text-[#5A5648] border-b border-[#DCD7CD]/50 pb-2">
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
                      <div className="font-leaf text-base sm:text-lg text-[#191813] leading-relaxed whitespace-pre-wrap selection:bg-[#8A3A22]/20 selection:text-[#191813]">
                        {turn.content}
                      </div>

                      {/* Bookmark Indicator if marked */}
                      {(turn.isBookmarked || turn.isPinned) && (
                        <div className="mt-3 pt-2 border-t border-[#DCD7CD]/40 flex items-center gap-1.5 text-xs font-stamp text-[#3B7A57]">
                          <Bookmark className="w-3.5 h-3.5 fill-current" />
                          <span>Bookmarked realization</span>
                        </div>
                      )}

                      {/* Marginalia Anchor Badges */}
                      {matchingStrata.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-[#8A3A22]/30 flex items-center gap-2 flex-wrap">
                          <span className="font-stamp text-[10px] text-[#8A3A22] uppercase tracking-wider">
                            Annotated in margins:
                          </span>
                          {matchingStrata.map((s) => (
                            <span
                              key={s.id}
                              className="font-stamp text-[11px] px-2 py-0.5 rounded bg-[#8A3A22]/10 text-[#8A3A22] border border-[#8A3A22]/30"
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
              <div className="flex items-center justify-between pb-2 border-b border-[#DCD7CD]">
                <div>
                  <h2 className="font-ui text-sm font-bold uppercase tracking-wider text-[#191813]">
                    The Margins
                  </h2>
                  <p className="font-stamp text-xs text-[#5A5648]">
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-ui font-medium text-white bg-[#3B7A57] hover:bg-[#2E6145] rounded-md transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Write Note</span>
                  </button>
                )}
              </div>

              {/* Active Stratum Composer */}
              {isComposing && (
                <div className="p-4 bg-[#FFFFFF] border-2 border-[#8A3A22] rounded-xl shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-stamp text-xs font-bold text-[#8A3A22] uppercase tracking-wider">
                      {parentStratumId ? 'Annotate Note (Depth 2)' : 'New Margin Stratum'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsComposing(false);
                        setSelectedTextAnchor(null);
                        setParentStratumId(null);
                      }}
                      className="text-xs text-[#5A5648] hover:text-[#191813] underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {selectedTextAnchor && (
                    <div className="p-2 bg-[#FAF9F6] border-l-2 border-[#8A3A22] text-xs font-leaf italic text-[#5A5648] rounded-r">
                      "{selectedTextAnchor.quotedText.slice(0, 90)}..."
                    </div>
                  )}

                  {/* Semantic Stance Picker */}
                  <div className="space-y-1">
                    <label className="font-ui text-[11px] font-semibold text-[#5A5648] uppercase tracking-wider">
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
                                : 'border-[#DCD7CD] text-[#5A5648] hover:bg-[#FAF9F6]'
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
                    className="w-full p-2.5 text-xs sm:text-sm font-leaf bg-[#FAF9F6] border border-[#DCD7CD] rounded-lg focus:outline-none focus:border-[#8A3A22] text-[#191813] leading-relaxed resize-y"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-stamp text-[11px] text-[#5A5648]">
                      {formatTemporalDistance(calculateDaysLater(entry.concludedAt || entry.createdAt))}
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveNewStratum}
                      disabled={!draftContent.trim()}
                      className="px-3 py-1.5 bg-[#8A3A22] hover:bg-[#722F1B] text-white rounded-md text-xs font-ui font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      Seal in Margin
                    </button>
                  </div>
                </div>
              )}

              {/* Strata Feed in Margin */}
              <div className="space-y-4">
                {isLoadingStrata ? (
                  <p className="font-stamp text-xs text-[#5A5648]">Loading margin strata...</p>
                ) : strata.length === 0 ? (
                  <div className="text-center py-8 px-4 border border-dashed border-[#DCD7CD] rounded-xl">
                    <p className="font-ui text-xs font-semibold text-[#191813] mb-1">
                      No strata recorded yet
                    </p>
                    <p className="font-leaf text-xs text-[#5A5648]">
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
                        className={`p-3.5 bg-[#FFFFFF] border-l-3 ${style.borderClass} border-t border-r border-b border-[#DCD7CD] rounded-r-lg shadow-2xs space-y-2 relative transition-all`}
                      >
                        {/* Temporal Distance & Stance Badge */}
                        <div className="flex items-center justify-between text-[11px] font-stamp">
                          <span className={`px-1.5 py-0.5 rounded ${style.bgClass} ${style.inkClass} font-semibold uppercase tracking-wider`}>
                            {style.label}
                          </span>
                          <span className="text-[#5A5648]">
                            {formatTemporalDistance(s.daysLater)}
                          </span>
                        </div>

                        {/* Anchored text fragment if present */}
                        {s.anchor?.quotedText && (
                          <div className="text-[11px] font-leaf italic text-[#5A5648] pl-2 border-l-2 border-[#DCD7CD]">
                            "{s.anchor.quotedText.slice(0, 80)}..."
                          </div>
                        )}

                        {/* Stratum Body */}
                        <p className="font-leaf text-xs sm:text-sm text-[#191813] leading-relaxed whitespace-pre-wrap">
                          {s.bodyMarkdown}
                        </p>

                        {/* Note Actions */}
                        <div className="flex items-center justify-between pt-1 border-t border-[#DCD7CD]/40 text-[10px] font-stamp text-[#5A5648]">
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
                                className="text-[#3B7A57] hover:underline cursor-pointer flex items-center gap-0.5"
                              >
                                <CornerDownRight className="w-2.5 h-2.5" />
                                <span>Annotate</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteStratum(s.id)}
                              className="text-[#8A3A22] hover:underline cursor-pointer"
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
