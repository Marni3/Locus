/**
 * PII Detection Patterns (RFC & E.164 compliant with false-positive mitigation)
 *
 * NOTE: As documented in .agents/skills/pii-sanitizer-implementation/SKILL.md,
 * regex detection is a defense-in-depth layer for structured identifiers.
 * It is not a complete guarantee for unstructured personal names.
 */

// Email: Standard alphanumeric + domain. Rejects isolated "@google/genai"
export const EMAIL_REGEX = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;

// Phone Numbers:
// 1. International E.164 with + prefix (e.g., +63 917 555 1234, +44 20 7946 0958)
export const PHONE_INTL_REGEX = /\+(?:[0-9][-.\s]?){8,14}[0-9]\b/g;

// 2. Standard 10-digit formats with dashes, dots, or parentheses (e.g. 415-555-2671, (212) 555-0199, 800.555.0142)
// Does NOT match dates like 2026-09-04 (4 digits first) or short metrics
export const PHONE_STANDARD_REGEX = /(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\b\d{3})[-.\s]\d{3}[-.\s]\d{4}\b/g;

// Physical Street Addresses:
// Number (1-5 digits) + Street name + Standard street suffixes (Ave, St, Blvd, Road, Terrace, etc.)
export const STREET_ADDRESS_REGEX = /\b\d{1,5}\s+(?:[A-Za-z0-9#.-]+\s+){1,4}(?:Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Lane|Ln|Court|Ct|Way|Place|Pl|Terrace|Ter)\b/gi;
