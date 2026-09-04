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
        className={`relative w-full max-w-lg bg-[#FAF9F6] shadow-2xl h-full flex flex-col border-l border-stone-200 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 font-serif">
                {isSessionMode ? 'Session Essence' : 'Longitudinal Synthesis'}
              </h2>
              <p className="text-xs text-stone-500">
                {isSessionMode ? 'Key reflections & extracted actions' : 'Cross-session growth & recurring patterns'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              title="Regenerate"
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
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
                <p className="text-xs text-stone-500">Uncovering insights and recurring patterns...</p>
              </div>
            </div>
          ) : content ? (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 text-[11px] text-stone-600">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                <span>Reflection Synthesis</span>
              </div>

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
