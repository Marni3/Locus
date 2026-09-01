import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  LogOut, 
  Search, 
  BookMarked, 
  Settings, 
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onNewSession: () => void;
  activeView: 'reflections' | 'notebook';
  onViewChange: (view: 'reflections' | 'notebook') => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
  totalSessions: number;
  notebookCount: number;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  searchTerm,
  onSearchChange,
  onNewSession,
  activeView,
  onViewChange,
  onOpenSettings,
  onSignOut,
  totalSessions,
  notebookCount,
  isSidebarOpen = true,
  onToggleSidebar,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-200 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Brand & Sidebar Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {activeView === 'reflections' && onToggleSidebar && (
            <button
              id="navbar-toggle-sidebar-btn"
              onClick={onToggleSidebar}
              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
              title={isSidebarOpen ? "Collapse sidebar (Ctrl+B / ⌘B)" : "Open sidebar (Ctrl+B / ⌘B)"}
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4 text-emerald-800" />
              )}
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-stone-900 flex items-center justify-center text-emerald-300 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-serif-heading text-lg sm:text-xl font-bold tracking-tight text-stone-900 leading-none">
                ReflectAI
              </h1>
              <span className="text-[11px] font-medium text-stone-500">Calm Reflection Workspace</span>
            </div>
          </div>
        </div>

        {/* Segmented View Switcher (Reflections / Notebook) */}
        <div className="inline-flex p-1 rounded-full bg-stone-200/60 border border-stone-200 text-xs font-medium">
          <button
            onClick={() => onViewChange('reflections')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeView === 'reflections'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reflections</span>
          </button>

          <button
            onClick={() => onViewChange('notebook')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeView === 'notebook'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5 text-emerald-800" />
            <span>Notebook</span>
            {notebookCount > 0 && (
              <span className="text-[10px] bg-stone-200 px-1.5 py-0.2 rounded-full font-bold">
                {notebookCount}
              </span>
            )}
          </button>
        </div>

        {/* Center Search (Reflections View) */}
        <div className="hidden lg:block flex-1 max-w-xs mx-2">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="navbar-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search past entries..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all placeholder:text-stone-400"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            id="navbar-new-reflection-btn"
            onClick={() => {
              onViewChange('reflections');
              onNewSession();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-emerald-800 hover:bg-emerald-900 rounded-full shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">New Reflection</span>
            <span className="xs:hidden">New</span>
          </button>

          <div className="h-6 w-px bg-stone-200 mx-1 hidden sm:block"></div>

          {/* User Avatar Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-stone-200 transition-all cursor-pointer"
              title="User Account Menu"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-stone-200 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {isMenuOpen && (
              <div 
                id="user-avatar-dropdown"
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-stone-200 shadow-xl p-2 z-50 animate-scale-in text-left"
              >
                <div className="px-3 py-2 border-b border-stone-100 mb-1">
                  <p className="text-xs font-bold text-stone-900 truncate">{user.displayName || 'User'}</p>
                  <p className="text-[10px] text-stone-500 truncate">{user.email}</p>
                </div>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-stone-500" />
                  <span>Settings &amp; Preferences</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onViewChange('notebook');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  <BookMarked className="w-3.5 h-3.5 text-stone-500" />
                  <span>Notebook ({notebookCount})</span>
                </button>

                <div className="border-t border-stone-100 my-1"></div>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
