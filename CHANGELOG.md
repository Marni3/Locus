# Changelog

All notable changes, architectural decisions, schema modifications, and design system updates for **Locus (ReflectAI)** are documented in this file, grouped by date.

---

## [2026-09-05]

### Added
- **Phase 3: Screen Architecture & Impeccable Mobile-First Polish**:
  - **Screen 1: Reflections Home ([src/components/ReflectionsHome.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/ReflectionsHome.tsx))**:
    - Mobile-first 2-column masonry vertical card grid (`columns-2 md:columns-3 lg:columns-4 gap-3.5 space-y-3.5 break-inside-avoid`).
    - Google Keep-style note cards featuring Source Serif 4 titles, spatial context badges (`MapPin`), relative timestamps, 3–4 sentence conversation gist/summary, and qualitative tags (`#Breakthrough`, `#Friction`, `#Decision`, etc.).
    - Daily Reflection Prompt Banner rotating 7 contemplations, dismissible via `localStorage`, with one-tap entry into active reflection.
    - "Ready for Longitudinal Synthesis" horizontal ribbon surfacing themes with $\ge 2$ accumulated observations for immediate unpacking.
    - Real-time search and multi-tag filtering across titles, summaries, locations, and qualitative tags.
  - **Screen 2: Active Workspace Refinements ([src/components/SessionWorkspace.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SessionWorkspace.tsx))**:
    - Typography division strictly applied: User thoughts rendered in `Source Serif 4` on calm `#F2EFEB` bubbles; companion insights rendered in `Inter` sans-serif on clean `#FFFFFF` cards.
    - Floating inspiration contemplation chip when launched directly from the Daily Prompt banner.
    - Message egress resilience: captures failed network/endpoint turns, informs user with calm toast, and offers inline `[ 🔄 Resend ]` with zero buffer loss.
  - **Screen 3: Themes Split Master-Detail & Concept Graph ([src/components/ThemesView.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/ThemesView.tsx))**:
    - Segmented view toggle between `[ Timeline ]` and `[ Concept Graph ]`.
    - **Mode A (Timeline Master-Detail)**: 35% left rail of active themes + 65% right reading canvas with current rolling synthesis and chronological observation feed featuring entry backlinks and spatial markers.
    - **Mode B (Concept Graph)**: Scalable SVG radial force visualization with center "YOU" core hub, orbital link vectors, and theme satellite nodes sized dynamically by observation count.
    - Integrated Phase 2 "Unpack Further" engine (`/api/themes/:id/unpack`) directly in both views with full modal dossier and exploration paths.
  - **Screen 4: Settings Drawer Polish ([src/components/SettingsDrawer.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SettingsDrawer.tsx))**:
    - Added 30-Day simulation dataset management (load/clear demo records on demand).
    - Outbound Privacy notice and live SSRF Webhook validator with defensive internal IP blocking.
  - **Zero-Barrier Evaluator Demo Sandbox ([src/services/demoSimulator.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/demoSimulator.ts))**:
    - 6 authentically staged chronological reflections across 30 days, 3 persistent themes, and 8 discrete observations with spatial context.
    - Interactive `[ 🚀 Explore Demo Space ]` buttons in hero and navbar on [LandingPage.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/LandingPage.tsx).
  - **End-to-End Automated Verification Suite ([tests/e2e/screens.spec.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/tests/e2e/screens.spec.ts))**:
    - 4 comprehensive Playwright tests asserting full flows across mobile (393px) and desktop (1280px) viewports.
    - Automated screenshot capture of all 4 screens (`screen1_reflections_home_desktop.png`, `screen1_reflections_home_mobile.png`, `screen2_session_workspace.png`, `screen3_themes_timeline.png`, `screen3_themes_concept_graph.png`, `screen4_settings_drawer.png`).

### Changed
- **Unified Full-Stack App Routing ([src/App.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/App.tsx))**:
  - Replaced legacy sidebar navigation with responsive segmented top bar (`Reflections` vs `Themes`).
  - Added seamless demo mode state management and conclusion-to-theme transitions.
  - Enhanced conclude error handling with client-side synthesis fallback for offline/demo robustness.
