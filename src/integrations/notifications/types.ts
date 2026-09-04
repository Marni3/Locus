import { Theme, Entry } from '../../types';

export interface WebhookValidationResult {
  isValid: boolean;
  error?: string;
  resolvedIp?: string;
}

export interface MorningDigestPayload {
  userId: string;
  digestDate: string;
  yesterdayHighlights: Array<{
    entryId: string;
    title: string;
    summary: string;
  }>;
  readyThemes: Array<{
    themeId: string;
    title: string;
    observationCount: number;
    currentSynthesis: string;
  }>;
  dayFramingPrompt: string;
}

export interface DispatchResult {
  success: boolean;
  channel: 'webhook' | 'email';
  statusCode?: number;
  error?: string;
  dispatchedAt: string;
}
