import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Entry, Message, Theme, ThemeObservation, UserSettings, NotebookItem } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

export const signOutUser = async () => {
  return await signOut(auth);
};

/**
 * Utility: Recursively strips any undefined fields to prevent Firestore write crashes.
 * Adheres strictly to Locus Software Standard 6.
 */
export function stripUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    return value === undefined ? null : value;
  }));
}

/* ================= ENTRIES (Core Object Model) ================= */

export const saveEntryToFirestore = async (userId: string, entry: Entry): Promise<void> => {
  if (!userId || !entry.id) {
    throw new Error("Invalid userId or entry ID for persistence");
  }
  const cleanData = stripUndefined({
    ...entry,
    userId,
    updatedAt: new Date().toISOString()
  });

  try {
    const docRef = doc(db, 'users', userId, 'entries', entry.id);
    await setDoc(docRef, cleanData, { merge: true });
  } catch (err: any) {
    // If /entries is rejected because remote rules haven't been redeployed, fall back to /interactions
    if (err?.code === 'permission-denied') {
      console.warn('Firestore /entries rejected, persisting to /interactions fallback.');
      const fallbackRef = doc(db, 'users', userId, 'interactions', entry.id);
      await setDoc(fallbackRef, cleanData, { merge: true });
      return;
    }
    throw err;
  }
};

export const fetchUserEntries = async (userId: string): Promise<Entry[]> => {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'users', userId, 'entries'),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const entries: Entry[] = [];
    snapshot.forEach((docSnapshot) => {
      entries.push(docSnapshot.data() as Entry);
    });
    return entries;
  } catch (error) {
    // Try simple un-ordered query on /entries, and catch any permission-denied
    try {
      const qSimple = collection(db, 'users', userId, 'entries');
      const snapshot = await getDocs(qSimple);
      const list: Entry[] = [];
      snapshot.forEach((d) => list.push(d.data() as Entry));
      return list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
    } catch (simpleErr) {
      // Remote Firestore rules do not yet allow /entries, safely return empty to allow /interactions fallback
      return [];
    }
  }
};

export const deleteEntryFromFirestore = async (userId: string, entryId: string): Promise<void> => {
  if (!userId || !entryId) return;
  try {
    const docRef = doc(db, 'users', userId, 'entries', entryId);
    await deleteDoc(docRef);
  } catch {
    try {
      const fallbackRef = doc(db, 'users', userId, 'interactions', entryId);
      await deleteDoc(fallbackRef);
    } catch {}
  }
};

// Aliases for progressive backwards compatibility during migration
export const saveInteractionToFirestore = saveEntryToFirestore;
export const fetchUserInteractions = async (userId: string): Promise<Entry[]> => {
  const entries = await fetchUserEntries(userId);
  if (entries.length > 0) return entries;
  
  // Read legacy /interactions when entries is empty or unavailable
  try {
    const qLegacy = collection(db, 'users', userId, 'interactions');
    const snap = await getDocs(qLegacy);
    const legacyList: Entry[] = [];
    snap.forEach(d => legacyList.push(d.data() as Entry));
    return legacyList.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  } catch (err) {
    console.warn('Fallback /interactions query failed:', err);
    return [];
  }
};
export const deleteInteractionFromFirestore = deleteEntryFromFirestore;

/* ================= THEMES & OBSERVATIONS ================= */

export const saveThemeToFirestore = async (userId: string, theme: Theme): Promise<void> => {
  if (!userId || !theme.id) return;
  const cleanData = stripUndefined({
    ...theme,
    userId,
    updatedAt: new Date().toISOString()
  });
  const docRef = doc(db, 'users', userId, 'themes', theme.id);
  await setDoc(docRef, cleanData, { merge: true });
};

