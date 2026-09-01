import React, { useState } from 'react';
import { 
  BookMarked, 
  Star, 
  Trash2, 
  MessageSquare, 
  Calendar, 
  FolderOpen,
  PanelLeftClose
} from 'lucide-react';
import { Interaction } from '../types';

interface SidebarHistoryProps {
  interactions: Interaction[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStar: (interaction: Interaction) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  isOnlyStarred: boolean;
  onToggleOnlyStarred: () => void;
  isLoading: boolean;
  categories: string[];
  isOpen?: boolean;
  onToggleCollapse?: () => void;
}

export const SidebarHistory: React.FC<SidebarHistoryProps> = ({
  interactions,
  selectedId,
  onSelect,
  onDelete,
  onToggleStar,
  selectedCategory,
  onSelectCategory,
  isOnlyStarred,
  onToggleOnlyStarred,
  isLoading,
  categories,
  isOpen = true,
  onToggleCollapse,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categoryList = ['All', ...categories];

  const filteredInteractions = interactions.filter((item) => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchStar = !isOnlyStarred || item.starred;
    return matchCat && matchStar;
  });

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deletingId === id) {
      onDelete(id);
      setDeletingId(null);
    } else {
      setDeletingId(id);
    }
  };

  return (
    <aside
      className={`transition-all duration-300 ease-in-out shrink-0 overflow-hidden flex flex-col bg-[#F9F7F2] border-stone-200 h-[calc(100vh-61px)] ${
        isOpen
          ? 'w-full md:w-80 lg:w-96 border-r opacity-100'
          : 'w-0 border-r-0 opacity-0 pointer-events-none p-0'
      }`}
      aria-label="Reflection sessions sidebar"
      aria-hidden={!isOpen}
    >
      <div className="w-full md:w-80 lg:w-96 flex flex-col h-full shrink-0">
        {/* Sidebar Header & Filters */}
        <div className="p-4 border-b border-stone-200 bg-[#F9F7F2] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 uppercase tracking-wider">
              <MessageSquare className="w-4 h-4 text-emerald-800" />
              <span>Reflections &bull; {interactions.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                id="sidebar-filter-starred-btn"
                onClick={onToggleOnlyStarred}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isOnlyStarred
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'text-stone-600 hover:text-stone-900 bg-white border border-stone-200'
                }`}
                title="Filter starred entries"
              >
                <Star className={`w-3 h-3 ${isOnlyStarred ? 'fill-amber-500 text-amber-600' : ''}`} />
                <span>Favorites</span>
              </button>

              {onToggleCollapse && (
                <button
                  id="sidebar-collapse-btn"
                  onClick={onToggleCollapse}
                  className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/70 rounded-md transition-colors cursor-pointer"
                  title="Collapse sidebar (Ctrl+B / ⌘B)"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categoryList.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Interactions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="py-12 text-center text-stone-400 space-y-2">
              <div className="w-5 h-5 border-2 border-stone-300 border-t-emerald-800 rounded-full animate-spin mx-auto" />
              <p className="text-xs">Loading reflections...</p>
            </div>
          ) : filteredInteractions.length === 0 ? (
            <div className="py-12 px-4 text-center text-stone-500 space-y-3">
              <FolderOpen className="w-8 h-8 mx-auto text-stone-400 stroke-[1.5]" />
              <div>
                <p className="text-sm font-medium text-stone-700">No reflections found</p>
                <p className="text-xs text-stone-500 mt-1">
                  {isOnlyStarred
                    ? 'No favorites match this filter.'
                    : 'Start a new reflection thread to save your thoughts.'}
                </p>
              </div>
            </div>
          ) : (
            filteredInteractions.map((item) => {
              const isSelected = item.id === selectedId;
              const turnCount = item.turns ? item.turns.length : 0;
              const firstTurnPreview = item.turns && item.turns.length > 0
                ? item.turns[0].content
                : 'Empty reflection draft...';

              const dateLabel = new Date(item.updatedAt || item.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={item.id}
                  id={`sidebar-item-${item.id}`}
                  onClick={() => onSelect(item.id)}
                  className={`group relative p-3 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-white border-emerald-700/80 ring-1 ring-emerald-700/20 shadow-xs'
                      : 'bg-white/70 border-stone-200/80 hover:bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-serif-heading font-semibold text-sm text-stone-900 truncate flex-1">
                      {item.title || 'Untitled Reflection'}
                    </h4>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar(item);
                        }}
                        className={`p-1 rounded-md transition-colors ${
                          item.starred
                            ? 'text-amber-500 hover:text-amber-600'
                            : 'text-stone-300 hover:text-stone-500 opacity-0 group-hover:opacity-100'
                        }`}
                        title={item.starred ? 'Remove favorite' : 'Add to favorites'}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.starred ? 'fill-amber-500' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => handleDeleteClick(e, item.id)}
                        className={`p-1 rounded-md transition-colors text-stone-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 ${
                          deletingId === item.id ? 'opacity-100 text-rose-600 bg-rose-50' : ''
                        }`}
                        title={deletingId === item.id ? 'Click again to confirm delete' : 'Delete reflection'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subtitle / Excerpt preview */}
                  <p className="text-xs text-stone-500 line-clamp-2 mb-2.5 font-sans leading-relaxed">
                    {firstTurnPreview}
                  </p>

                  {/* Card Footer tags */}
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                        {item.category || 'Personal'}
                      </span>
                      {item.mood && (
                        <span className="text-[10px] text-stone-500 italic">
                          {item.mood}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {dateLabel}
                      </span>
                      <span>&bull;</span>
                      <span>{turnCount} {turnCount === 1 ? 'turn' : 'turns'}</span>
                    </div>
                  </div>

                  {deletingId === item.id && (
                    <div className="mt-2 pt-2 border-t border-rose-100 text-[11px] text-rose-600 flex items-center justify-between">
                      <span>Click trash icon again to delete.</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(null);
                        }}
                        className="text-stone-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};
