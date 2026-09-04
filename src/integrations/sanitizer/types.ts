export interface SanitizeOptions {
  maskEmails?: boolean;
  maskPhones?: boolean;
  maskAddresses?: boolean;
}

export interface SanitizationResult {
  sanitizedText: string;
  hasRedactions: boolean;
  redactedCounts: {
    emails: number;
    phones: number;
    addresses: number;
  };
}