export const fetchUserThemes = async (userId: string): Promise<Theme[]> => {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'users', userId, 'themes'), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    const themes: Theme[] = [];
    snapshot.forEach(d => themes.push(d.data() as Theme));
    return themes;
  } catch (error) {
    const qSimple = collection(db, 'users', userId, 'themes');
    const snapshot = await getDocs(qSimple);
    const list: Theme[] = [];
    snapshot.forEach(d => list.push(d.data() as Theme));
    return list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  }
};

export const saveObservationToFirestore = async (userId: string, observation: ThemeObservation): Promise<void> => {
  if (!userId || !observation.id) return;
  const cleanData = stripUndefined({
    ...observation,
    userId
  });
  const docRef = doc(db, 'users', userId, 'observations', observation.id);
  await setDoc(docRef, cleanData, { merge: true });
};

export const fetchThemeObservations = async (userId: string, themeId?: string): Promise<ThemeObservation[]> => {
  if (!userId) return [];
  try {
    let q = themeId 
      ? query(collection(db, 'users', userId, 'observations'), where('themeId', '==', themeId), orderBy('timestamp', 'asc'))
      : query(collection(db, 'users', userId, 'observations'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const observations: ThemeObservation[] = [];
    snapshot.forEach(d => observations.push(d.data() as ThemeObservation));
    return observations;
  } catch (error) {
    const qSimple = collection(db, 'users', userId, 'observations');
    const snapshot = await getDocs(qSimple);
    let list: ThemeObservation[] = [];
    snapshot.forEach(d => list.push(d.data() as ThemeObservation));
    if (themeId) {
      list = list.filter(o => o.themeId === themeId);
    }
    return list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
};

/* ================= NOTEBOOK ITEMS (Deferred) ================= */

export const saveNotebookItemToFirestore = async (userId: string, item: NotebookItem): Promise<void> => {
  if (!userId || !item.id) return;
  const cleanData = stripUndefined({
    ...item,
    userId,
    updatedAt: new Date().toISOString()
  });
  const docRef = doc(db, 'users', userId, 'notebook', item.id);
  await setDoc(docRef, cleanData, { merge: true });
};

export const fetchUserNotebookItems = async (userId: string): Promise<NotebookItem[]> => {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'users', userId, 'notebook'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const list: NotebookItem[] = [];
    snapshot.forEach((docSnapshot) => {
      list.push(docSnapshot.data() as NotebookItem);
    });
    return list;
  } catch (error) {
    try {
      const qSimple = collection(db, 'users', userId, 'notebook');
      const snapshot = await getDocs(qSimple);
      const list: NotebookItem[] = [];
      snapshot.forEach((d) => list.push(d.data() as NotebookItem));
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return [];
    }
  }
};

export const deleteNotebookItemFromFirestore = async (userId: string, itemId: string): Promise<void> => {
  if (!userId || !itemId) return;
  const docRef = doc(db, 'users', userId, 'notebook', itemId);
  await deleteDoc(docRef);
};

/* ================= USER SETTINGS ================= */

export const DEFAULT_SETTINGS: UserSettings = {
  customInstructions: '',
  personaTone: 'Warm',
  defaultStance: 'reflect',
  categories: ['Personal', 'Work', 'Ideas', 'Gratitude', 'Goals', 'Wellbeing'],
  autoGenerateContextHint: true,
  defaultFolderPattern: 'source_title',
  isDemoMode: false,
};

export const saveUserSettingsToFirestore = async (userId: string, settings: UserSettings): Promise<void> => {
  if (!userId) return;
  const cleanData = stripUndefined(settings);
  const docRef = doc(db, 'users', userId, 'settings', 'profile');
  await setDoc(docRef, cleanData, { merge: true });
};

export const fetchUserSettings = async (userId: string): Promise<UserSettings> => {
  if (!userId) return DEFAULT_SETTINGS;
  try {
    const docRef = doc(db, 'users', userId, 'settings', 'profile');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_SETTINGS, ...snap.data() } as UserSettings;
    }
  } catch (err) {
    console.error('Error fetching settings:', err);
  }
  return DEFAULT_SETTINGS;
};
