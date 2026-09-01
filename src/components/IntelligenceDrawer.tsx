import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
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
      onError(err.message || 'Error communicating with Gemini API.');
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
      onError(err.message || 'Error generating cross-session pattern synthesis.');
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

  if (!isOpen) return null;

  const isSessionMode = type === 'session_summary';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-stone-900/30 backdrop-blur-xs animate-fade-in">
      <div 
        id="intelligence-drawer-panel"
        className="w-full max-w-xl bg-[#FDFBF7] h-full shadow-2xl border-l border-stone-200 flex flex-col justify-between"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
              {isSessionMode ? <BookOpen className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-serif-heading text-lg font-bold text-stone-900 leading-tight">
                {isSessionMode ? 'Session Executive Summary' : 'Journal Pattern Synthesis'}
              </h3>
              <p className="text-xs text-stone-500">
                {isSessionMode
                  ? `Distilled insights for "${activeInteraction?.title || 'Current Session'}"`
                  : `Longitudinal analysis across ${allInteractions.length} saved entries`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={isSessionMode ? handleGenerateSessionSummary : handleGenerateCrossSynthesis}
              disabled={isLoading}
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
              title="Regenerate analysis"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-800 rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-stone-800">
                  {isSessionMode ? 'Synthesizing session essence...' : 'Analyzing multi-session themes...'}
                </p>
                <p className="text-xs text-stone-500 font-mono">Running Gemini reasoning fallback ladder</p>
              </div>
            </div>
          ) : content ? (
            <div className="space-y-4">
              {modelUsed && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F9F7F2] border border-stone-200 text-[11px] font-mono text-stone-600">
                  <Sparkles className="w-3 h-3 text-emerald-700" />
                  <span>Synthesized via {modelUsed}</span>
                </div>
              )}

              <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs prose prose-stone max-w-none text-stone-800 text-sm leading-relaxed">
                <Markdown>{content}</Markdown>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-stone-400">
              <p className="text-sm">No analysis generated yet.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200 bg-white flex items-center justify-between">
          <button
            onClick={handleCopy}
            disabled={!content || isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-stone-700 bg-[#F9F7F2] border border-stone-200 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
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
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
