import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Copy, 
  Check, 
  BookOpen, 
  RefreshCw, 
  FileText,
  Lightbulb,
  Compass
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Interaction } from '../types';

interface IntelligenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'session_summary' | 'cross_synthesis';
  activeInteraction: Interaction | null;
  allInteractions: Interaction[];
  onSaveSummaryToSession?: (summary: string) => void;
  onError: (msg: string) => void;
}

export const IntelligenceDrawer: React.FC<IntelligenceDrawerProps> = ({
  isOpen,
  onClose,
  type,
  activeInteraction,
  allInteractions,
  onSaveSummaryToSession,
  onError,
}) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modelUsed, setModelUsed] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Initialize or fetch intelligence upon opening
  React.useEffect(() => {
    if (!isOpen) return;

    if (type === 'session_summary' && activeInteraction) {
      if (activeInteraction.summary) {
        setContent(activeInteraction.summary);
      } else {
        handleGenerateSessionSummary();
      }
    } else if (type === 'cross_synthesis') {
      handleGenerateCrossSynthesis();
    }
  }, [isOpen, type, activeInteraction?.id]);

  const handleGenerateSessionSummary = async () => {
    if (!activeInteraction || !activeInteraction.turns || activeInteraction.turns.length === 0) {
      onError('Please write at least one thought or turn before generating a summary.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turns: activeInteraction.turns,
          title: activeInteraction.title,
          category: activeInteraction.category,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate session summary');
      }

      const data = await res.json();
      setContent(data.summary);
      setModelUsed(data.modelUsed || 'gemini-3.6-flash');
      if (onSaveSummaryToSession) {
        onSaveSummaryToSession(data.summary);
      }
    } catch (err: any) {
      console.error(err);
      onError(err.message || 'Error communicating with the reflection service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCrossSynthesis = async () => {
    if (allInteractions.length === 0) {
      onError('No journal entries available to synthesize.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/gemini/synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: allInteractions,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate pattern synthesis');
      }

      const data = await res.json();
      setContent(data.synthesis);
      setModelUsed(data.modelUsed || 'gemini-3.6-flash');
    } catch (err: any) {
      console.error(err);
      onError(err.message || 'Error communicating with the reflection service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isSessionMode = type === 'session_summary';
  const handleGenerate = isSessionMode ? handleGenerateSessionSummary : handleGenerateCrossSynthesis;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer Panel */}
      <div
        className={`relative w-full max-w-lg bg-canvas shadow-2xl h-full flex flex-col border-l border-border-hairline transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-border-hairline bg-surface flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-sage-tint border border-accent-sage/20 flex items-center justify-center text-accent-sage">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary font-serif">
                {isSessionMode ? 'Session Essence' : 'Longitudinal Synthesis'}
              </h2>
              <p className="text-xs text-text-muted">
                {isSessionMode ? 'Key reflections & extracted actions' : 'Cross-session growth & recurring patterns'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              title="Regenerate"
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas transition-colors disabled:opacity-40 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-8 h-8 border-3 border-accent-sage/30 border-t-accent-sage rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-text-primary">
                  {isSessionMode ? 'Synthesizing session essence...' : 'Analyzing multi-session themes...'}
                </p>
                <p className="text-xs text-text-muted">Uncovering insights and recurring patterns...</p>
              </div>
            </div>
          ) : content ? (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border-hairline text-[13px] text-text-primary">
                <Compass className="w-3 h-3 text-accent-sage" />
                <span>Reflection Synthesis</span>
              </div>

              <div className="p-6 bg-surface rounded-2xl border border-border-hairline shadow-xs prose prose-stone dark:prose-invert max-w-none text-text-primary text-sm leading-relaxed">
                <Markdown>{content}</Markdown>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-text-muted">
              <p className="text-sm">No analysis generated yet.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border-hairline bg-surface flex items-center justify-between">
          <button
            onClick={handleCopy}
            disabled={!content || isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-text-primary bg-canvas border border-border-hairline hover:bg-surface rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-accent-sage" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-accent-sage hover:opacity-90 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
