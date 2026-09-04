# Changelog

All notable changes, architectural decisions, schema modifications, and design system updates for **Locus (ReflectAI)** are documented in this file, grouped by date.

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
- **Daily Running Changelog Directive**:
  - Added mandatory rule to [AGENTS.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/AGENTS.md) requiring daily maintenance of `CHANGELOG.md`.

### Changed
- **Engineering Implementation Plan Overhaul**:
  - Restructured [docs/Locus-Implementation-Plan.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/docs/Locus-Implementation-Plan.md) to enforce the cyclical 5-step lifecycle (`[TEST FIRST]` ➔ `[BUILD / GREEN]` ➔ `[RUN & VALIDATE]` ➔ `[FEEDBACK]` ➔ `[SIGN-OFF]`).
  - Integrated 3-Tier Contract-Driven & Mock-Boundary TDD architecture across execution phases (Tier 1 fast pure unit TDD, Tier 2 service mock-boundary TDD, Tier 3 Playwright route & UI TDD).
  - Expanded Phase 4 with formal requirements for **Manual Human Evaluation of all Internal Prompts** (evaluation rubric for tone, privacy, zero leaks, and schema adherence) and **Deep Security Audit** (systematic 5 Threat Zones review and `npm audit` verification).
  - Added Phase 0 triage detailing exact keep, rework, and rebuild decisions across all ported files.
  - Outlined Playwright automated verification harness for local headless testing and screenshot capture.
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

---

## [2026-09-01]

### Added
- Initialized Antigravity agent configuration and workspace structure:
  - Created root [AGENTS.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/AGENTS.md) establishing Locus Software Standards as the mandatory primary directive (applied in 90%+ prompts).
  - Scaffolded `.agents/rules/` with `software-standards.md` and `design-guidelines.md`.
  - Structured modular skills: `locus-software-standards`, `third-party-integration-standards`, `firestore-vector-search`, `feature-architecture-spec`, `code-quality-standards`.
  - Created documentation structure under `docs/` (`docs/standards/`, `docs/design/`, `docs/specs/`).
- Installed npm workspace dependencies (365 packages) and validated TypeScript setup.
