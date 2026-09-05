# Locus Strata — Development Review Report

**Date**: September 5, 2026  
**Status**: Implementation Complete & Verified  
**Architecture Model**: Option B (Hybrid Model — Conversational Sanctuary + Archival Strata)  
**Standard Compliance**: 100% compliant with [Locus Software Standards](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/rules/software-standards.md) & [DESIGN.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/DESIGN.md)

---

## 1. Executive Summary

Following an in-depth architectural and product critique (`STRATA-refactor-prompt.md`), Locus has evolved into **Locus Strata**: an intimate personal reflection platform that harmonizes:
1. **The Blank-Page Solution**: An active conversational reflection companion across 4 cognitive stances (`reflect`, `brainstorm`, `actionable`, `mindful`) that mirrors and deepens thoughts rather than judging or providing unsolicited advice.
2. **The Forgotten-Notebook Solution**: Concluded reflections are permanently frozen into immutable historical records (`bodySealedAt`), allowing users to revisit past thoughts by writing in the **margins** (`Stratum` marginalia layer) stamped with **temporal distance** (`written 94 days later`) and semantic ink stances (`correction`, `confirmation`, `question`, `grief`, `gratitude`).
3. **The Daily Archivist Loop (The Return)**: A dedicated daily surface presenting exactly **one past reflection**, chosen via explainable retrieval algorithms (`anniversary`, `unresolved`, `contradiction`, `dormant`) with zero AI commentary and an open invitation: *"Write in the margin."*
4. **Archival Dignity & Keep-Style Cards**: Preserves the tactile Google Keep masonry cards loved by the user on Reflections Home, enhanced with archival typography, stratum count badges (`3 strata · +94d`), and bookmark ribbons.
5. **Zero-Fake-AI Policy**: Absolute elimination of simulated AI summaries or dummy themes on failure, replaced by honest status indicators and retry affordances.

---

## 2. Core Schema & Data Architecture

All domain models in `src/types.ts` have been extended to enforce immutability and marginalia tracking:

```typescript
// 1. Immutable Entry Model
export interface Entry {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  concludedAt?: string;
  bodySealedAt?: string;          // Proof of post-conclusion immutability
  bodyHash?: string;              // Cryptographic turn compilation hash
  status: 'active' | 'concluded';
  category: string;
  mood?: string;
  stance?: string;
  summary?: string;
  locationContext?: EntryLocation | null;
  tags?: string[];
  turns: Message[];
  stratumCount: number;           // Count of marginalia notes
  lastReturnedAt?: string | null; // The Return cadence tracking
  returnCount: number;
  openThreads?: string[];         // Open questions flagged during writing
  starred?: boolean;
}

// 2. Bookmarked Passage Turn
export interface Message {
  id: string;
  entryId: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  isBookmarked?: boolean;         // Replaces former 'isPinned'
  isPinned?: boolean;             // Backward compatibility alias
  note?: string;                  // User reflection note on bookmarked turn
}

// 3. Strata Margin Note
export interface Stratum {
  id: string;
  entryId: string;
  userId: string;
  parentStratumId?: string | null;// Depth 2-3 support
  anchor?: StratumAnchor | null;  // Quoted text selection in reading column
  bodyMarkdown: string;           // Immutable user margin prose
  depth: 1 | 2 | 3;
  daysLater: number;              // Exact elapsed days since conclusion
  stance: 'correction' | 'confirmation' | 'question' | 'grief' | 'gratitude';
  createdAt: string;
  sealedAt: string;
}

// 4. The Return Candidate
export interface ReturnCandidate {
  entry: Entry;
  strata: Stratum[];
  reason: 'anniversary' | 'unresolved' | 'contradiction' | 'dormant';
  evidence: string;               // Explainable provenance e.g. "written 1 year ago today · 2 strata"
  contradictingEntry?: {
    id: string;
    title: string;
    date: string;
    excerpt: string;
  };
}
```

---

## 3. Screen & Component Implementations

