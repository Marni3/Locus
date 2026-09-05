# Scheduled Tasks & Morning Kickoff Roadmap — Locus (ReflectAI)

This document provides a persistent, tamper-proof record of scheduled tasks, planned morning development, and post-submission stretch goals for **Locus**.

Even when Antigravity IDE or the local machine is powered off, this file preserves all planned instructions and context so you can resume immediately upon bootup.

---

## 📅 Morning Kickoff (Phase 5: Project Documentation)

**Scheduled Time**: Tomorrow morning (e.g., 9:00 AM)  
**Command / Trigger to Say to Antigravity**:
> *"Good morning! Let's execute Phase 5: write the project README and perform the final project audit."*

### Phase 5 Deliverables
1. **Comprehensive Project README (`README.md`)**:
   - **Project Overview**: Core philosophy, the "Anti-Dashboard for the Mind", longitudinal intellectual trajectories, finite sealed pages, and Strata marginalia.
   - **Tech Stack & Architecture**: React 19, TypeScript, TailwindCSS v4, Express 4, Vite 6, Cloud Firestore, Firebase Auth, Google GenAI SDK (`@google/genai`).
   - **Core Features & How They Were Integrated**:
     - *Conversational Session Workspace*: Cognitive stances, multi-turn reflective companion, bookmarks.
     - *Strata Margin Layer*: Sealed immutable pages, temporal distance stamps, 5 semantic ink stances (`correction`, `confirmation`, `question`, `grief`, `gratitude`).
     - *Looking Back (Daily Archivist Loop)*: Explainable provenance heuristics (anniversaries, temporal distance, contradictions).
     - *Themes Constellation & Concept Graph*: Vector similarity clustering, live physics simulation, sub-graph drill-downs, Unpack Further essays.
     - *Third-Party Integrations*: Google Maps Geocoding with coordinate minimization, send-time SSRF-hardened webhooks, development email mock dispatcher.
   - **Security & Privacy Architecture (5 Threat Zones)**: Outbound PII redaction gate (`src/lib/sanitizer.ts`), prompt delimiter isolation, webhook IP range blocking, and Firestore user isolation.
   - **Developer Setup & Testing Instructions**: Dev startup (`npm run dev`), build (`npm run build`), unit tests (`npm run test:unit`), Playwright E2E tests (`npx playwright test`).

---

## 🛡️ Final Security & Resilience Audit

**Status**: Scheduled in background (`task-4880`)  
**Scope**:
1. **Outbound PII Gate**: Validate that all user emails, phone numbers, and addresses are redacted prior to any external LLM/embedding egress.
2. **Webhook SSRF Protection**: Verify DNS resolution, HTTPS enforcement, private/internal IP blocking (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`, `169.254.169.254`), and redirect prevention.
3. **Gemini Fallback Ladder**: Verify resilience across `gemini-3.5-flash`, `gemini-3.6-flash`, `gemini-2.5-flash`, and `gemini-flash-latest` on rate limits (`429`) or errors.
4. **Secret Hygiene**: Confirm 0 API keys (`AIzaSy...`) exist in client bundles or public commits.
5. **Data Isolation**: Ensure all Firestore queries filter strictly on authenticated `userId`.

---

## 🚀 Post-Submission Stretch Goals (Deferred)

**Scheduled Time**: After official project submission  
**Command / Trigger**:
> *"Let's work on the post-submission stretch goals: dataset paragraph expansion and companion tone calibration."*

### Goals & Scope
1. **Dataset Paragraph Expansion**:
   - Refine shorter 1–2 sentence user turns in `src/services/demoSimulator.ts` into rich, authentic 1–2 paragraph stream-of-consciousness personal essays.
   - Reflect natural human vulnerability, dorm-room late-night doubts, and university life friction.
2. **Plainspoken Tone Calibration**:
   - Review internal system prompts in `src/services/gemini.ts` and `src/services/synthesis.ts`.
   - Strip out academic jargon, high-falutin phrasing, and wordy multi-clause sentences.
   - Calibrate the companion to speak with warm, grounded, and conversational humility.

---

## 🛠️ Verification Command Reference

```bash
# Run unit test suite (14 suites, 93 tests)
npm run test:unit

# Run type check validation
npm run lint

# Run Playwright E2E suite (23 tests)
npx playwright test

# Build production client & server bundles
npm run build
```
