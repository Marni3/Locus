import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  MessageSquare, 
  Bookmark, 
  Lock, 
  Columns, 
  Clock, 
  Layers, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle2,
  Sparkles,
  Minimize2
} from 'lucide-react';

export interface WalkthroughStep {
  id: string;
  title: string;
  subtitle: string;
  narrative: string;
  icon: React.ElementType;
  badge: string;
  sampleActionLabel?: string;
  onSampleAction?: () => void;
  illustrationNote?: string;
}

interface WalkthroughOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSampleReflection?: (sampleText: string) => void;
  onOpenThemes?: () => void;
  onOpenReturn?: () => void;
  onOpenBookmarks?: () => void;
}

export const WalkthroughOverlay: React.FC<WalkthroughOverlayProps> = ({
  isOpen,
  onClose,
  onStartSampleReflection,
  onOpenThemes,
  onOpenReturn,
  onOpenBookmarks,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const steps: WalkthroughStep[] = [
    {
      id: 'canvas',
      title: 'The Reflections Canvas',
      subtitle: 'A tactile, calm space for personal inquiry',
      narrative: 'Welcome to Locus. This is your personal sanctuary—a calm, tactile space for your daily reflections organized as thoughtful cards. No algorithmic feeds, gamified streaks, or enterprise clutter: only your thoughts resting on an archival paper substrate.',
      icon: BookOpen,
      badge: 'Step 1 of 7 · Foundation',
      illustrationNote: 'Masonry cards with category tags, mood indicators, and temporal stamps.',
    },
    {
      id: 'companion',
      title: 'Starting a Reflection',
      subtitle: 'Solving the blank page without conversational fatigue',
      narrative: 'Starting a reflection is effortless. When you open a session, you are greeted by an attentive conversational companion that listens, reframes, and inquires rather than diagnosing. You can write a spontaneous check-in or explore an open question.',
      icon: MessageSquare,
      badge: 'Step 2 of 7 · Active Writing',
      sampleActionLabel: 'Try: "I\'m feeling good today"',
      onSampleAction: () => {
        onStartSampleReflection?.("I'm feeling good today");
        onClose();
      },
      illustrationNote: 'Sample prompt: "I\'m feeling good today" initiates immediate gentle mirroring.',
    },
    {
      id: 'bookmarks',
      title: 'Bookmarking Key Realizations',
      subtitle: 'Replacing pins with intentional bookmarks',
      narrative: 'During a reflection, meaningful epiphanies emerge. Instead of ephemeral pins, Locus allows you to Bookmark specific passages. Bookmarks gather in a dedicated drawer where you can view them chronologically or grouped by reflection.',
      icon: Bookmark,
      badge: 'Step 3 of 7 · Preserving Insights',
      sampleActionLabel: 'View Bookmarks Drawer',
      onSampleAction: () => {
        onOpenBookmarks?.();
        onClose();
      },
      illustrationNote: 'Click the Bookmark ribbon on any turn to archive it into your permanent ledger.',
    },
    {
      id: 'sealing',
      title: 'Finite Pages & Page Sealing',
      subtitle: 'Like a real physical notebook, entries have an end',
      narrative: 'Like a real journal, entries in Locus have an end. When your reflection reaches natural closure, click [ Conclude & Seal ]. If left unattended, Locus auto-concludes the session after 2 hours. Once sealed, the page becomes permanently immutable—protecting the integrity of who you were when you wrote it.',
      icon: Lock,
      badge: 'Step 4 of 7 · Immutability',
      illustrationNote: 'Sealing freezes turns into an immutable historical record with cryptographic hash integrity.',
    },
    {
      id: 'margins',
      title: 'The Strata Margin Layer',
      subtitle: 'Revisiting past thoughts without rewriting history',
      narrative: 'How do you revisit a sealed entry? You don\'t rewrite history—you write in the margins. Just like marginalia in an antique book, your margin notes are stamped with temporal distance ("written 94 days later") and semantic ink stances (Correction, Confirmation, Question, Grief, Gratitude). The AI remains completely silent in the margins; this space is strictly yours.',
      icon: Columns,
      badge: 'Step 5 of 7 · Strata Marginalia',
      illustrationNote: '2-column reader with a recessed paper-deep margin gutter and Courier Prime temporal stamps.',
    },
    {
      id: 'the-return',
      title: 'The Return: One Page a Day',
      subtitle: 'Solving the forgotten notebook problem',
      narrative: 'To ensure your insights don\'t gather digital dust, Locus surfaces exactly one past entry each day through The Return. It routes with explainable purpose: on anniversaries ("written 1 year ago today"), open threads, or when a past entry contradicts a current belief. It offers zero AI commentary, simply inviting you: "Write in the margin."',
      icon: Clock,
      badge: 'Step 6 of 7 · Daily Archivist',
      sampleActionLabel: 'Explore The Return',
      onSampleAction: () => {
        onOpenReturn?.();
        onClose();
      },
      illustrationNote: 'Full-bleed single entry with provenance banner and contradiction comparison.',
    },
    {
      id: 'themes',
      title: 'Longitudinal Themes & Constellation',
      subtitle: 'Watching your intellectual trajectories evolve over time',
      narrative: 'As you reflect and annotate across weeks and months, the synthesis engine clusters discrete observations into longitudinal Themes. Visit the Themes screen to explore an interactive concept graph, trace your observation trajectories, and unpack deep thematic essays.',
      icon: Layers,
      badge: 'Step 7 of 7 · Synthesis',
      sampleActionLabel: 'Open Themes Constellation',
      onSampleAction: () => {
        onOpenThemes?.();
        onClose();
      },
      illustrationNote: 'Interactive SVG concept graph linking recurring themes and chronological observations.',
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        setCurrentStepIndex((prev) => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, steps.length, onClose]);

  const handleDismiss = () => {
    try {
      localStorage.setItem('locus_walkthrough_seen', 'true');
    } catch {}
    onClose();
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div 
        id="walkthrough-minimized-pill"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 bg-[#FAF9F6] border border-[#3B7A57]/40 shadow-xl rounded-full px-4 py-2.5 flex items-center gap-2.5 cursor-pointer hover:border-[#3B7A57] hover:shadow-2xl transition-all animate-fade-in group"
        role="button"
        tabIndex={0}
        aria-label="Expand guided walkthrough"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#3B7A57] animate-pulse" />
        <span className="font-ui text-xs font-semibold text-[#191813]">
          Guided Tour · Step {currentStepIndex + 1} of {steps.length}
        </span>
        <span className="font-stamp text-[11px] text-[#3B7A57] font-medium ml-1 group-hover:underline">
          Expand ↗
        </span>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const IconComponent = currentStep.icon;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#191813]/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="walkthrough-title"
    >
      <div 
        id="walkthrough-modal"
        className="w-full max-w-xl bg-[#FAF9F6] border border-[#DCD7CD] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Top Progress Bar */}
        <div className="w-full bg-[#EAE6DC] h-1.5 flex">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-full flex-1 transition-all duration-300 ${
                idx <= currentStepIndex ? 'bg-[#3B7A57]' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-2 flex items-center justify-between border-b border-[#EAE6DC]">
          <div className="flex items-center gap-2.5">
            <span className="font-stamp text-xs text-[#5A5648] uppercase tracking-wider font-semibold">
              {currentStep.badge}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="walkthrough-minimize-btn"
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg text-[#5A5648] hover:text-[#191813] hover:bg-[#EAE6DC] transition-colors cursor-pointer"
              title="Minimize walkthrough"
              aria-label="Minimize walkthrough"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-[#5A5648] hover:text-[#191813] hover:bg-[#EAE6DC] transition-colors cursor-pointer"
              aria-label="Close walkthrough"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 sm:p-8 space-y-5 flex-1">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#DCEEE3] text-[#3B7A57] flex items-center justify-center shrink-0 shadow-2xs">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h2 id="walkthrough-title" className="font-serif text-xl sm:text-2xl font-bold text-[#191813] tracking-tight leading-snug">
                {currentStep.title}
              </h2>
              <p className="font-ui text-xs sm:text-sm text-[#5A5648] mt-0.5">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          <p className="font-reading text-sm sm:text-base text-[#191813]/90 leading-relaxed bg-[#FFFFFF] p-4 rounded-xl border border-[#EAE6DC] shadow-2xs">
            {currentStep.narrative}
          </p>

          {/* Contextual Illustration or Callout */}
          {currentStep.illustrationNote && (
            <div className="p-3 bg-[#F4F3EE] rounded-lg border border-[#EAE6DC] flex items-center gap-2.5 text-xs text-[#5A5648]">
              <Sparkles className="w-3.5 h-3.5 text-[#3B7A57] shrink-0" />
              <span className="font-stamp text-[11px] leading-tight">
                {currentStep.illustrationNote}
              </span>
            </div>
          )}

          {/* Optional Action Button */}
          {currentStep.sampleActionLabel && currentStep.onSampleAction && (
            <div className="pt-1">
              <button
                onClick={currentStep.onSampleAction}
                className="w-full py-2.5 px-4 rounded-xl bg-[#DCEEE3] hover:bg-[#cbe6d4] text-[#3B7A57] font-ui text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs border border-[#3B7A57]/30"
              >
                <span>{currentStep.sampleActionLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-6 pt-3 bg-[#F4F3EE] border-t border-[#EAE6DC] flex items-center justify-between">
          <button
            onClick={handleDismiss}
            className="text-xs font-ui text-[#5A5648] hover:text-[#191813] transition-colors cursor-pointer px-2 py-1"
          >
            Skip Walkthrough
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={isFirst}
              className={`p-2 rounded-xl border text-xs font-ui transition-all flex items-center gap-1 ${
                isFirst
                  ? 'border-transparent text-black/20 cursor-not-allowed'
                  : 'border-[#DCD7CD] bg-white text-[#191813] hover:bg-[#EAE6DC] cursor-pointer'
              }`}
              aria-label="Previous step"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>

            {isLast ? (
              <button
                id="walkthrough-finish-btn"
                onClick={handleDismiss}
                className="px-4 py-2 rounded-xl bg-[#3B7A57] hover:bg-[#2E5A36] text-white text-xs sm:text-sm font-ui font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Begin Reflecting</span>
              </button>
            ) : (
              <button
                id="walkthrough-next-btn"
                onClick={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
                className="px-4 py-2 rounded-xl bg-[#3B7A57] hover:bg-[#2E5A36] text-white text-xs sm:text-sm font-ui font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