| Component / Module | Responsibility | Key Highlights |
|---|---|---|
| [ReflectionsHome.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/ReflectionsHome.tsx) | Primary reflective dashboard | Tactile Google Keep masonry grid, stratum count badges (`3 strata · +94d`), bookmark indicator ribbons, Bookmarked filter tab, and "The Return" banner. |
| [SessionWorkspace.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SessionWorkspace.tsx) | Active conversational companion | Real-time reflective dialogue, 4 cognitive stances, turn Bookmarking (with analytical notes), persistent IndexedDB draft sync, and `[ Conclude & Seal Page ]` action. |
| [EntryReaderWithStrata.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/EntryReaderWithStrata.tsx) | Concluded entry sealed reader | Desktop 2-column archival layout ($34\text{rem}$ reading column + $18\text{rem}$ recessed margin gutter), text selection highlighting, stratum composer with 5 semantic ink stances, and `Courier Prime` temporal distance stamps. |
| [TheReturnView.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/TheReturnView.tsx) | Daily archivist loop | Full-bleed single past entry reader in $20\text{px}$ `Literata`, explainable provenance header, contradiction callout banner, and `[ Write in the margin ]` direct transition. |
| [BookmarksDrawer.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/BookmarksDrawer.tsx) | Saved realizations reader | Dual view modes (Chronological feed vs Grouped by Reflection), full-text search, copy quote action, and jump-to-entry link. |
| [WalkthroughOverlay.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/WalkthroughOverlay.tsx) | 7-Stage interactive tour | User-perspective reflective story guiding users through Canvas $\rightarrow$ Companion $\rightarrow$ Bookmarks $\rightarrow$ Page Sealing $\rightarrow$ Strata Margins $\rightarrow$ The Return $\rightarrow$ Longitudinal Themes. |
| [SettingsDrawer.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SettingsDrawer.tsx) | Preferences & Appearance | Archival typography picker (`Literata`, `Inter`, `Roboto`, `Overpass Mono`), substrate accent ink selection (`Sage`, `Moss`, `Iron-Gall`, `Warm Ochre`, `Terracotta`), and WCAG 2.1 AA motion toggle (`reducedMotion`). |
| [strataService.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/strataService.ts) | Strata storage & math | `calculateDaysLater`, `formatTemporalDistance`, Firestore CRUD under `users/{uid}/entries/{entryId}/strata`, and stance semantic color mapping. |
| [returnRouter.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/returnRouter.ts) | Explainable routing algorithms | Heuristics for `anniversary` (365d $\pm$ 5d), `unresolved` (open threads), `contradiction` (opposing mood pairs), and `dormant` (oldest unread). |
| [offlineSync.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/lib/offlineSync.ts) | Resilient client storage | IndexedDB draft autosave with `beforeunload` unsaved data warning guard. |

---

## 4. Archival Design & Typographic System

- **Substrate & Ink Palette**:
  - Main Substrate: `#FAF9F6` (`--paper`)
  - Recessed Margins / Header: `#F4F3EE` (`--paper-deep`)
  - Primary Action Accent: `#3B7A57` (`--accent-sage`) with `#DCEEE3` soft tint.
  - Body Ink: `#191813` (`--ink`) with `#5A5648` secondary metadata.
  - Hairline Dividers: `#E6E3DC` (`--border-hairline`).
- **Typographic Hierarchy**:
  - **User Reflections & Body**: `Literata` / Source Serif 4 (`16px`, $1.72$ line height).
  - **Marginalia & Temporal Distance**: `Courier Prime` small-caps tracking (`written 94 days later`).
  - **UI Chrome & Navigation**: `Archivo` / Inter (`12px-14px`).
  - **Focus & Sensory Accessibility**: High-distinction focus-visible rings in `--irongall` (`#2C3E50`) and full `@media (prefers-reduced-motion: reduce)` & `.reduce-motion` overrides.

---

## 5. Security, Resilience & Zero-Fake-AI Policy

1. **Threat Zone 1 (Input Surfaces)**: Strict PII sanitization regex gate scrubs phone numbers, emails, and street addresses prior to any egress to the Gemini API or webhook endpoints.
2. **Threat Zone 2 (Planning & Reasoning)**: System instructions and prompts strictly enclosed in delimiter tags (`<<<ENTRY_SUMMARY>>>`, `<<<PINNED_MESSAGES>>>`) to prevent prompt injection.
3. **Threat Zone 3 (Tool & API Execution)**: SSRF validation prevents webhooks from hitting internal RFC 1918 addresses, AWS metadata (`169.254.169.254`), or loopback IP ranges.
4. **Threat Zone 4 (Memory & State)**: All Firestore mutations pass through `stripUndefined` to guarantee zero-crash write hygiene.
5. **Zero Fake-AI Policy**: On service or quota exhaustion (`429`, `503`), the application surfaces honest, actionable error states (`synthesis unavailable · retry`) instead of fabricating synthetic pseudo-insight strings.

