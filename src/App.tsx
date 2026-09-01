import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  auth, 
  signOutUser, 
  fetchUserInteractions, 
  saveInteractionToFirestore, 
  deleteInteractionFromFirestore,
  fetchUserNotebookItems,
  saveNotebookItemToFirestore,
  deleteNotebookItemFromFirestore,
  fetchUserSettings,
  saveUserSettingsToFirestore,
  DEFAULT_SETTINGS
} from './lib/firebase';
import { Interaction, UserProfile, UserSettings, NotebookItem } from './types';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { SidebarHistory } from './components/SidebarHistory';
import { SessionWorkspace } from './components/SessionWorkspace';
import { NotebookView } from './components/NotebookView';
import { SaveToNotebookModal } from './components/SaveToNotebookModal';
import { SettingsDrawer } from './components/SettingsDrawer';
import { IntelligenceDrawer } from './components/IntelligenceDrawer';
import { Toast } from './components/Toast';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Active View ('reflections' vs 'notebook')
  const [activeView, setActiveView] = useState<'reflections' | 'notebook'>('reflections');

  // Firestore Data State
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [notebookItems, setNotebookItems] = useState<NotebookItem[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoadingInteractions, setIsLoadingInteractions] = useState<boolean>(false);

  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isOnlyStarred, setIsOnlyStarred] = useState<boolean>(false);

  // Persistence status & Toast State
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Modal / Drawer States
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerType, setDrawerType] = useState<'session_summary' | 'cross_synthesis'>('session_summary');

  // Save to Notebook Modal & Dynamic Toast State
  const [isSaveNotebookOpen, setIsSaveNotebookOpen] = useState<boolean>(false);
  const [notebookExcerpt, setNotebookExcerpt] = useState<string>('');
  const [editingNotebookItem, setEditingNotebookItem] = useState<NotebookItem | null>(null);

  // Toast dynamic action support
  const [toastActionLabel, setToastActionLabel] = useState<string | undefined>(undefined);
  const [toastOnAction, setToastOnAction] = useState<(() => void) | undefined>(undefined);
  const [toastSubText, setToastSubText] = useState<string | undefined>(undefined);

  // Collapsible Sidebar State (persisted locally)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('reflectai_sidebar_open');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('reflectai_sidebar_open', String(next));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }
      return next;
    });
  };

  // Keyboard shortcut: Ctrl+B / ⌘B to toggle sidebar
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

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
        setInteractions([]);
        setNotebookItems([]);
        setSettings(DEFAULT_SETTINGS);
        setActiveSessionId(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch User Data (Interactions, Notebook, Settings) from Firestore
  const loadUserData = useCallback(async (userId: string) => {
    try {
      setIsLoadingInteractions(true);
      const [fetchedInteractions, fetchedNotebook, fetchedSettings] = await Promise.all([
        fetchUserInteractions(userId),
        fetchUserNotebookItems(userId),
        fetchUserSettings(userId),
      ]);

      setInteractions(fetchedInteractions);
      setNotebookItems(fetchedNotebook);
      setSettings(fetchedSettings);

      if (fetchedInteractions.length > 0) {
        setActiveSessionId(fetchedInteractions[0].id);
      } else {
        // Create initial default new reflection if none exist
        createNewSession(userId, fetchedSettings);
      }
    } catch (err: any) {
      console.error('Error loading user data:', err);
      showToast('Could not load user data from Firestore. Check connection.', 'error');
    } finally {
      setIsLoadingInteractions(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.uid) {
      loadUserData(currentUser.uid);
    }
  }, [currentUser?.uid, loadUserData]);

  // Helper: Create a fresh new reflection session
  const createNewSession = (userId?: string, currentSettings?: UserSettings) => {
    const uid = userId || currentUser?.uid;
    if (!uid) return;

    const activeConf = currentSettings || settings;
    const initialCategory = activeConf.categories[0] || 'Personal';

    const newId = 'session-' + Date.now();
    const newSession: Interaction = {
      id: newId,
      userId: uid,
      title: 'New Reflection',
      category: initialCategory,
      mode: activeConf.defaultStance || 'reflect',
      turns: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInteractions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setActiveView('reflections');

    // Save initial session draft to Firestore
    saveSession(newSession, uid);
  };

  // 3. Save Session with Guaranteed Transaction Verification
  const saveSession = async (sessionToSave: Interaction, userId?: string) => {
    const uid = userId || currentUser?.uid;
    if (!uid) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await saveInteractionToFirestore(uid, sessionToSave);
      setIsSaving(false);
    } catch (err: any) {
      console.error('Firestore save failed:', err);
      setIsSaving(false);
      setSaveError('Failed to save to Firestore.');
      showToast('Database sync interrupted. Click retry to persist.', 'error');
    }
  };

  const handleUpdateInteraction = (updated: Interaction) => {
    setInteractions((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    saveSession(updated);
  };

  const handleDeleteInteraction = async (interactionId: string) => {
    if (!currentUser?.uid) return;

    try {
      await deleteInteractionFromFirestore(currentUser.uid, interactionId);
      const remaining = interactions.filter((item) => item.id !== interactionId);
      setInteractions(remaining);

      if (activeSessionId === interactionId) {
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
        } else {
          createNewSession();
        }
      }
      showToast('Reflection removed from Firestore.', 'info');
    } catch (err: any) {
      console.error('Failed to delete interaction:', err);
      showToast('Failed to delete reflection from Firestore.', 'error');
    }
  };

  const handleToggleStar = (item: Interaction) => {
    const updated = {
      ...item,
      starred: !item.starred,
      updatedAt: new Date().toISOString(),
    };
    handleUpdateInteraction(updated);
  };

  // Notebook Handlers
  const handleSaveNotebookItem = async (newItem: NotebookItem) => {
    if (!currentUser?.uid) return;
    try {
      await saveNotebookItemToFirestore(currentUser.uid, newItem);
      setNotebookItems((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id)]);
      showToast('Insight saved to your Notebook.', 'success');
    } catch (err: any) {
      console.error('Failed to save notebook item:', err);
      showToast('Failed to save notebook note.', 'error');
    }
  };

  const handleDeleteNotebookItem = async (itemId: string) => {
    if (!currentUser?.uid) return;
    try {
      await deleteNotebookItemFromFirestore(currentUser.uid, itemId);
      setNotebookItems((prev) => prev.filter((i) => i.id !== itemId));
      showToast('Note deleted.', 'info');
    } catch (err: any) {
      console.error('Failed to delete notebook item:', err);
      showToast('Failed to delete note.', 'error');
    }
  };

  const handleUpdateNotebookItem = async (updatedItem: NotebookItem) => {
    if (!currentUser?.uid) return;
    try {
      await saveNotebookItemToFirestore(currentUser.uid, updatedItem);
      setNotebookItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
      showToast('Note updated.', 'success');
    } catch (err: any) {
      console.error('Failed to update notebook item:', err);
      showToast('Failed to update note.', 'error');
    }
  };

  const handleTriggerSaveNotebook = async (excerptText: string) => {
    if (!currentUser?.uid || !activeInteraction) return;

    // 1. Determine folder based on user settings
    let initialFolder = activeInteraction.title || 'General Reflections';
    if (settings.defaultFolderPattern === 'category') {
      initialFolder = activeInteraction.category || 'Personal';
    } else if (settings.defaultFolderPattern === 'date') {
      initialFolder = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }

    const noteId = 'note-' + Date.now();
    const createdIso = new Date().toISOString();

    // 2. Initial optimistic item
    const initialItem: NotebookItem = {
      id: noteId,
      userId: currentUser.uid,
      interactionId: activeInteraction.id,
      folderName: initialFolder,
      sourceTitle: activeInteraction.title,
      excerpt: excerptText.trim(),
      contextHint: undefined,
      tags: [activeInteraction.category],
      createdAt: createdIso,
      updatedAt: createdIso,
    };

    // Save immediately in memory and Firestore
    setNotebookItems((prev) => [initialItem, ...prev.filter((i) => i.id !== noteId)]);
    saveNotebookItemToFirestore(currentUser.uid, initialItem).catch((err) => {
      console.error('Initial background notebook save error:', err);
    });

    // 3. Show dynamic pop-up notification with option to open personal note modal
    showToast(
      'Saved to Notebook',
      'success',
      'Add Personal Note',
      () => {
        setNotebookExcerpt(excerptText);
        setEditingNotebookItem(initialItem);
        setIsSaveNotebookOpen(true);
      },
      settings.autoGenerateContextHint ? 'AI Context Note is generating in the background...' : `Saved to folder "${initialFolder}"`
    );

    // 4. If AI context hints are enabled, distill context in the background
    if (settings.autoGenerateContextHint && excerptText.trim()) {
      try {
        const res = await fetch('/api/notebook/context-hint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            excerpt: excerptText.trim(),
            sourceTitle: activeInteraction.title,
            category: activeInteraction.category,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const hint = data.contextHint || '';
          if (hint) {
            const updatedItemWithHint: NotebookItem = {
              ...initialItem,
              contextHint: hint,
              updatedAt: new Date().toISOString(),
            };

            setNotebookItems((prev) =>
              prev.map((item) => (item.id === noteId ? { ...item, contextHint: hint } : item))
            );

            // Update modal state if user already opened it
            setEditingNotebookItem((curr) => (curr && curr.id === noteId ? { ...curr, contextHint: hint } : curr));

            // Persist distilled context note to Firestore in background
            await saveNotebookItemToFirestore(currentUser.uid, updatedItemWithHint);
          }
        }
      } catch (err) {
        console.warn('Background context generation fallback:', err);
      }
    }
  };

  // Settings Handler
  const handleSaveSettings = async (updatedSettings: UserSettings) => {
    if (!currentUser?.uid) return;
    try {
      await saveUserSettingsToFirestore(currentUser.uid, updatedSettings);
      setSettings(updatedSettings);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      showToast('Failed to save settings to Firestore.', 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      showToast('Signed out securely.', 'info');
    } catch (err: any) {
      showToast('Sign out error: ' + err.message, 'error');
    }
  };

  // Active interaction finder
  const activeInteraction = interactions.find((i) => i.id === activeSessionId) || null;

  // Filtered interactions by search term
  const displayedInteractions = interactions.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchTitle = item.title.toLowerCase().includes(term);
    const matchCategory = item.category.toLowerCase().includes(term);
    const matchTurns = item.turns?.some((t) => t.content.toLowerCase().includes(term));
    return matchTitle || matchCategory || matchTurns;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-800 rounded-full animate-spin" />
        <p className="text-sm font-medium text-stone-600 font-serif">Connecting to ReflectAI...</p>
      </div>
    );
  }

  // 4. Unauthenticated View
  if (!currentUser) {
    return (
      <>
        <LandingPage onError={(msg) => showToast(msg, 'error')} />
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      </>
    );
  }

  // 5. Authenticated Dashboard View
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <Navbar
        user={currentUser}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewSession={() => createNewSession()}
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSignOut={handleSignOut}
        totalSessions={interactions.length}
        notebookCount={notebookItems.length}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* Main Workspace Layout */}
      {activeView === 'reflections' ? (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left History Sidebar */}
          <SidebarHistory
            interactions={displayedInteractions}
            selectedId={activeSessionId}
            onSelect={setActiveSessionId}
            onDelete={handleDeleteInteraction}
            onToggleStar={handleToggleStar}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            isOnlyStarred={isOnlyStarred}
            onToggleOnlyStarred={() => setIsOnlyStarred((prev) => !prev)}
            isLoading={isLoadingInteractions}
            categories={settings.categories}
            isOpen={isSidebarOpen}
            onToggleCollapse={toggleSidebar}
          />

          {/* Center Workspace */}
          {activeInteraction ? (
            <SessionWorkspace
              interaction={activeInteraction}
              onUpdateInteraction={handleUpdateInteraction}
              onOpenSummary={() => {
                setDrawerType('session_summary');
                setIsDrawerOpen(true);
              }}
              onOpenSaveNotebook={handleTriggerSaveNotebook}
              isSaving={isSaving}
              saveError={saveError}
              onRetrySave={() => activeInteraction && saveSession(activeInteraction)}
              onError={(msg) => showToast(msg, 'error')}
              categories={settings.categories}
              customInstructions={settings.customInstructions}
              personaTone={settings.personaTone}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={toggleSidebar}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-stone-400">
              <p>Select or create a reflection to get started.</p>
            </div>
          )}
        </div>
      ) : (
        /* Notebook View */
        <NotebookView
          items={notebookItems}
          interactions={interactions}
          onOpenInteraction={(id) => {
            setActiveSessionId(id);
            setActiveView('reflections');
          }}
          onDeleteItem={handleDeleteNotebookItem}
          onUpdateItem={handleUpdateNotebookItem}
          onOpenSynthesis={() => {
            setDrawerType('cross_synthesis');
            setIsDrawerOpen(true);
          }}
        />
      )}

      {/* Save to Notebook Modal */}
      {activeInteraction && (
        <SaveToNotebookModal
          isOpen={isSaveNotebookOpen}
          onClose={() => {
            setIsSaveNotebookOpen(false);
            setEditingNotebookItem(null);
          }}
          excerpt={notebookExcerpt}
          sourceInteraction={activeInteraction}
          onSave={(savedItem) => {
            handleSaveNotebookItem(savedItem);
            setEditingNotebookItem(null);
          }}
          autoContextEnabled={settings.autoGenerateContextHint}
          folderPattern={settings.defaultFolderPattern}
          initialItem={editingNotebookItem}
        />
      )}

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        allInteractions={interactions}
        allNotebookItems={notebookItems}
        onShowToast={showToast}
      />

      {/* Right Intelligence Drawer / Modal */}
      <IntelligenceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        type={drawerType}
        activeInteraction={activeInteraction}
        allInteractions={interactions}
        onSaveSummaryToSession={(summary) => {
          if (activeInteraction) {
            handleUpdateInteraction({
              ...activeInteraction,
              summary,
            });
          }
        }}
        onError={(msg) => showToast(msg, 'error')}
      />

      {/* Notifications / Error Toast */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={closeToast}
        onRetry={() => activeInteraction && saveSession(activeInteraction)}
        actionLabel={toastActionLabel}
        onAction={toastOnAction}
        subText={toastSubText}
      />
    </div>
  );
}
