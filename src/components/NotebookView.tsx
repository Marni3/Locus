import React, { useState } from 'react';
import { 
  BookMarked, 
  Folder, 
  FolderOpen, 
  Search, 
  Trash2, 
  Compass, 
  ArrowUpRight, 
  Layers, 
  Edit2
} from 'lucide-react';
import { NotebookItem, Interaction } from '../types';

interface NotebookViewProps {
  items: NotebookItem[];
  interactions: Interaction[];
  onOpenInteraction: (interactionId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateItem: (updated: NotebookItem) => void;
  onOpenSynthesis: () => void;
}

export const NotebookView: React.FC<NotebookViewProps> = ({
  items,
  interactions,
  onOpenInteraction,
  onDeleteItem,
  onUpdateItem,
  onOpenSynthesis,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');

  // Group items by folderName
  const folders = Array.from(new Set(items.map((i) => i.folderName || 'Uncategorized')));

  const filteredItems = items.filter((item) => {
    const matchFolder = selectedFolder === 'All' || item.folderName === selectedFolder;
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm.trim() ||
      item.excerpt.toLowerCase().includes(term) ||
      (item.userNote && item.userNote.toLowerCase().includes(term)) ||
      (item.contextHint && item.contextHint.toLowerCase().includes(term)) ||
      item.sourceTitle.toLowerCase().includes(term);
    return matchFolder && matchSearch;
  });

  const handleStartEdit = (item: NotebookItem) => {
    setEditingItemId(item.id);
    setEditNoteText(item.userNote || '');
  };

  const handleSaveEdit = (item: NotebookItem) => {
    onUpdateItem({
      ...item,
      userNote: editNoteText.trim() || undefined,
      updatedAt: new Date().toISOString(),
    });
    setEditingItemId(null);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-61px)] bg-canvas text-text-primary overflow-hidden font-sans">
      {/* Left Folder Navigator */}
      <aside className="w-full md:w-64 bg-canvas border-r border-border-hairline p-4 flex flex-col shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
            <Folder className="w-4 h-4 text-accent-sage" />
            <span>Folders</span>
          </div>
          <span className="text-[13px] text-text-muted font-medium">{items.length} saved</span>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-1">
          <button
            onClick={() => setSelectedFolder('All')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
              selectedFolder === 'All'
                ? 'bg-surface text-text-primary shadow-2xs font-semibold'
                : 'text-text-muted hover:text-text-primary hover:bg-surface/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="w-3.5 h-3.5 text-text-muted" />
              <span>All Insights</span>
            </div>
            <span className="text-[13px] text-text-muted">{items.length}</span>
          </button>

          {folders.map((f) => {
            const count = items.filter((i) => i.folderName === f).length;
            const isSelected = selectedFolder === f;
            return (
              <button
                key={f}
                onClick={() => setSelectedFolder(f)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-surface text-text-primary shadow-2xs font-semibold'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-1">
                  <Folder className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span className="truncate">{f}</span>
                </div>
                <span className="text-[13px] text-text-muted shrink-0">{count}</span>
              </button>
            );
          })}
        </nav>

        {/* Repurposed Pattern Synthesis across high-signal notes */}
        <div className="pt-4 border-t border-border-hairline mt-auto">
          <button
            onClick={onOpenSynthesis}
            disabled={items.length === 0}
            className="w-full flex items-center justify-center gap-2 p-2.5 bg-accent-sage-tint text-accent-sage border border-accent-sage/30 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-accent-sage" />
            <span>Synthesize Patterns</span>
          </button>
        </div>
      </aside>

      {/* Right Content Stream */}
      <main className="flex-1 flex flex-col overflow-hidden bg-canvas">
        {/* Sub-header */}
        <div className="p-4 sm:px-8 border-b border-border-hairline bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="space-y-0.5">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-primary">
              {selectedFolder === 'All' ? 'Curated Notebook' : selectedFolder}
            </h2>
            <p className="text-xs text-text-muted">High-signal excerpts and distilled reflection context</p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved notes..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-canvas text-text-primary border border-border-hairline rounded-full focus:outline-none focus:ring-2 focus:ring-accent-sage/20 focus:border-accent-sage"
            />
          </div>
        </div>

        {/* Note Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="py-20 text-center text-text-muted space-y-3 max-w-sm mx-auto">
              <BookMarked className="w-10 h-10 text-text-muted stroke-[1.5] mx-auto" />
              <div>
                <p className="text-sm font-semibold text-text-primary">No notes in this folder</p>
                <p className="text-xs text-text-muted mt-1">
                  Hover over any reflection turn in your conversations and click the bookmark icon to save key takeaways here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl">
              {filteredItems.map((note) => {
                const isEditing = editingItemId === note.id;

                return (
                  <div
                    key={note.id}
                    className="p-5 rounded-2xl bg-surface border border-border-hairline shadow-2xs hover:border-accent-sage/40 transition-all flex flex-col justify-between space-y-4 text-left"
                  >
                    <div className="space-y-3">
                      {/* Top metadata */}
                      <div className="flex items-center justify-between text-[13px] text-text-muted">
                        <span className="font-semibold text-accent-sage bg-accent-sage-tint px-2 py-0.5 rounded-full border border-accent-sage/20">
                          {note.folderName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span>{new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          <button
                            onClick={() => onDeleteItem(note.id)}
                            className="p-1 text-text-muted hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Excerpt */}
                      <blockquote className="text-sm font-serif italic text-text-primary leading-relaxed border-l-2 border-accent-sage/40 pl-3">
                        "{note.excerpt}"
                      </blockquote>

                      {/* Context Hint */}
                      {note.contextHint && (
                        <div className="flex items-start gap-1.5 p-2.5 bg-canvas rounded-xl border border-border-hairline text-xs text-text-muted leading-relaxed">
                          <Compass className="w-3.5 h-3.5 text-accent-sage shrink-0 mt-0.5" />
                          <span>{note.contextHint}</span>
                        </div>
                      )}

                      {/* User Note */}
                      {isEditing ? (
                        <div className="space-y-2 pt-1">
                          <textarea
                            rows={2}
                            value={editNoteText}
                            onChange={(e) => setEditNoteText(e.target.value)}
                            className="w-full p-2 text-xs bg-surface text-text-primary border border-border-hairline rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-sage/20 focus:border-accent-sage"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setEditingItemId(null)}
                              className="px-2.5 py-1 text-xs text-text-muted hover:text-text-primary"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(note)}
                              className="px-3 py-1 text-xs font-semibold text-white bg-accent-sage rounded-md"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        note.userNote && (
                          <div className="pt-1 flex items-start justify-between group">
                            <p className="text-xs text-text-primary font-medium leading-relaxed">
                              <strong>Note:</strong> {note.userNote}
                            </p>
                            <button
                              onClick={() => handleStartEdit(note)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-text-primary transition-opacity"
                              title="Edit note"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )
                      )}
                    </div>

                    {/* Bottom link back to source reflection */}
                    <div className="pt-3 border-t border-border-hairline flex items-center justify-between text-xs">
                      <button
                        onClick={() => onOpenInteraction(note.interactionId)}
                        className="inline-flex items-center gap-1 text-text-muted hover:text-accent-sage font-medium transition-colors cursor-pointer"
                      >
                        <span className="truncate max-w-[200px]">From: {note.sourceTitle}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      {!note.userNote && !isEditing && (
                        <button
                          onClick={() => handleStartEdit(note)}
                          className="text-[13px] text-text-muted hover:text-text-primary font-medium cursor-pointer"
                        >
                          + Add Note
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
