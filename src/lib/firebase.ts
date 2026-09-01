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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Interaction, NotebookItem, UserSettings } from '../types';

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
 * Utility: Strips any undefined fields recursively to prevent Firestore write crashes.
 */
export function stripUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    return value === undefined ? null : value;
  }));
}

/* ================= INTERACTIONS ================= */
export const saveInteractionToFirestore = async (userId: string, interaction: Interaction): Promise<void> => {
  if (!userId || !interaction.id) {
    throw new Error("Invalid userId or interaction ID for persistence");
  }
  const cleanData = stripUndefined({
    ...interaction,
    userId,
    updatedAt: new Date().toISOString()
  });

  const docRef = doc(db, 'users', userId, 'interactions', interaction.id);
  await setDoc(docRef, cleanData, { merge: true });
};

export const fetchUserInteractions = async (userId: string): Promise<Interaction[]> => {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'users', userId, 'interactions'),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const interactions: Interaction[] = [];
    snapshot.forEach((docSnapshot) => {
      interactions.push(docSnapshot.data() as Interaction);
    });
    return interactions;
  } catch (error) {
    console.error('Error fetching interactions:', error);
    // Fallback: fetch without ordering if index is building
    const qSimple = collection(db, 'users', userId, 'interactions');
    const snapshot = await getDocs(qSimple);
    const list: Interaction[] = [];
    snapshot.forEach((d) => list.push(d.data() as Interaction));
    return list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  }
};

export const deleteInteractionFromFirestore = async (userId: string, interactionId: string): Promise<void> => {
  if (!userId || !interactionId) return;
  const docRef = doc(db, 'users', userId, 'interactions', interactionId);
  await deleteDoc(docRef);
};

/* ================= NOTEBOOK ITEMS ================= */
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
    console.error('Error fetching notebook items:', error);
    const qSimple = collection(db, 'users', userId, 'notebook');
    const snapshot = await getDocs(qSimple);
    const list: NotebookItem[] = [];
    snapshot.forEach((d) => list.push(d.data() as NotebookItem));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

