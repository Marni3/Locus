import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  auth, 
  signOutUser, 
  fetchUserEntries, 
  saveEntryToFirestore, 
  deleteEntryFromFirestore,
  fetchUserThemes,
  fetchThemeObservations,
  fetchUserSettings,
  saveUserSettingsToFirestore,
  DEFAULT_SETTINGS
} from './lib/firebase';
import { Entry, Theme, ThemeObservation, UserProfile, UserSettings } from './types';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { ReflectionsHome } from './components/ReflectionsHome';
import { SessionWorkspace } from './components/SessionWorkspace';
import { ThemesView } from './components/ThemesView';
import { SettingsDrawer } from './components/SettingsDrawer';
import { Toast } from './components/Toast';
import { LocusMark } from './components/LocusMark';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { EntryReaderWithStrata } from './components/EntryReaderWithStrata';
import { TheReturnView } from './components/TheReturnView';
import { WalkthroughOverlay } from './components/WalkthroughOverlay';
import { selectReturnCandidate } from './services/returnRouter';
import { DEMO_USER_ID, getSampleDemoDataset } from './services/demoSimulator';
import { ReturnCandidate } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Active Screen: 'reflections' | 'session' | 'themes' | 'reader' | 'return'
  const [activeView, setActiveView] = useState<'reflections' | 'session' | 'themes' | 'reader' | 'return'>('reflections');

  // Core Data Collections
  const [entries, setEntries] = useState<Entry[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [observations, setObservations] = useState<ThemeObservation[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Active Session & Prompt
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Bookmarks, Return & Walkthrough State
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [returnCandidate, setReturnCandidate] = useState<ReturnCandidate | null>(null);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(false);

  // Persistence status & Toast State
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [toastActionLabel, setToastActionLabel] = useState<string | undefined>(undefined);
  const [toastOnAction, setToastOnAction] = useState<(() => void) | undefined>(undefined);
  const [toastSubText, setToastSubText] = useState<string | undefined>(undefined);

  // Settings Drawer State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('locus_theme_mode');
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const showToast = (
    msg: string, 
    type: 'success' | 'error' | 'info' = 'info',
    actionLabel?: string,
    onAction?: () => void,
    subText?: string
  ) => {
    setToastMessage(msg);
    setToastType(type);
    setToastActionLabel(actionLabel);
    setToastOnAction(onAction ? () => onAction : undefined);
    setToastSubText(subText);
  };

  const closeToast = () => {
    setToastMessage(null);
    setToastActionLabel(undefined);
    setToastOnAction(undefined);
    setToastSubText(undefined);
  };

  // 0. Dynamic Archival Appearance, Theme Mode & Accessibility Settings
  useEffect(() => {
    const root = document.documentElement;
    const mode = settings.themeMode || 'system';
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      const darkActive = mode === 'dark' || (mode === 'system' && mediaQuery.matches);
      setIsDarkMode(darkActive);
      if (darkActive) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      try {
        localStorage.setItem('locus_theme_mode', mode);
      } catch (e) {}
    };

    updateTheme();

    const handleMediaChange = () => {
      if ((settings.themeMode || 'system') === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    const accents: Record<string, string> = {
      sage: '#3B7A57',
      moss: '#2E5A36',
      irongall: '#2C3E50',
      ochre: '#B87333',
      terracotta: '#8A3A22'
    };
    if (settings.accentColor && accents[settings.accentColor]) {
      root.style.setProperty('--accent-sage', accents[settings.accentColor]);
    }

    if (settings.fontFamily) {
      const fontFallbacks: Record<string, string> = {
        'Literata': "'Literata', 'Source Serif 4', Georgia, serif",
        'Inter': "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        'Roboto': "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        'Overpass Mono': "'Overpass Mono', 'Courier Prime', monospace",
        'Overpass': "'Overpass', 'Inter', sans-serif",
      };
      const family = fontFallbacks[settings.fontFamily] || `'${settings.fontFamily}', Georgia, serif`;
      root.style.setProperty('--font-reading', family);
      root.style.setProperty('--font-leaf', family);
      root.style.setProperty('--font-serif', family);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [settings.themeMode, settings.reducedMotion, settings.accentColor, settings.fontFamily]);

  const handleToggleTheme = async () => {
    const nextMode: 'light' | 'dark' = isDarkMode ? 'light' : 'dark';
    const updated = { ...settings, themeMode: nextMode };
    setSettings(updated);
    if (currentUser?.uid) {
      await saveUserSettingsToFirestore(currentUser.uid, updated);
    }
  };

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Reflector',
          email: user.email,
          photoURL: user.photoURL,
        });
      } else {
        setCurrentUser(null);
        setEntries([]);
        setThemes([]);
        setObservations([]);
        setSettings(DEFAULT_SETTINGS);
        setActiveEntryId(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch User Data (Entries, Themes, Observations, Settings) from Firestore
  const loadUserData = useCallback(async (userId: string) => {
    try {
      setIsLoadingData(true);
      const [fetchedEntries, fetchedThemes, fetchedObservations, fetchedSettings] = await Promise.all([
        fetchUserEntries(userId),
        fetchUserThemes(userId),
        fetchThemeObservations(userId),
        fetchUserSettings(userId),
      ]);

      setEntries(fetchedEntries);
      setThemes(fetchedThemes);
      setObservations(fetchedObservations);
      setSettings(fetchedSettings);

      if (fetchedEntries.length > 0) {
        setActiveEntryId(fetchedEntries[0].id);
      }
    } catch (err: any) {
      console.error('Error loading user data:', err);
      showToast('Could not load user data from Firestore.', 'error');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.uid && currentUser.uid !== DEMO_USER_ID) {
      loadUserData(currentUser.uid);
    }
  }, [currentUser?.uid, loadUserData]);

  // Helper: Create a fresh new reflection session
  const createNewSession = (initialPromptText?: string) => {
    const uid = currentUser?.uid;
    if (!uid) return;

    const initialCategory = settings.categories[0] || 'Personal';
    const newId = 'entry-' + Date.now();
    const newEntry: Entry = {
      id: newId,
      userId: uid,
      title: 'New Reflection',
      status: 'active',
      category: initialCategory,
      mode: settings.defaultStance || 'reflect',
      stance: settings.defaultStance || 'reflect',
      turns: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEntries((prev) => [newEntry, ...prev]);
    setActiveEntryId(newId);
    setInitialPrompt(initialPromptText);
    setActiveView('session');

    // Optimistically persist to Firestore if not demo user
    if (uid !== DEMO_USER_ID) {
      saveEntry(newEntry, uid);
    }
  };

  // 3. Save Entry with Error Escalation
  const saveEntry = async (entryToSave: Entry, userId?: string) => {
    const uid = userId || currentUser?.uid;
    if (!uid) return;
    if (uid === DEMO_USER_ID) return; // In-memory demo

    setIsSaving(true);
    setSaveError(null);

    try {
      await saveEntryToFirestore(uid, entryToSave);
      setIsSaving(false);
    } catch (err: any) {
      console.error('Firestore save failed:', err);
      setIsSaving(false);
      setSaveError('Failed to save to database.');
      showToast('Database sync interrupted. Click retry to persist.', 'error');
    }
  };

  const handleUpdateEntry = (updated: Entry) => {
    setEntries((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    saveEntry(updated);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!currentUser?.uid) return;

    const remaining = entries.filter((item) => item.id !== entryId);
    setEntries(remaining);

    if (activeEntryId === entryId) {
      if (remaining.length > 0) {
        setActiveEntryId(remaining[0].id);
      } else {
        setActiveView('reflections');
      }
    }

    if (currentUser.uid !== DEMO_USER_ID) {
      try {
        await deleteEntryFromFirestore(currentUser.uid, entryId);
      } catch (err: any) {
        console.error('Failed to delete entry:', err);
        showToast('Failed to delete reflection.', 'error');
        return;
      }
    }
    showToast('Reflection removed.', 'info');
  };

  // Conclude active entry and trigger synchronous synthesis pipeline
  const handleConcludeEntry = async (entry: Entry) => {
    if (!currentUser?.uid) return;
    try {
      const res = await fetch(`/api/entries/${entry.id}/conclude`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry,
          userId: currentUser.uid,
          userEmail: currentUser.email || undefined,
          emailNotifications: Boolean(settings.emailNotifications),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to conclude entry (${res.status})`);
      }

      const data = await res.json();
      const updated: Entry = {
        ...entry,
        status: 'concluded',
        concludedAt: new Date().toISOString(),
        bodySealedAt: new Date().toISOString(),
        summary: data.result?.concludedEntry?.summary || data.summary || entry.summary,
        tags: data.result?.concludedEntry?.tags || entry.tags,
      };

      handleUpdateEntry(updated);
      setActiveEntryId(entry.id);

      if (currentUser.uid !== DEMO_USER_ID) {
        // Refresh themes and observations in background from Firestore
        const [refreshedThemes, refreshedObs] = await Promise.all([
          fetchUserThemes(currentUser.uid),
          fetchThemeObservations(currentUser.uid)
        ]);
        setThemes(refreshedThemes);
        setObservations(refreshedObs);
      } else if (data.result) {
        // In demo mode, apply new/updated themes directly to state
        if (data.result.updatedThemes) {
          setThemes((prev) => {
            const map = new Map(prev.map(t => [t.id, t]));
            data.result.updatedThemes.forEach((ut: Theme) => map.set(ut.id, ut));
            data.result.newThemes?.forEach((nt: Theme) => map.set(nt.id, nt));
            return Array.from(map.values());
          });
        }
        if (data.result.newObservations) {
          setObservations((prev) => [...prev, ...data.result.newObservations]);
        }
      }

      setActiveView('reader');
      showToast('The page is set. You can now write in the margins.', 'success');
    } catch (err: any) {
      console.warn('Conclude pipeline handled with client fallback:', err.message);
      const updated: Entry = {
        ...entry,
        status: 'concluded',
        concludedAt: new Date().toISOString(),
        bodySealedAt: new Date().toISOString(),
        summary: entry.summary || 'Reflection concluded.',
        tags: entry.tags && entry.tags.length > 0 ? entry.tags : ['Reflection'],
      };
      handleUpdateEntry(updated);
      setActiveEntryId(entry.id);
      setActiveView('reader');
      showToast('The page is set. Synthesis unavailable offline.', 'info');
    }
  };

  const bookmarkCount = useMemo(() => {
    let count = 0;
    entries.forEach((e) => {
      (e.turns || []).forEach((t) => {
        if (t.isBookmarked || t.isPinned) count++;
      });
    });
    return count;
  }, [entries]);

  const hasReturnCandidate = useMemo(() => {
    return Boolean(selectReturnCandidate(entries));
  }, [entries]);

  const handleOpenTheReturn = () => {
    const candidate = selectReturnCandidate(entries);
    if (candidate) {
      setReturnCandidate(candidate);
      setActiveView('return');
    } else {
      showToast('No past reflections ready for Looking back yet.', 'info');
    }
  };

  const handleWalkthroughStepChange = (stepIndex: number, stepId: string) => {
    switch (stepId) {
      case 'canvas':
        setIsBookmarksOpen(false);
        setIsSettingsOpen(false);
        setActiveView('reflections');
        break;
      case 'companion': {
        setIsBookmarksOpen(false);
        setIsSettingsOpen(false);
        // Ensure active entry is ready for conversational view
        if (!activeEntryId || (activeEntry && activeEntry.status === 'concluded')) {
          const unsealed = entries.find((e) => e.status !== 'concluded');
          if (unsealed) {
            setActiveEntryId(unsealed.id);
          } else if (entries.length > 0) {
            setActiveEntryId(entries[0].id);
          }
        }
        setActiveView('session');
        break;
      }
      case 'bookmarks':
        setIsSettingsOpen(false);
        setIsBookmarksOpen(true);
        break;
      case 'sealing': {
        setIsBookmarksOpen(false);
        setIsSettingsOpen(false);
        const sampleConcluded = entries.find((e) => e.status === 'concluded');
        if (sampleConcluded) {
          setActiveEntryId(sampleConcluded.id);
          setActiveView('reader');
        } else {
          setActiveView('session');
        }
        break;
      }
      case 'margins': {
        setIsBookmarksOpen(false);
        setIsSettingsOpen(false);
        const sampleConcluded = entries.find((e) => e.status === 'concluded') || entries[0];
        if (sampleConcluded) {
          setActiveEntryId(sampleConcluded.id);
          setActiveView('reader');
        }
        break;
      }
      case 'the-return': {
        setIsBookmarksOpen(false);
        setIsSettingsOpen(false);
        const candidate = selectReturnCandidate(entries);
        if (candidate) {
          setReturnCandidate(candidate);
        }
        setActiveView('return');
        break;
      }
      case 'themes':
        setIsBookmarksOpen(false);
        setIsSettingsOpen(false);
        setActiveView('themes');
        break;
      default:
        setActiveView('reflections');
        break;
    }
  };

  const handleSaveSettings = async (updatedSettings: UserSettings) => {
    if (!currentUser?.uid) return;
    if (currentUser.uid === DEMO_USER_ID) {
      setSettings(updatedSettings);
      showToast('Preferences saved.', 'success');
      return;
    }
    try {
      await saveUserSettingsToFirestore(currentUser.uid, updatedSettings);
      setSettings(updatedSettings);
      showToast('Preferences saved.', 'success');
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      showToast('Failed to save preferences to database.', 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      if (currentUser?.uid === DEMO_USER_ID) {
        setCurrentUser(null);
        setEntries([]);
        setThemes([]);
        setObservations([]);
        setActiveEntryId(null);
        setActiveView('reflections');
        showToast('Signed out of demo space.', 'info');
        return;
      }
      await signOutUser();
      showToast('Signed out safely.', 'info');
    } catch (err: any) {
      console.error('Sign out error:', err);
      showToast('Could not sign out completely.', 'error');
    }
  };

  // Demo simulation mode handlers
  const handleEnterDemoMode = () => {
    const demoUser: UserProfile = {
      uid: DEMO_USER_ID,
      displayName: 'Demo Evaluator',
      email: 'evaluator@locus.local',
      photoURL: null,
    };
    const sample = getSampleDemoDataset(DEMO_USER_ID);
    setCurrentUser(demoUser);
    setEntries(sample.entries);
    setThemes(sample.themes);
    setObservations(sample.observations);
    setActiveEntryId(sample.entries[0]?.id || null);
    setActiveView('reflections');
    showToast('Demo space loaded with 30-day reflection history.', 'info');
  };

  const handleLoadDemoData = () => {
    const uid = currentUser?.uid || DEMO_USER_ID;
    const sample = getSampleDemoDataset(uid);
    setEntries((prev) => {
      const existingIds = new Set(prev.map((e) => e.id));
      const fresh = sample.entries.filter((e) => !existingIds.has(e.id));
      return [...fresh, ...prev];
    });
    setThemes((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const fresh = sample.themes.filter((t) => !existingIds.has(t.id));
      return [...prev, ...fresh];
    });
    setObservations((prev) => {
      const existingIds = new Set(prev.map((o) => o.id));
      const fresh = sample.observations.filter((o) => !existingIds.has(o.id));
      return [...prev, ...fresh];
    });
    showToast('30-Day simulation dataset loaded.', 'success');
  };

  const handleClearDemoData = () => {
    setEntries((prev) => prev.filter((e) => !e.isDemo));
    setThemes((prev) => prev.filter((t) => !t.isDemo));
    setObservations((prev) => prev.filter((o) => !o.id.startsWith('demo-obs-')));
    showToast('Demo records cleared.', 'info');
  };

  // Resolve currently active entry
  const activeEntry = entries.find((e) => e.id === activeEntryId) || null;

  // Render loading splash while verifying auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-accent-sage flex items-center justify-center text-white mx-auto shadow-xs">
            <LocusMark className="w-5 h-5" />
          </div>
          <p className="font-serif text-base text-text-primary">Opening your reflection space...</p>
        </div>
      </div>
    );
  }

  // Render Landing page if not signed in
  if (!currentUser) {
    return (
      <LandingPage
        onError={(msg) => showToast(msg, 'error')}
        onEnterDemoMode={handleEnterDemoMode}
        isDark={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-primary font-sans antialiased overflow-x-hidden w-full">
      {/* Universal Sticky Navbar */}
      <Navbar
        user={currentUser}
        onNewSession={() => createNewSession()}
        activeView={activeView === 'reader' ? 'reflections' : activeView}
        onViewChange={(view) => {
          if (view === 'return') {
            handleOpenTheReturn();
          } else {
            setActiveView(view);
          }
        }}
        hasReturnCandidate={hasReturnCandidate}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenTour={() => setIsWalkthroughOpen(true)}
        bookmarkCount={bookmarkCount}
        onSignOut={handleSignOut}
        totalSessions={entries.length}
        isDark={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Screen 1: Reflections Home (Default) */}
      {activeView === 'reflections' && (
        <main className="flex-1 overflow-y-auto">
          <ReflectionsHome
            entries={entries}
            themes={themes}
            onSelectEntry={(entry) => {
              setActiveEntryId(entry.id);
              setInitialPrompt(undefined);
              if (entry.status === 'concluded') {
                setActiveView('reader');
              } else {
                setActiveView('session');
              }
            }}
            onNewReflection={(promptText) => createNewSession(promptText)}
            onSelectTheme={(theme) => {
              setActiveView('themes');
            }}
            onOpenTheReturn={handleOpenTheReturn}
            onOpenBookmarks={() => setIsBookmarksOpen(true)}
            onStartTour={() => setIsWalkthroughOpen(true)}
            isLoading={isLoadingData}
          />
        </main>
      )}

      {/* Screen 2: Active Workspace (Dialogue & Reflection Stream) */}
      {activeView === 'session' && activeEntry && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <SessionWorkspace
            interaction={activeEntry}
            onUpdateInteraction={handleUpdateEntry}
            onConcludeEntry={handleConcludeEntry}
            onNewSession={() => createNewSession()}
            onOpenSummary={() => {}}
            onOpenSaveNotebook={() => {}}
            isSaving={isSaving}
            saveError={saveError}
            onRetrySave={() => activeEntry && saveEntry(activeEntry)}
            onError={(msg) => showToast(msg, 'error')}
            categories={settings.categories}
            customInstructions={settings.customInstructions}
            personaTone={settings.personaTone}
            isSidebarOpen={false}
            initialPrompt={initialPrompt}
            onDismissInitialPrompt={() => setInitialPrompt(undefined)}
            onNavigateToThemes={() => setActiveView('themes')}
          />
        </div>
      )}

      {/* Screen 2.5: Concluded Entry Reader & Strata Margins */}
      {activeView === 'reader' && activeEntry && (
        <EntryReaderWithStrata
          entry={activeEntry}
          onBack={() => setActiveView('reflections')}
          onViewThemes={() => setActiveView('themes')}
          onNewReflection={() => createNewSession()}
          onUpdateEntry={handleUpdateEntry}
        />
      )}

      {/* Screen 2.6: The Return (Daily Archivist Loop) */}
      {activeView === 'return' && returnCandidate && (
        <TheReturnView
          candidate={returnCandidate}
          onWriteInMargin={(entry) => {
            setActiveEntryId(entry.id);
            setActiveView('reader');
          }}
          onDismiss={() => setActiveView('reflections')}
          onSelectOtherEntry={(otherId) => {
            setActiveEntryId(otherId);
            setActiveView('reader');
          }}
        />
      )}

      {/* Screen 3: Themes Master-Detail & Concept Graph */}
      {activeView === 'themes' && (
        <main className="flex-1 overflow-y-auto">
          <ThemesView
            themes={themes}
            observations={observations}
            entries={entries}
            onSelectEntry={(entry) => {
              setActiveEntryId(entry.id);
              setInitialPrompt(undefined);
              if (entry.status === 'concluded') {
                setActiveView('reader');
              } else {
                setActiveView('session');
              }
            }}
            onNewReflectionWithPrompt={(promptText) => createNewSession(promptText)}
            isLoading={isLoadingData}
          />
        </main>
      )}

      {/* Drawer: Bookmarks */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        entries={entries}
        onSelectEntry={(entry) => {
          setActiveEntryId(entry.id);
          if (entry.status === 'concluded') {
            setActiveView('reader');
          } else {
            setActiveView('session');
          }
        }}
        onRemoveBookmark={(entryId, turnId) => {
          const entry = entries.find((e) => e.id === entryId);
          if (entry && entry.turns) {
            const updatedTurns = entry.turns.map((t) =>
              t.id === turnId ? { ...t, isBookmarked: false, isPinned: false } : t
            );
            handleUpdateEntry({ ...entry, turns: updatedTurns });
          }
        }}
      />

      {/* Screen 4: Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        allInteractions={entries}
        allNotebookItems={[]}
        onShowToast={showToast}
        onLoadDemoData={handleLoadDemoData}
        onClearDemoData={handleClearDemoData}
        onOpenTour={() => {
          setIsSettingsOpen(false);
          setIsWalkthroughOpen(true);
        }}
      />

      {/* Interactive Guided Walkthrough */}
      <WalkthroughOverlay
        isOpen={isWalkthroughOpen}
        onClose={() => {
          setIsWalkthroughOpen(false);
          setIsBookmarksOpen(false);
        }}
        onStepChange={handleWalkthroughStepChange}
      />

      {/* Notifications / Error Toast */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={closeToast}
        onRetry={toastType === 'error' && activeEntry ? () => saveEntry(activeEntry) : undefined}
        actionLabel={toastActionLabel}
        onAction={toastOnAction}
        subText={toastSubText}
      />
    </div>
  );
}
