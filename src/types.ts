export interface InteractionTurn {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

export type ReflectionMode = 'reflect' | 'brainstorm' | 'actionable' | 'mindful';
export type ReflectionStance = ReflectionMode;

export interface Interaction {
  id: string;
  userId: string;
  title: string;
  category: string;
  mood?: string;
  mode: ReflectionMode;
  turns: InteractionTurn[];
  summary?: string;
  keyTakeaways?: string[];
  tags: string[];
  starred?: boolean;
  createdAt: string;
  updatedAt: string;
}

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
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