---

## 6. Verification & Test Metrics

### Unit Tests (Vitest)
- Total Suites: **14 passed (14)**
- Total Tests: **93 passed (93)**
- Strata Delta Suite: 17 passed (temporal day calculation, boundary handling, distance formatting, multi-depth demo strata).
- Return Router Suite: 6 passed (`anniversary`, `unresolved`, `contradiction`, and `dormant` heuristics).
- No Fake-AI Suite: 2 passed (honest error escalation without dummy templates).
- Core Services: PII sanitizer (17), SSRF validator (9), Auto-conclude (7), Geocoding (5), Unpack prompt (4), Synthesis service (3).

### End-to-End Tests (Playwright)
- `tests/e2e/strata-margins.spec.ts`: Validates concluded entry routing to sealed reader, temporal stamps, margin note composition, and bookmarks drawer.
- `tests/e2e/the-return.spec.ts`: Validates daily return banner, machine provenance line, and direct transition into margin writer.
- `tests/e2e/walkthrough-tour.spec.ts`: Validates 7-step guided reflective user story navigation.
- `tests/e2e/smoke.spec.ts` & `tests/e2e/screens.spec.ts`: Validates responsive multi-view desktop/mobile rendering and health checks.

### Static Analysis
- `npm run lint` (`tsc --noEmit`): **0 errors**.

---

## 7. Phase 4 Implementation & Comprehensive Review

### Delivered Architectural Capabilities
1. **Interactive Guided Walkthrough Controller**:
   - Upgraded [WalkthroughOverlay.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/WalkthroughOverlay.tsx) from a static popup to an interactive companion with dual display modes: full archival focus modal and compact floating pill (`#walkthrough-minimized-pill`) in the screen corner.
   - Added tranquil, dismissible Welcome Banner on [ReflectionsHome.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/ReflectionsHome.tsx) (`#first-run-tour-banner`) allowing new evaluators to trigger the 2-minute tour on demand or dismiss.
   - Fully scripted user story walkthrough covering: Reflections Canvas ➔ Starting a Reflection (`"I'm feeling good today"`) ➔ Bookmarking Epiphanies ➔ Finite Journal Sealing ➔ Strata Margins ➔ The Return ➔ Longitudinal Themes Constellation & Unpack Further.
2. **Authentic 30-Day Simulation Dataset Realism**:
   - Tagged key turns across [demoSimulator.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/demoSimulator.ts) with `isBookmarked: true` and reflective notes so the Bookmarks Drawer opens with rich archival quotes immediately in demo mode.
   - Auto-seeded multi-layer demo strata in [strataService.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/strataService.ts) (`demo-entry-1` +94d correction and +120d confirmation; `demo-entry-2` +23d gratitude) demonstrating temporal distance and semantic ink without manual user typing.
   - Marked explicit `openThreads` on `demo-entry-1` to immediately demonstrate The Return's explainable `unresolved` heuristic.
3. **Reflective Email Notification Scheduling in Settings**:
   - Replaced binary toggle in [SettingsDrawer.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SettingsDrawer.tsx) with a comprehensive delivery cadence picker (`Immediate on Conclusion`, `Weekly Reflection Briefing`, `Muted / Off`).
   - Added scheduling controls for delivery day (`Sunday`, `Monday`, `Friday`) and preferred time (`7:00 AM`, `8:00 AM`, `7:00 PM`, `8:00 PM`).

### Phase 4 Test & Quality Gate Summary
- **Playwright E2E Suite**: **23/23 tests passing (100%)** across 8 spec files, including the newly authored [interactive-walkthrough.spec.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/tests/e2e/interactive-walkthrough.spec.ts).
- **Vitest Unit Suite**: **93/93 tests passing (100%)** across 14 test suites.
- **TypeScript Compiler**: `tsc --noEmit` exited with **0 errors**.
- **Production Bundling**: `vite build && esbuild server.ts` bundled `dist/server.cjs` and client assets cleanly in 16 seconds.
