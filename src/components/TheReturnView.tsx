import React from 'react';
import { ArrowLeft, Clock, Bookmark, ArrowRight, CornerRightDown, BookOpen } from 'lucide-react';
import { ReturnCandidate, Entry } from '../types';
import { formatTemporalDistance, calculateDaysLater } from '../services/strataService';

interface TheReturnViewProps {
  candidate: ReturnCandidate;
  onWriteInMargin: (entry: Entry) => void;
  onDismiss: () => void;
  onSelectOtherEntry?: (entryId: string) => void;
}

export const TheReturnView: React.FC<TheReturnViewProps> = ({
  candidate,
  onWriteInMargin,
  onDismiss,
  onSelectOtherEntry,
}) => {
  const { entry, strata, reason, evidence, contradictingEntry } = candidate;
  const concludedTime = entry.concludedAt ? new Date(entry.concludedAt) : new Date(entry.createdAt);
  const elapsedDays = calculateDaysLater(entry.concludedAt || entry.createdAt);
  const turns = entry.turns || [];

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col font-sans">
      {/* Top Provenance Bar */}
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-md border-b border-border-hairline px-4 sm:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-ui text-text-muted hover:text-text-primary bg-canvas hover:bg-surface border border-border-hairline rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-accent-sage" />
            <span>Sanctuary</span>
          </button>

          {/* Machine Provenance in Courier Prime Mono */}
          <div className="flex items-center gap-2 font-stamp text-xs text-text-muted text-right truncate">
            <span className="hidden sm:inline">Looking back ·</span>
            <span className="text-text-primary font-semibold truncate">{evidence}</span>
          </div>
        </div>
      </header>

      {/* Main Single-Entry Reading Measure */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-14 space-y-8 animate-fade-in">
        {/* Contradiction Callout Banner if detected */}
        {reason === 'contradiction' && contradictingEntry && (
          <div className="p-4 sm:p-5 bg-vermilion/10 border-l-3 border-vermilion rounded-r-xl space-y-2">
            <div className="flex items-center gap-1.5 font-stamp text-xs font-bold text-vermilion uppercase tracking-wider">
              <span>Contradiction Observed</span>
            </div>
            <p className="font-leaf text-sm text-text-primary leading-relaxed">
              You wrote this when you felt <em>{entry.mood || 'one way'}</em>. In{' '}
              <strong>"{contradictingEntry.title}"</strong> ({contradictingEntry.date}) you reached an alternate realization. Both belong to you.
            </p>
            {onSelectOtherEntry && (
              <button
                type="button"
                onClick={() => onSelectOtherEntry(contradictingEntry.id)}
                className="inline-flex items-center gap-1 text-xs font-ui font-semibold text-vermilion hover:underline cursor-pointer pt-1"
              >
                <span>Read "{contradictingEntry.title}"</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Entry Title & Metadata */}
        <div className="space-y-3 pb-6 border-b border-border-hairline">
          <div className="font-stamp text-xs text-text-muted flex items-center gap-2">
            <span>{concludedTime.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>·</span>
            <span>{formatTemporalDistance(elapsedDays)}</span>
            {entry.category && (
              <>
                <span>·</span>
                <span className="px-1.5 py-0.5 bg-canvas border border-border-hairline rounded text-text-primary font-medium">{entry.category}</span>
              </>
            )}
          </div>

          <h1 className="font-leaf text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary leading-snug">
            {entry.title}
          </h1>

          {entry.summary && (
            <div className="p-4 bg-surface border-l-3 border-accent-sage rounded-r-lg shadow-2xs font-leaf text-base text-text-primary italic leading-relaxed">
              "{entry.summary}"
            </div>
          )}
        </div>

        {/* Reading Measure in Literata (20px/1.78) */}
        <div className="space-y-6">
          {turns.length === 0 ? (
            <p className="font-leaf text-lg text-text-muted italic">
              No conversational transcript stored.
            </p>
          ) : (
            turns.map((turn, idx) => {
              const isUser = turn.role === 'user';
              return (
                <article
                  key={turn.id || idx}
                  className={`p-5 rounded-xl border transition-all ${
                    isUser
                      ? 'bg-surface border-border-hairline shadow-2xs'
                      : 'bg-surface/50 border-border-hairline/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-stamp text-text-muted mb-2 pb-1.5 border-b border-border-hairline/40">
                    <span className="uppercase tracking-wider font-semibold">
                      {isUser ? 'Your Words' : 'Reflection Partner'}
                    </span>
                    <span>
                      {new Date(turn.createdAt || turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="font-leaf text-base sm:text-lg text-text-primary leading-relaxed whitespace-pre-wrap">
                    {turn.content}
                  </div>

                  {turn.note && (
                    <div className="mt-3 p-2 bg-canvas border border-border-hairline rounded text-xs font-stamp text-text-muted">
                      <span className="font-medium text-text-primary">Note: </span>
                      {turn.note}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        {/* Existing Strata Preview if any */}
        {strata.length > 0 && (
          <section className="pt-6 border-t border-border-hairline space-y-3">
            <h3 className="font-ui text-xs font-bold uppercase tracking-wider text-text-muted">
              Existing Margin Notes ({strata.length})
            </h3>
            <div className="space-y-2.5">
              {strata.map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-surface border border-border-hairline rounded-lg text-xs font-leaf text-text-primary space-y-1"
                >
                  <div className="flex items-center justify-between font-stamp text-[11px] text-text-muted">
                    <span className="uppercase font-semibold text-vermilion">{s.stance}</span>
                    <span>{formatTemporalDistance(s.daysLater)}</span>
                  </div>
                  <p>{s.bodyMarkdown}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Sticky Action Bar */}
        <div className="pt-8 pb-12 flex items-center justify-between gap-4 border-t border-border-hairline">
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs font-ui text-text-muted hover:text-text-primary cursor-pointer"
          >
            Not today
          </button>

          <button
            type="button"
            onClick={() => onWriteInMargin(entry)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-vermilion hover:opacity-90 text-white rounded-xl font-ui font-semibold text-sm transition-all shadow-xs hover:shadow cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Write in the margin</span>
          </button>
        </div>
      </main>
    </div>
  );
};
