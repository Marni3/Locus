---
name: pii-sanitizer-implementation
description: Use whenever implementing, modifying, or calling the PII sanitization pass — the regex-based scrub applied to any content leaving the system boundary (Gemini API calls, embedding generation, webhook/email payloads). Covers where it must be invoked, what it does and doesn't catch, and how to test it. Scope is outbound-only per the product decision — raw content stays unredacted in Firestore. Builds on third-party-integration-standards.
---

# PII sanitizer implementation

## One function, called from one place per egress point
Implement a single `sanitizeForOutbound(text: string): string` in `src/integrations/sanitizer/` (or equivalent). Every integration wrapper that sends content outward — the Gemini client, the embedding client, the webhook dispatcher, the email dispatcher — calls this same function on the content before it leaves. Never let an individual integration re-implement its own regex pass; a second implementation is a second place for the patterns to drift out of sync.

## What it catches
Structured, pattern-matchable identifiers only: phone numbers, email addresses, exact street addresses. This is deliberate — it does not and should not attempt to strip general personal/emotional content, since that would gut the actual conversation the AI needs to respond to.

## What it does NOT reliably catch — be honest about this in the code comments and the README
Regex-based PII detection has real false-negative rates, especially for:
- international phone number formats
- street addresses without a very regular pattern
- names (not attempted here at all — no NER model in scope for MVP)
This is a defense-in-depth layer, not a guarantee. Document that limitation explicitly rather than implying the sanitizer makes outbound data PII-free.

## Where it's called
- Before the transcript (or transcript summary) is sent to the Gemini API for the synthesis/extraction pass.
- Before text is sent to the embeddings API.
- Before any content is placed into a webhook or email payload (see notification-dispatcher-integration).
- **Not** on the write path to Firestore — raw content is stored as the user wrote it, per the product decision to keep the user's own view of their own entries unredacted.

## Logging discipline
Application logs must only ever contain sanitized content, or no content at all (log entry IDs/operation names, not text). This applies even to error logs — a stack trace that happens to include the raw exception message containing user text is still a leak.

## Testing
Maintain a fixture file of known PII strings (a handful of phone formats, emails, addresses) and known non-PII strings that resemble PII (a sentence that happens to contain a number sequence) to catch both false negatives and false positives. Run this suite whenever the regex patterns change — this is exactly the kind of test that silently rots if it's only run once at initial implementation.
