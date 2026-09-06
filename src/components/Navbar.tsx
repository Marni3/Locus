import React, { useState } from 'react';
import { 
  Plus, 
  LogOut, 
  Settings, 
  MessageSquare,
  Layers,
  ArrowLeft,
  ChevronDown,
  Bookmark,
  HelpCircle,
  Clock,
  Sun,
  Moon
} from 'lucide-react';
import { LocusMark } from './LocusMark';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  onNewSession: () => void;
  activeView: 'reflections' | 'themes' | 'session' | 'return';
  onViewChange: (view: 'reflections' | 'themes' | 'return') => void;
  onOpenSettings: () => void;
  onOpenBookmarks?: () => void;
  onOpenTour?: () => void;
  bookmarkCount?: number;
  hasReturnCandidate?: boolean;
  onSignOut: () => void;
  totalSessions?: number;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onNewSession,
  activeView,
  onViewChange,
  onOpenSettings,
  onOpenBookmarks,
  onOpenTour,
  bookmarkCount,
  hasReturnCandidate,
  onSignOut,
  isDark,
  onToggleTheme,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header id="app-navbar" className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border-hairline px-2.5 sm:px-6 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left Brand & Context */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {activeView === 'session' ? (
            <button
              onClick={() => onViewChange('reflections')}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-text-primary bg-canvas hover:bg-[#F2EFEB] rounded-xl border border-border-hairline transition-all cursor-pointer shadow-2xs"
              title="Return to Reflections Canvas"
              aria-label="Return to Reflections Canvas"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-accent-sage" />
              <span className="hidden sm:inline">Reflections</span>
            </button>
          ) : (
            <div 
              onClick={() => onViewChange('reflections')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-accent-sage flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <LocusMark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="flex items-baseline gap-2">
                <h1 className="font-serif text-base sm:text-xl font-bold tracking-tight text-text-primary leading-none">
                  Locus
                </h1>
                <span className="text-xs font-medium text-text-muted font-sans uppercase tracking-widest hidden md:inline-block">
                  Sanctuary
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Center: Segmented Navigation (Reflections, Themes, Looking back) */}
        <div className="inline-flex p-0.5 sm:p-1 rounded-xl bg-canvas border border-border-hairline text-xs font-medium font-sans shadow-2xs shrink-0">
          <button
            id="nav-tab-reflections"
            onClick={() => onViewChange('reflections')}
            title="Reflections"
            aria-label="Reflections"
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeView === 'reflections' || activeView === 'session'
                ? 'bg-surface text-text-primary shadow-2xs font-semibold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-accent-sage" />
            <span className="hidden md:inline">Reflections</span>
          </button>

          <button
            id="nav-tab-themes"
            onClick={() => onViewChange('themes')}
            title="Themes"
            aria-label="Themes"
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeView === 'themes'
                ? 'bg-surface text-text-primary shadow-2xs font-semibold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-accent-sage" />
            <span className="hidden md:inline">Themes</span>
          </button>

          <button
            id="nav-tab-return"
            onClick={() => onViewChange('return')}
            title="Looking back"
            aria-label="Looking back"
            className={`relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeView === 'return'
                ? 'bg-surface text-text-primary shadow-2xs font-semibold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-accent-sage" />
            <span className="hidden md:inline">Looking back</span>
            {hasReturnCandidate && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#8A3A22] shrink-0" title="Daily reflection available" />
            )}
          </button>
        </div>

        {/* Right Actions: New Entry, Settings, Profile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            id="navbar-new-reflection-btn"
            onClick={onNewSession}
            className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-accent-sage hover:opacity-95 rounded-xl shadow-xs transition-all cursor-pointer"
            title="New Reflection"
            aria-label="New Reflection"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Reflection</span>
          </button>

          <div className="h-5 w-px bg-border-hairline mx-0.5 hidden sm:block"></div>

          {/* Bookmarks Trigger */}
          {onOpenBookmarks && (
            <button
              id="navbar-open-bookmarks-btn"
              onClick={onOpenBookmarks}
              className="relative p-1.5 sm:p-2 text-text-muted hover:text-text-primary hover:bg-canvas rounded-xl transition-colors cursor-pointer hidden sm:flex"
              title="Saved Bookmarks"
              aria-label="Open Saved Bookmarks"
            >
              <Bookmark className="w-4 h-4" />
              {typeof bookmarkCount === 'number' && bookmarkCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent-sage" />
              )}
            </button>
          )}

          {/* Guided Tour Trigger */}
          {onOpenTour && (
            <button
              id="navbar-open-tour-btn"
              onClick={onOpenTour}
              className="items-center gap-1 px-2.5 py-1.5 text-text-muted hover:text-text-primary hover:bg-canvas rounded-xl transition-colors cursor-pointer text-xs font-medium border border-transparent hover:border-border-hairline hidden md:inline-flex"
              title="Start Guided Tour"
              aria-label="Open Guided Tour"
            >
              <HelpCircle className="w-4 h-4 text-accent-sage" />
              <span>Tour</span>
            </button>
          )}

          {/* Quick Theme Toggle (Sun/Moon) */}
          {onToggleTheme && (
            <button
              id="navbar-theme-toggle-btn"
              onClick={onToggleTheme}
              className="p-1.5 sm:p-2 text-text-muted hover:text-text-primary hover:bg-canvas rounded-xl transition-colors cursor-pointer"
              title={isDark ? "Switch to daylight mode" : "Switch to obsidian dark mode"}
              aria-label={isDark ? "Switch to daylight mode" : "Switch to obsidian dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-accent-sage" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* Settings Trigger */}
          <button
            id="navbar-open-settings-btn"
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 text-text-muted hover:text-text-primary hover:bg-canvas rounded-xl transition-colors cursor-pointer"
            title="Settings & Integrations"
            aria-label="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Avatar / Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-1 p-0.5 rounded-full hover:bg-canvas transition-colors cursor-pointer"
              title={user.email || 'User profile'}
              aria-label="User profile menu"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profile'}
                  className="w-7 h-7 rounded-full object-cover border border-border-hairline"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-accent-sage-tint text-accent-sage font-bold flex items-center justify-center text-xs">
                  {user.email ? user.email.slice(0, 2).toUpperCase() : 'U'}
                </div>
              )}
              <ChevronDown className="w-3 h-3 text-text-muted hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-52 bg-surface rounded-xl shadow-lg border border-border-hairline py-1.5 z-50 text-xs font-sans animate-fade-in"
                onMouseLeave={() => setIsMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-border-hairline">
                  <p className="font-semibold text-text-primary truncate">
                    {user.displayName || 'Reflective Journaler'}
                  </p>
                  <p className="text-[13px] text-text-muted truncate">{user.email}</p>
                </div>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full text-left px-3 py-2 text-text-primary hover:bg-canvas flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-text-muted" />
                  <span>Settings & Preferences</span>
                </button>

                <div className="my-1 border-t border-border-hairline"></div>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
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
