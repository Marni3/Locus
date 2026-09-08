import React, { useState, useMemo, useEffect } from 'react';
import { X, Bookmark, BookmarkX, Copy, Check, ArrowUpRight, Search, Clock, FileText } from 'lucide-react';
import { Entry, Message } from '../types';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: Entry[];
  onSelectEntry: (entry: Entry, turnId?: string) => void;
  onRemoveBookmark?: (entryId: string, turnId: string) => void;
}

interface FlattenedBookmark {
  entryId: string;
  entryTitle: string;
  entryCategory?: string;
  turn: Message;
  timestamp: string;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  entries,
  onSelectEntry,
  onRemoveBookmark,
}) => {
  const [viewMode, setViewMode] = useState<'chronological' | 'by_entry'>('chronological');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Extract all bookmarked turns across all entries
  const allBookmarks: FlattenedBookmark[] = useMemo(() => {
    const list: FlattenedBookmark[] = [];
    entries.forEach((entry) => {
      const turns = entry.turns || [];
      turns.forEach((turn) => {
        if (turn.isBookmarked || turn.isPinned) {
          list.push({
            entryId: entry.id,
            entryTitle: entry.title || 'Untitled Reflection',
            entryCategory: entry.category,
            turn,
            timestamp: turn.createdAt || turn.timestamp || entry.createdAt,
          });
        }
      });
    });

    // Sort descending by timestamp
    return list.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [entries]);

  // Filtered bookmarks
  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return allBookmarks;
    const q = searchQuery.toLowerCase();
    return allBookmarks.filter(
      (b) =>
        b.turn.content.toLowerCase().includes(q) ||
        b.entryTitle.toLowerCase().includes(q) ||
        (b.turn.note && b.turn.note.toLowerCase().includes(q))
    );
  }, [allBookmarks, searchQuery]);

  // Grouped by entry
  const groupedByEntry = useMemo(() => {
    const groups: { [entryId: string]: { entryTitle: string; entryCategory?: string; items: FlattenedBookmark[] } } = {};
    filteredBookmarks.forEach((b) => {
      if (!groups[b.entryId]) {
        groups[b.entryId] = {
          entryTitle: b.entryTitle,
          entryCategory: b.entryCategory,
          items: [],
        };
      }
      groups[b.entryId].items.push(b);
    });
    return Object.entries(groups);
  }, [filteredBookmarks]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bookmarks-drawer-title"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop Scrim */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-xl bg-canvas h-full shadow-2xl flex flex-col border-l border-border-hairline z-10">
        {/* Drawer Header */}
        <div className="p-4 sm:p-6 border-b border-border-hairline bg-surface flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-accent-sage-tint text-accent-sage flex items-center justify-center">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2
                id="bookmarks-drawer-title"
                className="font-ui text-base sm:text-lg font-semibold text-text-primary tracking-tight"
              >
                Saved Bookmarks
              </h2>
              <p className="font-stamp text-xs text-text-muted">
                {allBookmarks.length} {allBookmarks.length === 1 ? 'passage' : 'passages'} bookmarked across reflections
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close bookmarks drawer"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas border border-transparent hover:border-border-hairline transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter / Search Bar */}
        <div className="p-4 sm:p-6 pb-2 border-b border-border-hairline bg-surface space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-2">
            {/* View Mode Segmented Control */}
            <div className="inline-flex rounded-lg border border-border-hairline bg-canvas p-0.5 text-xs font-ui">
              <button
                type="button"
                onClick={() => setViewMode('chronological')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'chronological'
                    ? 'bg-surface font-semibold text-text-primary shadow-2xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Chronological
              </button>
              <button
                type="button"
                onClick={() => setViewMode('by_entry')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'by_entry'
                    ? 'bg-surface font-semibold text-text-primary shadow-2xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                By Reflection
              </button>
            </div>

            <span className="font-stamp text-xs text-text-muted">
              {filteredBookmarks.length} shown
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookmarked passages and notes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs font-ui bg-canvas border border-border-hairline rounded-lg text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent-sage focus:ring-1 focus:ring-accent-sage"
            />
          </div>
        </div>

        {/* Bookmarks Content Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-full bg-surface border border-border-hairline text-text-muted flex items-center justify-center mx-auto mb-3">
                <Bookmark className="w-6 h-6 stroke-1 text-text-muted" />
              </div>
              <p className="font-ui text-sm font-medium text-text-primary mb-1">
                {searchQuery ? 'No bookmarks match your query' : 'No bookmarked passages yet'}
              </p>
              <p className="font-leaf text-xs text-text-muted max-w-sm mx-auto">
                {searchQuery
                  ? 'Try adjusting your search terms.'
                  : 'Click the bookmark ribbon on any conversational turn during reflection to preserve pivotal realizations here.'}
              </p>
            </div>
          ) : viewMode === 'chronological' ? (
            // Chronological Feed
            <div className="space-y-4">
              {filteredBookmarks.map((item) => {
                const parentEntry = entries.find((e) => e.id === item.entryId);
                const isUser = item.turn.role === 'user';
                return (
                  <article
                    key={`${item.entryId}-${item.turn.id}`}
                    className="p-4 bg-surface border border-border-hairline rounded-lg space-y-2.5 transition-shadow hover:shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs border-b border-border-hairline/60 pb-2">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-ui font-semibold text-text-primary truncate">
                          {item.entryTitle}
                        </span>
                        {item.entryCategory && (
                          <span className="font-stamp text-[10px] px-1.5 py-0.5 bg-canvas border border-border-hairline text-text-muted rounded">
                            {item.entryCategory}
                          </span>
                        )}
                      </div>
                      <span className="font-stamp text-[11px] text-text-muted shrink-0">
                        {new Date(item.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <blockquote className="font-leaf text-sm text-text-primary leading-relaxed pl-3 border-l-2 border-accent-sage/60 italic">
                      "{item.turn.content}"
                    </blockquote>

                    {item.turn.note && (
                      <div className="p-2 bg-canvas border border-border-hairline rounded text-xs font-stamp text-text-muted">
                        <span className="font-medium text-text-primary">Note: </span>
                        {item.turn.note}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="font-stamp text-[10px] text-text-muted uppercase tracking-wider">
                        {isUser ? 'User Voice' : 'Reflection Partner'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopy(item.turn.id, item.turn.content)}
                          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-canvas transition-colors cursor-pointer"
                          title="Copy quote"
                          aria-label="Copy quote"
                        >
                          {copiedId === item.turn.id ? (
                            <Check className="w-3.5 h-3.5 text-accent-sage" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {onRemoveBookmark && (
                          <button
                            type="button"
                            onClick={() => onRemoveBookmark(item.entryId, item.turn.id)}
                            className="p-1 rounded text-text-muted hover:text-vermilion hover:bg-canvas transition-colors cursor-pointer"
                            title="Remove bookmark"
                            aria-label="Remove bookmark"
                          >
                            <BookmarkX className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {parentEntry && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectEntry(parentEntry, item.turn.id);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-ui font-medium text-accent-sage hover:bg-accent-sage-tint rounded transition-colors cursor-pointer"
                          >
                            <span>Open</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            // Grouped by Entry
            <div className="space-y-6">
              {groupedByEntry.map(([entryId, group]) => {
                const parentEntry = entries.find((e) => e.id === entryId);
                return (
                  <section key={entryId} className="space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-border-hairline">
                      <div>
                        <h3 className="font-ui text-sm font-bold text-text-primary">
                          {group.entryTitle}
                        </h3>
                        <span className="font-stamp text-[10px] text-text-muted">
                          {group.items.length} {group.items.length === 1 ? 'bookmark' : 'bookmarks'}
                        </span>
                      </div>

                      {parentEntry && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectEntry(parentEntry);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 text-xs font-ui font-medium text-accent-sage hover:underline cursor-pointer"
                        >
                          <span>Go to entry</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      {group.items.map((item) => (
                        <div
                          key={item.turn.id}
                          className="p-3 bg-surface border border-border-hairline rounded-md space-y-2"
                        >
                          <blockquote className="font-leaf text-xs sm:text-sm text-text-primary leading-relaxed italic">
                            "{item.turn.content}"
                          </blockquote>

                          {item.turn.note && (
                            <div className="text-[11px] font-stamp text-text-muted bg-canvas p-1.5 rounded border border-border-hairline">
                              <span className="font-medium text-text-primary">Note: </span>
                              {item.turn.note}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[10px] font-stamp text-text-muted pt-1">
                            <span>
                              {new Date(item.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopy(item.turn.id, item.turn.content)}
                                className="text-text-muted hover:text-text-primary transition-colors"
                              >
                                {copiedId === item.turn.id ? 'Copied' : 'Copy'}
                              </button>
                              {parentEntry && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSelectEntry(parentEntry, item.turn.id);
                                    onClose();
                                  }}
                                  className="text-accent-sage font-medium hover:underline"
                                >
                                  View in context
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
