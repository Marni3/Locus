import React, { useState, useEffect } from 'react';
import { X, BookMarked, Sparkles, Check, RefreshCw } from 'lucide-react';
import { Interaction, NotebookItem } from '../types';

interface SaveToNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  excerpt: string;
  sourceInteraction: Interaction;
  onSave: (item: NotebookItem) => void;
  autoContextEnabled?: boolean;
  folderPattern?: 'source_title' | 'category' | 'date';
  initialItem?: NotebookItem | null;
}

export const SaveToNotebookModal: React.FC<SaveToNotebookModalProps> = ({
  isOpen,
  onClose,
  excerpt,
  sourceInteraction,
  onSave,
  autoContextEnabled = true,
  folderPattern = 'source_title',
  initialItem = null,
}) => {
  const [userNote, setUserNote] = useState('');
  const [contextHint, setContextHint] = useState('');
  const [folderName, setFolderName] = useState('');
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialItem) {
      setFolderName(initialItem.folderName || sourceInteraction.title || 'General Reflections');
      setUserNote(initialItem.userNote || '');
      setContextHint(initialItem.contextHint || '');
      setIsGeneratingHint(false);
      return;
    }

    // Determine initial folder name
    let initialFolder = sourceInteraction.title || 'General Reflections';
    if (folderPattern === 'category') {
      initialFolder = sourceInteraction.category || 'Personal';
    } else if (folderPattern === 'date') {
      initialFolder = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }
    setFolderName(initialFolder);
    setUserNote('');
    setContextHint('');

    // Trigger AI Context Note generation if enabled
    if (autoContextEnabled && excerpt.trim()) {
      fetchContextHint(excerpt, sourceInteraction.title, sourceInteraction.category);
    }
  }, [isOpen, excerpt, sourceInteraction, initialItem, autoContextEnabled, folderPattern]);

  const fetchContextHint = async (text: string, title: string, category: string) => {
    try {
      setIsGeneratingHint(true);
      const res = await fetch('/api/notebook/context-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          excerpt: text,
          sourceTitle: title,
          category: category,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setContextHint(data.contextHint || '');
      }
    } catch (err) {
      console.warn('Context hint generation fallback:', err);
    } finally {
      setIsGeneratingHint(false);
    }
  };

  if (!isOpen) return null;

  const handleConfirmSave = () => {
    const itemToSave: NotebookItem = {
      id: initialItem?.id || ('note-' + Date.now()),
      userId: sourceInteraction.userId,
      interactionId: sourceInteraction.id,
      folderName: folderName.trim() || sourceInteraction.title,
      sourceTitle: sourceInteraction.title,
      excerpt: excerpt.trim(),
      contextHint: contextHint.trim() || undefined,
      userNote: userNote.trim() || undefined,
      tags: [sourceInteraction.category],
      createdAt: initialItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(itemToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fade-in">
      <div 
        id="save-to-notebook-modal"
        className="w-full max-w-lg bg-[#FDFBF7] rounded-2xl border border-stone-200 shadow-2xl p-6 space-y-5 animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-heading text-lg font-bold text-stone-900">Save to Notebook</h3>
              <p className="text-[11px] text-stone-500">Curate into your high-signal insight collection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Excerpt preview */}
        <div className="p-3.5 bg-white rounded-xl border border-stone-200 text-xs text-stone-700 leading-relaxed max-h-32 overflow-y-auto italic font-serif">
          "{excerpt}"
        </div>

        {/* Folder Picker */}
        <div>
          <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
            Folder
          </label>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Folder name (e.g., Weekly Planning)"
            className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
          />
        </div>

        {/* AI Context Summary Hint */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-700" />
              <span>AI Context Note</span>
            </label>
            {isGeneratingHint && (
              <span className="text-[10px] text-stone-400 flex items-center gap-1">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span>Distilling context...</span>
              </span>
            )}
          </div>
          <input
            type="text"
            value={contextHint}
            onChange={(e) => setContextHint(e.target.value)}
            placeholder="Analytical context note (optional)..."
            className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
          />
        </div>

        {/* User Note */}
        <div>
          <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
            Your Personal Note (Optional)
          </label>
          <textarea
            rows={2}
            value={userNote}
            onChange={(e) => setUserNote(e.target.value)}
            placeholder="Why did this resonate? What is your takeaway?"
            className="w-full p-2.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save to Notebook</span>
          </button>
        </div>
      </div>
    </div>
  );
};
