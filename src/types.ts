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
  concludedBy?: 'manual' | 'auto_timer';
  bodySealedAt?: string;          // Proof of immutability
  bodyHash?: string;              // SHA-256 hash of sealed transcript
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
  stratumCount?: number;          // Denormalized count of margin notes
  lastReturnedAt?: string | null; // For The Return scheduling
  returnCount?: number;
  openThreads?: string[];         // Open threads marked during reflection
  turns?: Message[];              // In-memory or fetched conversational turns
}

export interface Message {
  id: string;
  entryId: string;
  userId?: string;
  role: 'user' | 'ai' | 'model';
  content: string;
  timestamp: string;
  createdAt?: string;             // alias for backwards compatibility
  isBookmarked?: boolean;         // Current canonical field
  isPinned?: boolean;             // Backwards-compatible alias
  note?: string;                  // User analytical note
  status?: 'pending' | 'sent' | 'failed';
}

// Strata Margin Layer (Marginalia on Concluded Entries)
export type StratumStance = 'correction' | 'confirmation' | 'question' | 'grief' | 'gratitude';

export interface StratumAnchor {
  turnId?: string;                // Specific turn anchored, or null for whole entry
  startOffset: number;
  endOffset: number;
  quotedText: string;
}

export interface Stratum {
  id: string;
  entryId: string;
  userId: string;
  parentStratumId?: string | null;// Depth 2-3 (note on a note)
  anchor?: StratumAnchor | null;  // Text selection in entry
  bodyMarkdown: string;           // Immutable once saved
  depth: 1 | 2 | 3;
  daysLater: number;              // Elapsed days since entry conclusion
  stance: StratumStance;
  createdAt: string;
  sealedAt: string;
  isDemo?: boolean;
}

// The Return (Daily Archivist Surface)
export type ReturnReason = 
  | 'anniversary'    // "Written 1 year ago today"
  | 'unresolved'     // "You left an open thread here"
  | 'contradiction'  // "A later entry says the opposite of this"
  | 'recurrence'     // "Fifth entry under this theme"
  | 'dormant';       // "Not revisited in 6 months"

export interface ReturnCandidate {
  entry: Entry;
  strata: Stratum[];
  reason: ReturnReason;
  evidence: string;               // e.g. "Written 1 year ago today · 2 strata"
  contradictingEntry?: {
    id: string;
    title: string;
    date: string;
    excerpt: string;
  };
}

export interface Theme {
  id: string;
  userId: string;
  title: string;
  currentSynthesis: string;       // rolling 2-3 sentences
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
  sourceType?: 'entry_conclusion' | 'stratum_annotation'; // Provenance
  stratumId?: string;             // Linked stratum if applicable
  locationSnapshot?: string;      // e.g. "Home Office" at observation time
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
  emailCadence?: 'conclusion' | 'weekly_digest' | 'off';
  weeklyDigestDay?: 'sunday' | 'monday' | 'friday';
  weeklyDigestHour?: number;
  fontFamily?: 'Literata' | 'Inter' | 'Roboto' | 'Overpass' | 'Overpass Mono';
  accentColor?: 'sage' | 'moss' | 'irongall' | 'ochre' | 'terracotta';
  reducedMotion?: boolean;
  themeMode?: 'system' | 'light' | 'dark';
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role?: 'user' | 'admin';
}
