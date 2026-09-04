export type EntryStatus = 'active' | 'concluded';

export interface EntryLocation {
  name: string;            // e.g. "Balanga, Bataan", "Home Office", or "The Mill Coffee, SF"
  latitude?: number;       // Optional GPS lat
  longitude?: number;      // Optional GPS lng
  source: 'gps' | 'manual';
}

export type ReflectionMode = 'reflect' | 'brainstorm' | 'actionable' | 'mindful';
export type ReflectionStance = ReflectionMode;

export interface Entry {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  concludedAt?: string;
  status: EntryStatus;
  summary?: string;
  locationContext?: EntryLocation | null;
  category?: string;
  mood?: string;
  mode?: ReflectionMode;
  stance?: ReflectionStance;
  keyTakeaways?: string[];
  tags?: string[];
  starred?: boolean;
  isDemo?: boolean;
  updatedAt?: string;
  turns?: Message[]; // In-memory or fetched conversational turns
}

export interface Message {
  id: string;
  entryId: string;
  userId?: string;
  role: 'user' | 'ai' | 'model';
  content: string;
  timestamp: string;
  createdAt?: string; // alias for backwards compatibility
  isPinned?: boolean;
  note?: string;
}

export interface Theme {
  id: string;
  userId: string;
  title: string;
  currentSynthesis: string; // rolling 2-3 sentences
  observationCount: number;
  createdAt: string;
  updatedAt: string;
  embedding?: number[];
  isDemo?: boolean;
}

export interface ThemeObservation {
  id: string;
  userId: string;
  entryId: string;
  themeId: string;
  observationText: string;
  timestamp: string;
  locationSnapshot?: string; // e.g. "Home Office" at observation time
  isDemo?: boolean;
}

// Deprecated aliases maintained for smooth progressive migration
export type Interaction = Entry;
export type InteractionTurn = Message;

export interface NotebookItem {
  id: string;
  userId: string;
  interactionId: string;
  folderName: string;
  sourceTitle: string;
  excerpt: string;
  contextHint?: string;
  userNote?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type PersonaTone = 'Warm' | 'Direct' | 'Reflective' | 'Mindful' | 'Playful';

export interface UserSettings {
  customInstructions: string;
  personaTone: PersonaTone;
  defaultStance: ReflectionMode;
  categories: string[];
  autoGenerateContextHint: boolean;
  defaultFolderPattern: 'source_title' | 'category' | 'date';
  isDemoMode?: boolean;
  webhookUrl?: string;
  emailNotifications?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role?: 'user' | 'admin';
}
