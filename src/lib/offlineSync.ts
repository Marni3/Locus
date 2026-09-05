/**
 * Locus Offline Sync & Draft Persistence
 * Backed by IndexedDB to ensure no user thought is ever lost during network drops.
 */

const DB_NAME = 'locus_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface OfflineDraft {
  id: string; // entryId
  title: string;
  turns: any[];
  updatedAt: string;
  isDirty: boolean;
}

/**
 * Saves or updates an active reflection draft in local IndexedDB storage.
 */
export async function saveDraftOffline(draft: OfflineDraft): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(draft);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not save draft to IndexedDB:', err);
  }
}

/**
 * Loads a cached offline draft for a specific entry.
 */
export async function loadDraftOffline(entryId: string): Promise<OfflineDraft | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(entryId);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not load draft from IndexedDB:', err);
    return null;
  }
}

/**
 * Clears an offline draft once safely synced to Firestore.
 */
export async function clearDraftOffline(entryId: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(entryId);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not delete draft from IndexedDB:', err);
  }
}