- **Universal Header ([src/components/Navbar.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/Navbar.tsx))**:
  - Updated with Locus branding, `#3B7A57` `+ New Reflection` CTA, and clean user profile popover.
- **Design Tokens & Fonts ([index.html](file:///c:/Users/reyna/OneDrive/Documents/Locus/index.html), [src/index.css](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/index.css))**:
  - Registered `Source Serif 4` and `Inter` via Google Fonts and Tailwind `@theme` CSS tokens.

---

## [2026-09-04]

### Added
- **Impeccable Design System Authority**:
  - Initialized [PRODUCT.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/PRODUCT.md) adhering to `impeccable:product-schema 1`, locking in primary user persona (reflective knowledge workers, founders, thoughtful journalers), the 2-hour auto-conclude lifecycle, and longitudinal thought trajectory thesis.
  - Authored [DESIGN.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/DESIGN.md) following the official tokenized spec (`#3B7A57` Rule of One Accent, `#FAF9F6` canvas, Source Serif 4 user prose vs. Inter UI, and complete anti-leakage rules).
  - Formalized active screen wireframe specifications for Reflections Home (dismissible ready hero banner + collapsible ribbon + cards grid), Active Session (Source Serif 4 prose, message-level inline hover toolbar for Pin/Notes, collapsed mood/stance trigger), Themes View (Split Master-Detail + Concept Graph), and Settings.
  - Configured [.impeccable/config.json](file:///c:/Users/reyna/OneDrive/Documents/Locus/.impeccable/config.json) with `code-first` workflow.
- **Dedicated Integration Skills in `.agents/skills/`**:
  - Created [.agents/skills/pii-sanitizer-implementation/SKILL.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/pii-sanitizer-implementation/SKILL.md) for outbound-only regex scrubbing.
  - Created [.agents/skills/notification-dispatcher-integration/SKILL.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/notification-dispatcher-integration/SKILL.md) for SSRF-hardened webhook dispatch and transactional email.
  - Created [.agents/skills/geocoding-integration/SKILL.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/geocoding-integration/SKILL.md) for dual-mode location context and coordinate minimization.
- **Dual-Mode Location Context**:
  - Added `EntryLocation` schema supporting GPS auto-detection and manual place typing, feeding spatial context into Gemini Theme synthesis.
- **Evaluator Demo Sandbox & Authentic 30-Day Simulation**:
  - Specified zero-barrier self-service demo mode accessible directly in the guided walkthrough or Settings, sandboxed strictly to the evaluator's own private user document in Firestore.
  - Designed Phase 4 authentic simulation running 6 chronological multi-turn reflections across 30 days live through the genuine Gemini synthesis pipeline.
- **Running Blog & Article Talking Points Archive**:
  - Authored [BLOG_TALKING_POINTS.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/BLOG_TALKING_POINTS.md) at the repository root collecting core product philosophy, intentional vibecoding with OOUX (ORCA framework), technical architecture deep-dives, developer battle scars (API key caching, model deprecations, token economics), and article pitch hooks.
  - Added running requirement to [AGENTS.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/AGENTS.md) directing agents to maintain this document continuously across future sessions.
- **Daily Running Changelog Directive**:
  - Added mandatory rule to [AGENTS.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/AGENTS.md) requiring daily maintenance of `CHANGELOG.md`.

### Changed
- **Engineering Implementation Plan Overhaul**:
  - Restructured [docs/Locus-Implementation-Plan.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/docs/Locus-Implementation-Plan.md) to enforce the cyclical 5-step lifecycle (`[TEST FIRST]` ➔ `[BUILD / GREEN]` ➔ `[RUN & VALIDATE]` ➔ `[FEEDBACK]` ➔ `[SIGN-OFF]`).
  - Integrated 3-Tier Contract-Driven & Mock-Boundary TDD architecture across execution phases (Tier 1 fast pure unit TDD, Tier 2 service mock-boundary TDD, Tier 3 Playwright route & UI TDD).
  - Expanded Phase 4 with formal requirements for **Manual Human Evaluation of all Internal Prompts** (evaluation rubric for tone, privacy, zero leaks, and schema adherence) and **Deep Security Audit** (systematic 5 Threat Zones review and `npm audit` verification).
  - Added Phase 0 triage detailing exact keep, rework, and rebuild decisions across all ported files.
  - Outlined Playwright automated verification harness for local headless testing and screenshot capture.
- **Gemini Fallback Ladder & Error Sanitization**:
  - Prioritized active verified model `gemini-2.5-flash` at index 0 in [src/services/gemini.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/gemini.ts).
  - Replaced retired `gemini-2.5-flash-lite` with `gemini-3.5-flash-lite`.
  - Added dynamic API key re-initialization in `getAIClient()` to pick up `.env` changes.
  - Sanitized fallback ladder error outputs to prevent technical plumbing/vendor leaks into user-facing UI toasts.
- **Rule & Reference Updates**:
  - Updated [.agents/rules/design-guidelines.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/rules/design-guidelines.md) to anchor on `DESIGN.md` as the normative authority.
  - Updated [AGENTS.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/AGENTS.md) with Impeccable registration and the Core Object Model (`Entry`, `Message`, `Theme`, `ThemeObservation`).

### Removed
- Pruned redundant and misaligned generic skills: `code-quality`, `ui-design`, `feature-planning`, `schema-change`, `security`, `api-design`, `architecture-design`, `component-boundaries`, `debugging`, `documentation`, `performance`, and loose staging files (`SKILL (5).md`, `SKILL (6).md`, `SKILL (7).md`).
- Retired `.agents/skills/locus-design-guidelines/` in favor of `DESIGN.md`.

- **Phase 0 Execution — Core Architecture Alignment & Automated Verification**:
  - Installed and configured `@playwright/test` with headless Chromium in `playwright.config.ts`.
  - Added `npm run test:e2e` script to `package.json` and authored `tests/e2e/smoke.spec.ts`.
  - Re-architected [src/types.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/types.ts) to establish the Core Object Model (`Entry`, `Message`, `Theme`, `ThemeObservation`, `EntryLocation`).
  - Extracted [src/services/gemini.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/gemini.ts) isolating the Gemini client and resilient model fallback ladder (`generateContentWithFallback`).
  - Updated [src/lib/firebase.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/lib/firebase.ts) with Core Object Model collections and enhanced recursive `stripUndefined` payload hygiene.
  - Hardened [firestore.rules](file:///c:/Users/reyna/OneDrive/Documents/Locus/firestore.rules) to enforce owner-bound isolation across all user collections (`/users/{userId}/{document=**}`).
  - Refactored `src/App.tsx` and `src/components/SessionWorkspace.tsx` to align with the new `Entry` and `Message` contracts.
  - Sanitized user-facing UI copy across `src/components/LandingPage.tsx`, `src/components/SessionWorkspace.tsx`, and `src/components/IntelligenceDrawer.tsx` to eliminate vendor/backend plumbing leaks ("Gemini", "Firestore") in compliance with [DESIGN.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/DESIGN.md) and [AGENTS.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/AGENTS.md).
  - Enhanced Playwright smoke suite (`tests/e2e/smoke.spec.ts`) with element-level visibility assertions and automated visual screenshot capture.
  - Implemented progressive dual-collection fallback in `src/lib/firebase.ts` allowing seamless operation against pre-existing remote Firestore rules (`/interactions`) until new `/entries` rules are deployed.

### Verified
- `npm run test:e2e` (Playwright automated smoke test & full-page screenshot): Passed cleanly in 8.3s.
- `npm run lint` (`tsc --noEmit`): Passed with 0 errors.
- `npm run build`: Production bundle (`dist/client` + `dist/server.cjs`) built cleanly in 9.59s.
- `node .agents/skills/impeccable/scripts/doctor.mjs`: Zero configuration drift reported.
- `node .agents/skills/impeccable/scripts/context.mjs`: Resolved `PRODUCT.md` and `DESIGN.md` cleanly.

- **Phase 1 Execution — Core Loop & Synchronous Synthesis Pipeline (TDD)**:
  - **Tier 1 Pure Unit Tests (Vitest)**:
    - [tests/unit/auto-conclude.test.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/tests/unit/auto-conclude.test.ts): 7 tests verifying 2-hour inactivity lifecycle, boundary conditions, and human-readable remaining time formatting.
    - [tests/unit/synthesis-prompt.test.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/tests/unit/synthesis-prompt.test.ts): 4 tests verifying OWASP prompt injection security delimiters, markdown code fence stripping, and corrupt response recovery.
  - **Tier 2 Service Mock-Boundary Tests (Vitest)**:
    - [tests/unit/synthesis-service.test.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/tests/unit/synthesis-service.test.ts): 3 tests verifying Theme observation delta linking, new theme creation, and embedding error fail-open resilience without external API token consumption.
    - Configured `vitest` test runner (`npm run test:unit`) passing all 14 unit tests in 1.11s.
  - **Tier 3 Playwright Route Tests**:
    - [tests/e2e/core-loop.spec.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/tests/e2e/core-loop.spec.ts): 2 route tests validating `POST /api/entries/:id/conclude` and `PATCH /api/entries/:id/messages/:messageId`.
  - **Core Services & Server Endpoints**:
    - Created [src/services/concludeEngine.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/concludeEngine.ts) (`isEntryEligibleForAutoConclude`, `getRemainingActiveMs`, `formatRemainingTime`).
    - Created [src/services/synthesis.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/synthesis.ts) implementing the full synchronous synthesis pipeline (summary generation, embedding vector search candidate matching, theme resolution, and Firestore batch persistence) with 429 quota/network fail-open handling.
    - Extended [server.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/server.ts) mounting `POST /api/entries/:id/conclude` and `PATCH /api/entries/:id/messages/:messageId`.
  - **Frontend UI & Design System Alignment**:
    - Updated [src/components/SessionWorkspace.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SessionWorkspace.tsx) with auto-conclude countdown timer badge, `#3B7A57` accent-sage manual `[Conclude Entry]` button, turn pin toggle, inline reflection notes with editor/viewer, concluded entry read-only state banner with "Start New Reflection", and typography division (Source Serif 4 for authentic user thoughts, Inter for AI companion).
    - Updated [src/App.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/App.tsx) wiring `handleConcludeEntry` and 30-second interval checking `isEntryEligibleForAutoConclude()`.
  - **Full Suite Verification**:
    - `npm run lint`: 0 TypeScript errors.
    - `npm run test:unit`: 14/14 tests passed in 1.11s.
    - `npx playwright test tests/e2e/core-loop.spec.ts`: 2 passed in 8.8s.
    - `npx playwright test tests/e2e/smoke.spec.ts`: 1 passed in 10.2s.
    - `npm run build`: Production client bundle and server bundle built cleanly.

- **Phase 2 Execution — Integration Layer & Privacy Hardening (TDD)**:
  - **Outbound PII Sanitizer (`src/integrations/sanitizer/`)**:
    - Built outbound regex sanitization engine redacting phone numbers (international, formatted, standard), emails, and physical street addresses (`[PHONE REDACTED]`, `[EMAIL REDACTED]`, `[ADDRESS REDACTED]`).
    - Enforced architectural boundary: sanitization is outbound-only at egress points (Gemini prompts, embeddings, webhooks). Raw reflections in Firestore remain unredacted for user view.
    - Wired `sanitizeForOutbound` into `generateEntrySummary`, `generateSummaryEmbedding`, `buildSynthesisPrompt`, and `buildUnpackPrompt`.
    - Unit tested in `tests/unit/sanitizer.test.ts` (17 tests) and `tests/unit/egress-pii-gate.test.ts` (2 tests) verifying near-PII preservation, idempotency, and in-memory raw integrity.
  - **Unpack Further Engine (`src/integrations/unpack/`)**:
    - Built longitudinal unpack engine requiring $\ge 2$ Theme observations.
    - Formulates working essay title, 1-sentence evolutionary thesis, contextual narrative paragraph explaining thinking shifts across time, and 2-3 divergent exploration paths with creative writing prompts (per user design refinement).
    - Hardened with resilient heuristic fallback matching Locus Zero-Crash hygiene if live API quota is exhausted (429).
    - Unit tested in `tests/unit/unpack-prompt.test.ts` (4 tests) and `tests/unit/unpack-service.test.ts` (2 tests).
  - **Notification Dispatcher & Dual-Pass SSRF Validator (`src/integrations/notifications/`)**:
    - Implemented dual-pass SSRF validation (save-time and send-time) blocking private CIDRs (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.169.254` cloud metadata, IPv6 loopbacks) and DNS rebinding attacks.
    - Configured morning digest compiler, rate limiting (max 5 dispatches/hour), non-blocking 3s timeout with 1 retry, and development console email mock dispatch.
    - Unit tested in `tests/unit/ssrf-validator.test.ts` (9 tests) and `tests/unit/notification-dispatcher.test.ts` (4 tests).
  - **Unified Location Context (`src/integrations/geocoding/`)**:
    - Implemented text-only geocoding with zero map tile or SDK rendering.
    - Reverse geocoding resolves GPS coordinates to place names with coordinate minimization (lat/long discarded unless opt-in).
    - Forward geocoding resolves text queries (`"The Mill Coffee SF"`) to standardized places, with graceful fallback to custom place tags on `ZERO_RESULTS`.
    - Unit tested in `tests/unit/geocoding.test.ts` (5 tests).
  - **Server Endpoints Mounted (`server.ts`)**:
    - `POST /api/themes/:id/unpack`
    - `POST /api/location/resolve-gps`
    - `POST /api/location/resolve-query`
    - `POST /api/notifications/test-webhook`
  - **Frontend UI & Integration Wiring**:
    - [src/components/SessionWorkspace.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SessionWorkspace.tsx): Added Location Context Pill & Popover (`[ 📍 Balanga, Bataan ▾ ]` or `[ 📍 Add Location ▾ ]`) with live GPS auto-resolve, text search query input, and quick place removal.
    - [src/components/SettingsDrawer.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SettingsDrawer.tsx): Added "Integrations & Alerts" tab exposing Webhook URL input with live SSRF test button and status badge, Morning Digest email toggle, and Outbound Privacy notice.
  - **Tier 3 E2E Integration Suite (`tests/e2e/integrations.spec.ts`)**:
    - 12 comprehensive Playwright E2E tests validating unpack engine constraints, location query & GPS coordinate minimization, and webhook SSRF blocking.
  - **Resend Synthesis Notification Dispatch**:
    - Built `dispatchSynthesisNotificationEmail` in `src/integrations/notifications/email.ts` sending formatted executive synthesis summaries and Theme links upon entry conclusion.
    - Added support for `RESEND_API_KEY` and configurable `RESEND_FROM_EMAIL` (defaulting to `Locus <onboarding@resend.dev>` for zero-friction sandbox testing).
    - Wired entry conclude handler in `server.ts` and `src/App.tsx` to automatically trigger non-blocking Resend dispatch when user email and notifications are enabled.
    - Documented environment variables in `.env.example`.
  - **Implementation Plan Refinements**:
    - Added Daily Journaling Prompt Banner and calm qualitative multi-tagging (`entry.tags: string[]`) to Phase 3 in `docs/Locus-Implementation-Plan.md`.
    - Added Email Notification System Expansion (weekly digest aggregation, configurable day/time cadence) to Phase 4.
  - **Full Automated Verification**:
    - `npm run lint`: Passed with 0 errors.
    - `npm run test:unit`: 58/58 tests passing in 1.64s across 10 test files.
    - `npx playwright test`: 15/15 tests passing in 18.1s across 3 test suites.
    - `npm run build`: Production bundle (`dist/client` + `dist/server.cjs`) built cleanly in 8.78s.

---

## [2026-09-01]

### Added
- Initialized Antigravity agent configuration and workspace structure:
  - Created root [AGENTS.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/AGENTS.md) establishing Locus Software Standards as the mandatory primary directive (applied in 90%+ prompts).
  - Scaffolded `.agents/rules/` with `software-standards.md` and `design-guidelines.md`.
  - Structured modular skills: `locus-software-standards`, `third-party-integration-standards`, `firestore-vector-search`, `feature-architecture-spec`, `code-quality-standards`.
  - Created documentation structure under `docs/` (`docs/standards/`, `docs/design/`, `docs/specs/`).
- Installed npm workspace dependencies (365 packages) and validated TypeScript setup.
