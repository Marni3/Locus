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
  Minimize2
} from 'lucide-react';

export interface WalkthroughStep {
  id: string;
  title: string;
  subtitle: string;
  narrative: string;
  icon: React.ElementType;
  badge: string;
}

interface WalkthroughOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onStepChange?: (stepIndex: number, stepId: string) => void;
  onStartSampleReflection?: (sampleText: string) => void;
  onOpenThemes?: () => void;
  onOpenReturn?: () => void;
  onOpenBookmarks?: () => void;
}

export const WalkthroughOverlay: React.FC<WalkthroughOverlayProps> = ({
  isOpen,
  onClose,
  onStepChange,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const steps: WalkthroughStep[] = [
    {
      id: 'canvas',
      title: 'The Reflections Canvas',
      subtitle: 'Archival cards & personal sanctuary',
      narrative: 'A calm, tactile space for your daily reflections. No streaks, gamification, or enterprise clutter—only your thoughts on archival paper.',
      icon: BookOpen,
      badge: 'Step 1 of 7 · Canvas',
    },
    {
      id: 'companion',
      title: 'Starting a Reflection',
      subtitle: 'Attentive conversational partner',
      narrative: 'Open an active session to think out loud. Your companion listens, mirrors, and prompts deeper inquiry rather than prescribing answers.',
      icon: MessageSquare,
      badge: 'Step 2 of 7 · Dialogue',
    },
    {
      id: 'bookmarks',
      title: 'Bookmarking Key Realizations',
      subtitle: 'Preserving pivotal epiphanies',
      narrative: 'Bookmark meaningful turns into your permanent insight ledger, always accessible from the top navigation bar.',
      icon: Bookmark,
      badge: 'Step 3 of 7 · Bookmarks',
    },
    {
      id: 'sealing',
      title: 'Finite Pages & Page Sealing',
      subtitle: 'Preserving historical integrity',
      narrative: 'Entries conclude and seal naturally or after 2 hours. Once sealed, a page is permanently immutable, protecting who you were when you wrote it.',
      icon: Lock,
      badge: 'Step 4 of 7 · Sealing',
    },
    {
      id: 'margins',
      title: 'The Strata Margin Layer',
      subtitle: 'Marginalia across time',
      narrative: 'Revisit sealed reflections to write in the margins with temporal distance stamps and ink stances—without altering the original historical entry.',
      icon: Columns,
      badge: 'Step 5 of 7 · Strata Margins',
    },
    {
      id: 'the-return',
      title: 'The Return: One Page a Day',
      subtitle: 'Resurfacing past insights',
      narrative: 'Locus resurfaces exactly one past page each day on its anniversary or thematic relevance, inviting you to reflect in the margin.',
      icon: Clock,
      badge: 'Step 6 of 7 · Looking Back',
    },
    {
      id: 'themes',
      title: 'Longitudinal Themes & Constellation',
      subtitle: 'Tracking intellectual trajectories',
      narrative: 'Discrete observations cluster into longitudinal themes, mapped across time in an interactive concept constellation.',
      icon: Layers,
      badge: 'Step 7 of 7 · Synthesis',
    },
  ];

  // Reset to step 0 and trigger step change when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setIsMinimized(false);
      onStepChange?.(0, steps[0].id);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleDismiss();
      } else if (e.key === 'ArrowRight' && currentStepIndex < steps.length - 1) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        handleBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, steps.length]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      onStepChange?.(nextIdx, steps[nextIdx].id);
    } else {
      handleDismiss();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      onStepChange?.(prevIdx, steps[prevIdx].id);
    }
  };

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
        className="fixed bottom-6 right-6 z-50 bg-surface border border-accent-sage/40 shadow-xl rounded-full px-4 py-2.5 flex items-center gap-2.5 cursor-pointer hover:border-accent-sage hover:shadow-2xl transition-all animate-fade-in group"
        role="button"
        tabIndex={0}
        aria-label="Expand guided walkthrough"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-accent-sage animate-pulse" />
        <span className="font-ui text-xs font-semibold text-text-primary">
          Guided Tour · Step {currentStepIndex + 1} of {steps.length}
        </span>
        <span className="font-stamp text-[11px] text-accent-sage font-medium ml-1 group-hover:underline">
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
      id="walkthrough-modal"
      className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[410px] max-w-[calc(100vw-2rem)] bg-surface border border-border-hairline rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto transition-all animate-fade-in"
      role="dialog"
      aria-modal="false"
      aria-labelledby="walkthrough-title"
    >
      {/* Top Segmented Progress Bar */}
      <div className="w-full bg-canvas h-1 flex">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`h-full flex-1 transition-all duration-300 ${
              idx <= currentStepIndex ? 'bg-accent-sage' : 'bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* Header */}
      <div className="px-4 py-3 pb-2 flex items-center justify-between border-b border-border-hairline">
        <span className="font-stamp text-[10px] text-text-muted uppercase tracking-wider font-semibold">
          {currentStep.badge}
        </span>

        <div className="flex items-center gap-1">
          <button
            id="walkthrough-minimize-btn"
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-canvas transition-colors cursor-pointer"
            title="Minimize walkthrough"
            aria-label="Minimize walkthrough"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-canvas transition-colors cursor-pointer"
            aria-label="Close walkthrough"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 space-y-3 flex-1">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-sage-tint text-accent-sage flex items-center justify-center shrink-0 shadow-2xs">
            <IconComponent className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 id="walkthrough-title" className="font-serif text-base font-bold text-text-primary tracking-tight leading-snug">
              {currentStep.title}
            </h2>
            <p className="font-ui text-xs text-text-muted mt-0.5">
              {currentStep.subtitle}
            </p>
          </div>
        </div>

        <p className="font-reading text-xs sm:text-[13px] text-text-primary/90 leading-relaxed bg-canvas p-3 rounded-xl border border-border-hairline shadow-2xs">
          {currentStep.narrative}
        </p>
      </div>

      {/* Footer Controls */}
      <div className="px-4 py-3 bg-surface border-t border-border-hairline flex items-center justify-between">
        <button
          onClick={handleDismiss}
          className="text-xs font-ui text-text-muted hover:text-text-primary transition-colors cursor-pointer px-1 py-0.5"
        >
          Skip Tour
        </button>

        <div className="flex items-center gap-1.5">
          <button
            id="walkthrough-back-btn"
            onClick={handleBack}
            disabled={isFirst}
            className={`p-1.5 rounded-lg border text-xs font-ui transition-all flex items-center gap-1 ${
              isFirst
                ? 'border-transparent text-text-muted/30 cursor-not-allowed'
                : 'border-border-hairline bg-surface text-text-primary hover:bg-canvas cursor-pointer'
            }`}
            aria-label="Previous step"
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {isLast ? (
            <button
              id="walkthrough-finish-btn"
              onClick={handleDismiss}
              className="px-3.5 py-1.5 rounded-lg bg-accent-sage hover:opacity-90 text-white text-xs font-ui font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Begin Reflecting</span>
            </button>
          ) : (
            <button
              id="walkthrough-next-btn"
              onClick={handleNext}
              className="px-3.5 py-1.5 rounded-lg bg-accent-sage hover:opacity-90 text-white text-xs font-ui font-semibold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
