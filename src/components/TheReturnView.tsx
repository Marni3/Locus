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
    <div className="min-h-screen bg-[#FAF9F6] text-[#191813] flex flex-col font-sans">
      {/* Top Provenance Bar */}
      <header className="sticky top-0 z-20 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#DCD7CD] px-4 sm:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-ui text-[#5A5648] hover:text-[#191813] bg-[#FAF9F6] hover:bg-[#EAE6DC] border border-[#DCD7CD] rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#3B7A57]" />
            <span>Sanctuary</span>
          </button>

          {/* Machine Provenance in Courier Prime Mono */}
          <div className="flex items-center gap-2 font-stamp text-xs text-[#5A5648] text-right truncate">
            <span className="hidden sm:inline">Looking back ·</span>
            <span className="text-[#191813] font-semibold truncate">{evidence}</span>
          </div>
        </div>
      </header>

      {/* Main Single-Entry Reading Measure */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-14 space-y-8 animate-fade-in">
        {/* Contradiction Callout Banner if detected */}
        {reason === 'contradiction' && contradictingEntry && (
          <div className="p-4 sm:p-5 bg-[#8A3A22]/5 border-l-3 border-[#8A3A22] rounded-r-xl space-y-2">
            <div className="flex items-center gap-1.5 font-stamp text-xs font-bold text-[#8A3A22] uppercase tracking-wider">
              <span>Contradiction Observed</span>
            </div>
            <p className="font-leaf text-sm text-[#191813] leading-relaxed">
              You wrote this when you felt <em>{entry.mood || 'one way'}</em>. In{' '}
              <strong>"{contradictingEntry.title}"</strong> ({contradictingEntry.date}) you reached an alternate realization. Both belong to you.
            </p>
            {onSelectOtherEntry && (
              <button
                type="button"
                onClick={() => onSelectOtherEntry(contradictingEntry.id)}
                className="inline-flex items-center gap-1 text-xs font-ui font-semibold text-[#8A3A22] hover:underline cursor-pointer pt-1"
              >
                <span>Read "{contradictingEntry.title}"</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Entry Title & Metadata */}
        <div className="space-y-3 pb-6 border-b border-[#DCD7CD]">
          <div className="font-stamp text-xs text-[#5A5648] flex items-center gap-2">
            <span>{concludedTime.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>·</span>
            <span>{formatTemporalDistance(elapsedDays)}</span>
            {entry.category && (
              <>
                <span>·</span>
                <span className="px-1.5 py-0.5 bg-[#EAE6DC] rounded text-[#191813] font-medium">{entry.category}</span>
              </>
            )}
          </div>

          <h1 className="font-leaf text-2xl sm:text-3xl lg:text-4xl font-bold text-[#191813] leading-snug">
            {entry.title}
          </h1>

          {entry.summary && (
            <div className="p-4 bg-[#FFFFFF] border-l-3 border-[#3B7A57] rounded-r-lg shadow-2xs font-leaf text-base text-[#191813] italic leading-relaxed">
              "{entry.summary}"
            </div>
          )}
        </div>

        {/* Reading Measure in Literata (20px/1.78) */}
        <div className="space-y-6">
          {turns.length === 0 ? (
            <p className="font-leaf text-lg text-[#5A5648] italic">
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
                      ? 'bg-[#FFFFFF] border-[#DCD7CD] shadow-2xs'
                      : 'bg-[#F4F1EA]/60 border-[#DCD7CD]/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-stamp text-[#5A5648] mb-2 pb-1.5 border-b border-[#DCD7CD]/40">
                    <span className="uppercase tracking-wider font-semibold">
                      {isUser ? 'Your Words' : 'Reflection Partner'}
                    </span>
                    <span>
                      {new Date(turn.createdAt || turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="font-leaf text-base sm:text-lg text-[#191813] leading-relaxed whitespace-pre-wrap">
                    {turn.content}
                  </div>

                  {turn.note && (
                    <div className="mt-3 p-2 bg-[#FAF9F6] border border-[#DCD7CD] rounded text-xs font-stamp text-[#5A5648]">
                      <span className="font-medium text-[#191813]">Note: </span>
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
          <section className="pt-6 border-t border-[#DCD7CD] space-y-3">
            <h3 className="font-ui text-xs font-bold uppercase tracking-wider text-[#5A5648]">
              Existing Margin Notes ({strata.length})
            </h3>
            <div className="space-y-2.5">
              {strata.map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-[#FFFFFF] border border-[#DCD7CD] rounded-lg text-xs font-leaf text-[#191813] space-y-1"
                >
                  <div className="flex items-center justify-between font-stamp text-[11px] text-[#5A5648]">
                    <span className="uppercase font-semibold text-[#8A3A22]">{s.stance}</span>
                    <span>{formatTemporalDistance(s.daysLater)}</span>
                  </div>
                  <p>{s.bodyMarkdown}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Sticky Action Bar */}
        <div className="pt-8 pb-12 flex items-center justify-between gap-4 border-t border-[#DCD7CD]">
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs font-ui text-[#5A5648] hover:text-[#191813] cursor-pointer"
          >
            Not today
          </button>

          <button
            type="button"
            onClick={() => onWriteInMargin(entry)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8A3A22] hover:bg-[#722F1B] text-white rounded-xl font-ui font-semibold text-sm transition-all shadow-xs hover:shadow cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Write in the margin</span>
          </button>
        </div>
      </main>
    </div>
  );
};
