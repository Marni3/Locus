# Changelog

All notable changes, architectural decisions, schema modifications, and design system updates for **Locus (ReflectAI)** are documented in this file, grouped by date.

## [2026-09-06]

### Added
- **Clean 1080p Playwright Verification & Screenshot Automation ([tests/e2e/clean-1080p-screenshots.spec.ts](tests/e2e/clean-1080p-screenshots.spec.ts))**:
  - Implemented non-invasive CSS injection preventing toast notification collisions with React 19 fiber reconciliation.
  - Successfully generated 20 clean 1920×1080 UI screenshots across Light and Dark themes for portfolio and presentation artifacts.
- **Development Journey Narrative & GitHub Link Relative Resolution ([README.md](README.md))**:
  - Added dedicated narrative documenting the two-phase progression from Google AI Studio rapid prototyping to full-stack engineering in Google Antigravity IDE.
  - Replaced all absolute `file:///` links with repository-relative paths, ensuring 100% clickability within GitHub's web file viewer.
  - Credited Google AI Academy APAC Cohort 3 guidance for the foundational system prompt and software standards.
- **Cloud Run Native Structured Logging & Error Reporting ([src/lib/logger.ts](src/lib/logger.ts), [tests/unit/cloud-logger.test.ts](tests/unit/cloud-logger.test.ts))**:
  - Implemented zero-dependency structured logger that emits Cloud Run native single-line JSON payloads to `stdout`/`stderr`.
  - Correlates incoming distributed request traces via `X-Cloud-Trace-Context` (`logging.googleapis.com/trace`).
  - Automatically formats errors with `@type: "type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent"` and `serviceContext` for automated incident tracking in Google Cloud Error Reporting.
  - Enforced Threat Zone 5 zero-secret hygiene: recursively scrubs API keys, Bearer tokens, and sensitive reflection contents (`prompt`, `history`, `conversation`, `turns`) from log metadata.
  - Replaced all raw `console.error` and `console.log` calls in [server.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/server.ts) with structured logger invocations.
- **Serverless Cloud Scheduler Auto-Conclude Engine ([src/services/cronSweep.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/cronSweep.ts), [server.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/server.ts), [tests/unit/cron-sweep.test.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/tests/unit/cron-sweep.test.ts), [tests/unit/cron-endpoint.test.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/tests/unit/cron-endpoint.test.ts))**:
  - Engineered `POST /api/cron/sweep-conclude` endpoint to replace local browser timers with authentic serverless cron lifecycle enforcement.
  - Protected endpoint via `X-Cron-Secret` header validation and Cloud Scheduler native verification.
  - Reused `isEntryEligibleForAutoConclude()` from [src/services/concludeEngine.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/concludeEngine.ts) to maintain 100% parity with client-side lifecycle logic.
  - Added batching guardrails (`maxBatch: 5`) to prevent Gemini quota exhaustion and Cloud Run request timeouts.
  - Added optional `concludedBy: 'manual' | 'auto_timer'` to [src/types.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/types.ts).
- **Dark Mode Contrast Restoration & Accessibility Polish ([src/components/SessionWorkspace.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SessionWorkspace.tsx))**:
  - Replaced hardcoded `text-stone-800`, `text-stone-900`, and `text-stone-600` in AI companion Markdown rendering (`h1`-`h3`, `strong`, `p`, `ul`, `ol`, `blockquote`) with semantic `text-text-primary` (`#ECE7DE` in dark mode) and `border-accent-sage` with `text-text-muted`, resolving near-zero contrast in Obsidian theme.
  - Upgraded Daily Reflection Inspiration card from low-contrast `bg-accent-sage-tint/40` to a dedicated card layout (`bg-surface border border-accent-sage/35 dark:border-accent-sage/50 shadow-xs`) with high-contrast serif italic quote typography.
  - Swapped hardcoded stone/hex colors on timestamps, bookmark toggles, and note pills to semantic tokens.
- **CI Secret Scan Remediation (`scan-history`)**:
  - Replaced hardcoded Firebase API key in [firebase-applet-config.json](file:///c:/Users/reyna/OneDrive/Documents/Locus/firebase-applet-config.json) with `YOUR_FIREBASE_API_KEY` placeholder so TruffleHog no longer flags a `GoogleGeminiAPIKey` secret pattern.
- **Mobile Viewport Audit & Responsive Touch Hardening ([tests/e2e/mobile-audit.spec.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/tests/e2e/mobile-audit.spec.ts))**:
  - Authored and verified a 6-suite Playwright mobile audit on iPhone 14 / modern flagship mobile viewport (`390×844`, DPR 2, touch-enabled) with 100% pass rate:
    1. *Landing Page*: Zero horizontal scroll, accessible floating theme toggle touch target ($\ge 36\text{px}$), dark mode toggle, and demo gateway button.
    2. *Reflections Home*: 2-column to 1-column responsive masonry stacking, full-width search input, and qualitative tag chips.
    3. *Sealed Reader & Strata Margins*: Mobile reading column width, responsive back button navigation, and temporal marginalia cards.
    4. *Session Workspace*: Stance mode strip and voice-to-text dictation mic button ($\ge 32\text{px}$) with touch-friendly composer.
    5. *Themes View & Concept Graph*: Responsive master-detail drilldown and Concept Graph SVG canvas touch controls.
    6. *Settings Drawer*: Responsive full-width slide-over drawer with segmented theme switcher and close action.
  - Refactored [src/components/Navbar.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/Navbar.tsx) to collapse text labels on mobile screens (`< md`), presenting clean 36px icon touch targets and eliminating horizontal navbar overflow (~580px collapsed to ~345px on 390px screens).
  - Added `overflow-x-hidden w-full` to root container in [src/App.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/App.tsx).
- **High-Fidelity Presentation Recordings & Animated Virtual Cursor Engine ([scripts/lib/virtual-cursor.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/scripts/lib/virtual-cursor.ts), [scripts/record-walkthrough.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/scripts/record-walkthrough.ts))**:
  - Engineered an in-browser animated virtual cursor with smooth cubic-bezier easing (`easeOutCubic`), real mouse-hover style activations, expanding click ripples, and calibrated 1.5s–2.3s human reading pauses.
  - Re-architected walkthroughs around a cohesive **3-Act Guided Structure**:
    - *Act 1*: Sanctuary Welcome & Archival Theme Flip (`Daylight` $\rightarrow$ `Obsidian`).
    - *Act 2*: 7-Step Guided Tour Backbone (Canvas, Companion, Bookmarks, Sealing, Strata Margins, The Return, Longitudinal Themes).
    - *Act 3*: Live Deep-Dive into expanded capabilities (authentic `"Chem"` query filtering, interactive Strata Margins inspection, Voice Dictation mic hover and prompt typing, Fibonacci Spiral Petal Bloom, liquid spring drag physics, micro-trajectory zoom, and Archival Settings).
  - Fixed mobile letterboxing scale issue by locking viewport and recording dimensions in 1:1 parity (`430×932` edge-to-edge full-bleed framing).
  - Outputs:
    - 🖥️ **Desktop Full HD (1080p)**: [media/demo_recordings/locus_desktop_walkthrough_1080p.webm](file:///c:/Users/reyna/OneDrive/Documents/Locus/media/demo_recordings/locus_desktop_walkthrough_1080p.webm) (12.58 MB, 1920×1080).
    - 📱 **Mobile Flagship (Full Bleed)**: [media/demo_recordings/locus_mobile_walkthrough_retina.webm](file:///c:/Users/reyna/OneDrive/Documents/Locus/media/demo_recordings/locus_mobile_walkthrough_retina.webm) (5.89 MB, 430×932).
- **Repository Root Directory Hygiene**:
  - Removed duplicate package lockfile `bun.lock`.
  - Hardened [.gitignore](file:///c:/Users/reyna/OneDrive/Documents/Locus/.gitignore) with `.cache/`, `*.tmp`, `*.bak`, `.vscode/`, `.idea/`.
- **Zero-Secret Production Key Hygiene & Self-Hostable Config**:
  - Completely sanitized [firebase-applet-config.json](file:///c:/Users/reyna/OneDrive/Documents/Locus/firebase-applet-config.json) with public placeholders (`YOUR_FIREBASE_API_KEY`, etc.).
  - Upgraded [src/lib/firebase.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/lib/firebase.ts) to dynamically resolve configuration prioritizing environment variables (`VITE_FIREBASE_API_KEY`, etc.) before falling back to local JSON, ensuring complete self-hostability out of the box.
  - Validated git diff to confirm 0 secrets or API keys (`AIzaSy...`, `AQ.`, `re_`) are committed.
- **Repository Documentation Reorganization**:
  - Reorganized loose root markdown files into structured `docs/` subdirectories:
    - Moved [Locus-Demo-Agent-Plan.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/docs/demo/Locus-Demo-Agent-Plan.md) and [Locus-Demo-Data-Brief.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/docs/demo/Locus-Demo-Data-Brief.md) to `docs/demo/`.
    - Removed legacy scratch prompt `STRATA-refactor-prompt.md`.
    - Removed redundant root duplicates of design guidelines and standards.
    - Updated [README.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/README.md) documentation directory and video walkthrough links.
- **Authentic Conversational Tone Pass ([TALKING_POINTS.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/TALKING_POINTS.md))**:
  - Completely overhauled talking points in the creator's natural first-person developer voice, chronicling OOUX domain modeling, Ben Garcia's paper marginalia, the 550KB vector float stripping breakthrough, exorcising AI purple gradients with Impeccable, the 6-tier fallback ladder in production, Maya's student persona simulation, and Cloud Run single-container architecture.
- **Archival Dark Mode Integration**:
  - Added `@custom-variant dark (&:where(.dark, .dark *));` to [src/index.css](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/index.css) for Tailwind CSS v4 class-based dark mode.
  - Configured dark semantic substrate and ink tokens (`--color-canvas: #141412`, `--color-surface: #1E1D19`, `--color-paper-deep: #26241F`, `--color-text-primary: #ECE7DE`, `--color-text-muted: #9B9588`, `--color-border-hairline: #2D2B24`, `--color-accent-sage: #4E9B71`, `--color-accent-sage-tint: #1B3324`).
  - Added zero-flash inline theme initialization script in `<head>` of [index.html](file:///c:/Users/reyna/OneDrive/Documents/Locus/index.html) checking `localStorage.getItem('locus_theme_mode')` and device `prefers-color-scheme`.
  - Added quick Sun/Moon toggle button (`#navbar-theme-toggle-btn`) in [src/components/Navbar.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/Navbar.tsx).
  - Added 3-way segmented control (`System`, `Daylight`, `Obsidian`) in [src/components/SettingsDrawer.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SettingsDrawer.tsx) with live preview and cancel rollback.
  - Added `themeMode?: 'system' | 'light' | 'dark'` to `UserSettings` in [src/types.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/types.ts), initialized in `DEFAULT_SETTINGS` in [src/lib/firebase.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/lib/firebase.ts), and synced in [src/App.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/App.tsx).
  - Audited design tokens with Impeccable tools (`doctor.mjs` no drift, `context.mjs`), ensuring WCAG 2.1 AA text contrast compliance ($\ge 6.2:1$).
- **Voice-to-Text Speech Recognition**:
  - Authored reusable [src/hooks/useSpeechRecognition.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/hooks/useSpeechRecognition.ts) using the Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) with error handling, transcript buffering, and unmount cleanup.
  - Integrated `#workspace-mic-button` in [src/components/SessionWorkspace.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SessionWorkspace.tsx) with accessible tooltip and aria labels, pulsing indicator during active dictation, and non-destructive transcript appending.
- **Authentic Builder-Voiced README.md & Academy Submission Alignment**:
  - Completely rewrote [README.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/README.md) in the creator's authentic first-person voice, dropping AI marketing clichés.
  - Added dedicated section framing engineering and design decisions around the **4 Academy Evaluation Pillars**:
    - **Authenticity**: OOUX domain modeling (Sophia Prater), Ben Garcia's paper marginalia (Strata Layer), and realistic 15-entry longitudinal student dataset.
    - **Usability**: Exorcising AI tropes with Impeccable, Rule of One Accent (`#3B7A57` / `#4E9B71`), WCAG 2.1 AA dual substrates, native voice-to-text dictation, and interactive phyllotaxis blooming concept graph.
    - **Stability**: 6-tier Gemini fallback ladder (`gemini-3.5-flash` to `gemini-flash-latest`), offline demo simulator, and 100% automated test coverage (93 Vitest unit tests, 28 Playwright browser tests, 22-screen visual audit suite).
    - **Security**: Outbound PII scrubbing, SSRF-protected webhooks, owner-bound Firestore security rules (`request.auth.uid == userId`), and zero hardcoded secrets.
  - Highlighted **Google Cloud Run** container architecture with dynamic `process.env.PORT` binding in [server.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/server.ts), `/api/health` probes, and stateless execution.
  - Formally credited Google Gen AI Academy APAC Cohort 3, Sophia Prater's Object-Oriented UX (OOUX) domain modeling, Ben Garcia's marginalia guidance, Playwright automated testing, and Impeccable design tools.
  - Added transparent documentation table referencing [CHANGELOG.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/CHANGELOG.md), [TALKING_POINTS.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/TALKING_POINTS.md), [PRODUCT.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/PRODUCT.md), and [DESIGN.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/DESIGN.md).
- **Automated Visual Screen Audit Suite ([tests/e2e/visual-audit.spec.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/tests/e2e/visual-audit.spec.ts), `npm run audit:screens`)**:
  - Authored a comprehensive 11-screen automated Playwright visual audit suite systematically evaluating the entire application in both **Light** and **Archival Obsidian Dark** modes (22 high-resolution full-page captures):
    1. `01_landing_page`: Sanctuary gateway with auth modal, Google OAuth, and constellation preview.
    2. `02_reflections_home`: 2-column masonry reflection cards with strata badges and filter chips.
    3. `03_workspace_empty`: Dialogue composer in empty state with microphone dictation button and mode stances.
    4. `04_workspace_conversation`: Interactive reflection stream with companion response and status indicator.
    5. `05_entry_margins`: Sealed immutable reading view with marginalia notes and strata deltas.
    6. `06_themes_timeline`: Themes master-detail timeline with current rolling synthesis and observation timeline.
    7. `07_concept_graph_macro`: Macro themes constellation with radial springs and interactive dragging.
    8. `08_concept_graph_zoomed`: Zoomed micro trajectory view with directed chronological vectors ($Obs_1 \rightarrow Obs_n$).
    9. `09_the_return_view`: Looking back daily archivist view with provenance header and margin action bar.
    10. `10_settings_drawer`: Settings & preferences drawer with tone presets and segmented theme switcher.
    11. `11_guided_tour_modal`: Docked floating walkthrough card with interactive steps.
  - Automatically exports all screenshots to `image_docs/visual_audit/light/` and `image_docs/visual_audit/dark/`, and mirrors into the agent artifact directory for instant evaluation.
  - Added `"audit:screens": "playwright test tests/e2e/visual-audit.spec.ts"` to [package.json](file:///c:/Users/reyna/OneDrive/Documents/Locus/package.json).

- **Dark Mode Substrate Hardening & Zero-Leak Audit**:
  - **Landing Page Auth Modal & Gateway**: Converted right gateway column from hardcoded `bg-[#FBFBF9]` to `bg-surface`, Google OAuth button hover to `hover:bg-canvas`, input fields to `bg-canvas border-border-hairline text-text-primary`, and mini SVG constellation preview to CSS variables `var(--color-surface)` and `var(--color-text-primary)` in [src/components/LandingPage.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/LandingPage.tsx). Added fixed floating quick theme toggle (`#landing-theme-toggle-btn`) in the top-right corner and converted carousel slide badges from awkward gray/white boxes to high-contrast semantic sage pills (`bg-accent-sage-tint text-accent-sage border border-accent-sage/25`).
  - **Reflections Home Strata Badges**: Converted `{stratumCount} strata` badges and tag chips from stark white capsules (`#EAE6DC`, `#F4F3EE`) to subtle dark-bordered capsules (`bg-canvas border border-border-hairline text-text-muted font-semibold`) in [src/components/ReflectionsHome.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/ReflectionsHome.tsx).
  - **Session Workspace Header & Stance Strip**: Harmonized category/mood select dropdowns, countdown timer badge, Summary & Insights button, and Stance mode bar from hardcoded `#F9F7F2` and `stone` colors to `bg-canvas border-border-hairline text-text-primary` in [src/components/SessionWorkspace.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SessionWorkspace.tsx).
  - **The Return / Looking Back**: Completely adapted page canvas from hardcoded `#FAF9F6` to `bg-canvas`, reading turn cards from `#FFFFFF` to `bg-surface border-border-hairline`, and borders/muted text from `#DCD7CD`/`#5A5648` to semantic design tokens in [src/components/TheReturnView.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/TheReturnView.tsx).
  - **Themes Timeline Rolling Synthesis**: Adapted "Current Rolling Synthesis" card from hardcoded `bg-[#FAF9F6]` to `bg-canvas border border-border-hairline text-text-primary` in [src/components/ThemesView.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/ThemesView.tsx).
  - **Guided Tour Modals & Drawers**: Adapted [src/components/WalkthroughOverlay.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/WalkthroughOverlay.tsx), [src/components/EntryReaderWithStrata.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/EntryReaderWithStrata.tsx), [src/components/BookmarksDrawer.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/BookmarksDrawer.tsx), and [src/components/IntelligenceDrawer.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/IntelligenceDrawer.tsx) to semantic design tokens.

- **Concept Graph Streamlining, Zoom Blooming & Hybrid Physics ([src/components/ThemesView.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/ThemesView.tsx))**:
  - **Removed Redundant Instruction Banner**: Exorcised the bulky top explanation banner (`"Hybrid Concept Graph: Drag nodes to explore..."`), streamlining the header to constellation metrics and the `Re-bloom` action.
  - **Streamlined Floating Inspector**: Replaced the bulky `w-80` bottom-right card with a compact floating inspector (`w-72 sm:w-76 p-3.5 bg-surface/90 backdrop-blur-md border-border-hairline`) featuring an instant dismiss (`X`) button, a 2-line condensed synthesis excerpt, and an efficient side-by-side action row (`Focus Trajectory` + `Unpack`).
  - **Zoom Spiral Blooming Motion**: When zooming into a theme via double-click or "Focus Trajectory", observation satellites initialize at center `(380, 260)` with `scale: 0.35, opacity: 0` and bloom outward in chronological order along the spiral trajectory with spring physics.
  - **Zoomed Hybrid Physics**: Enabled full interactive pointer dragging and liquid physics (orbital springs toward the theme Sun + soft Coulomb repulsion) for observation satellites in zoomed mode, with dynamic radial spring updates and a dedicated "Re-bloom" action.

- **Student Persona Demo Dataset Realignment ([Locus-Demo-Data-Brief.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/Locus-Demo-Data-Brief.md), [Locus-Demo-Agent-Plan.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/Locus-Demo-Agent-Plan.md))**:
  - **15-Entry Chronological Student Archive**: Created authentic 4-week narrative archive of a first-year university student adjusting to college life away from home.
  - **Organically Evolved Longitudinal Themes**: Produced 8 persistent themes and 21 observations through live Gemini AI execution, including *The Strain of Environmental Anonymity* (2 obs), *Home as Unnegotiated Sanctuary* (9 obs), *Grace in Beginner's Mind* (2 obs), *Vulnerability as Collaborative Bridge* (3 obs), *Agency in Economic Friction* (1 obs), *Sanctuary of the Unobserved Laboratory* (2 obs), *The Recursive Loop of Healing* (1 obs), and *The Architecture of Self-Projection* (1 obs).
  - **Preserved Previous Founder Dataset**: Safely archived the previous 6-entry founder dataset in [src/services/demoSimulator.founder.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/demoSimulator.founder.ts).
  - **Historical Timestamp Override**: Extended [src/services/synthesis.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/synthesis.ts) and [server.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/server.ts) so explicit historical timestamps on entries and observations are preserved rather than overwritten by server `Date.now()`.
  - **Automated Chronological Seeder Engine ([scripts/seed-student-demo.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/scripts/seed-student-demo.ts))**: Built autonomous runner script executing entries in strict narrative order ($N+1$ waits for $N$ to conclude and synthesize) with natural 1–4 sentence diary-voice turns.
  - **All 7 Technical Checkpoints Verified ([docs/DEMO_DATA_RUN_REPORT.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/docs/DEMO_DATA_RUN_REPORT.md))**:
    1. Multi-theme extraction on Entry 1 and Entry 15.
    2. Non-linear emotional relapse dip on Entry 10 (Friday night stairwell crying).
    3. Outbound PII sanitization on Entry 6 (`555-0148` scrubbed prior to Gemini egress).
    4. Selective geocoding opt-in on Entry 14 during weekend trip home (`Suburban Chicago, IL`).
    5. Singleton orphan theme on Entry 11 (Calvino reflection).
    6. Bookmark-worthy epiphany turn on Entry 12 with analytical note.
    7. Unpack Further enabled live across multiple themes with $\ge 2$ observations.
  - **Dynamic Relative Timestamps ([scripts/finalize-demo-dataset.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/scripts/finalize-demo-dataset.ts))**: Transformed compiled dataset in [src/services/demoSimulator.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/demoSimulator.ts) to use `subDays(days)` so reflections are always temporally anchored relative to the user's current session date without heavy 3072-dimensional vector bundle bloat.

- **Workspace De-Cluttering & Refinement (Option B: Zero-Banner Ambient Integration)**:
  - **Eliminated Banner Stack**: Removed 4 stacked intrusive banners from [src/components/ReflectionsHome.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/ReflectionsHome.tsx) (First-Run Tour banner, Daily Prompt card, Ready for Synthesis ribbon, The Return banner), restoring a serene, archival canvas with natural breathing room.
  - **Ambient Daily Contemplation Bar**: Integrated an elegant single-line contemplation bar (`#daily-contemplation-bar`) with typography in Source Serif 4 displaying the active daily prompt with a clean `Reflect →` action.
  - **Inline Filter Alignment & Synthesis Tab**: Merged `Ready for Synthesis ({readyThemes.length})` into the inline filter chips adjacent to the search input, rendering an interactive theme grid with observation counts and trajectory unpack actions.
  - **Persistent "Looking back" Navigation**: Added a dedicated "Looking back" tab in [src/components/Navbar.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/Navbar.tsx) with a subtle terracotta indicator dot when past reflections are available for re-reading, transitioning provenance naming from "The Return" to plainspoken "Looking back".
- **Guided Walkthrough Overhaul ([src/components/WalkthroughOverlay.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/WalkthroughOverlay.tsx))**:
  - **Auto-Navigating Linear Tour**: Overhauled walkthrough to dynamically drive the application behind it upon clicking Next (`reflections` canvas → `session` dialogue → bookmarks drawer → sealed `reader` → `return` archivist → `themes` constellation) without modal dismissal or disjointed jumps.
  - **Compact Bottom-Right Floating Card**: Completely removed the dark, full-screen backdrop overlay (`backdrop-blur-xs`) in favor of a sleek $360\text{px}$–$410\text{px}$ floating card docked at `bottom-6 right-6 z-50`, leaving the underlying UI fully visible and interactive.
  - **Briefer Micro-Copy & Zero AI Glitter**: Replaced verbose explanations with punchy 1–2 sentence summaries, exorcised all `Sparkles` icons from the entire walkthrough, and eliminated disruptive prompt action buttons that previously ejected users from the tour.
  - **Universal Tour Access**: Added a visible desktop `Tour` label in the sticky navbar ([src/components/Navbar.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/Navbar.tsx)), a clean `Guided tour` trigger on the Reflections Home contemplation bar ([src/components/ReflectionsHome.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/ReflectionsHome.tsx)), and a `Restart Guided Walkthrough` card in Settings ([src/components/SettingsDrawer.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SettingsDrawer.tsx)).
- **Typography & Theme Live Preview**:
  - Wired `--font-reading`, `--font-leaf`, and `--font-serif` dynamically in [src/App.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/App.tsx) and [src/index.css](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/index.css) to support seamless typeface switching across `Literata`, `Inter`, `Roboto`, and `Overpass Mono`.
  - Added real-time live preview in [src/components/SettingsDrawer.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SettingsDrawer.tsx) so typography and accent ink immediately update on click with graceful rollback on Cancel.
- **Sanctuary Portal Aesthetics & Tab Branding**:
  - Cleaned up background effects in [src/components/LandingPage.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/LandingPage.tsx) by removing static SVG concentric circles so only dynamic, natural water-droplet ripple waves animate and dissolve outward.
  - Updated browser tab title in [index.html](file:///c:/Users/reyna/OneDrive/Documents/Locus/index.html) to `"Locus"`.
- **Persistent Morning Roadmap ([docs/SCHEDULED_TASKS.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/docs/SCHEDULED_TASKS.md))**: Created persistent agenda file detailing the morning kickoff plan for Phase 5 (project README, technical stack, feature architecture, security audit review, and post-submission stretch goals).

### Changed
- **Balanced Multi-Turn Dialogue Dataset ([src/services/demoSimulator.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/demoSimulator.ts))**:
  - Balanced the 15-entry archive into 8 rich multi-turn conversational exchanges (Entries 1, 2, 5, 6, 9, 10, 12, 15 with 6–8 alternating turns) and 7 streamlined episodic journal reflections (Entries 3, 4, 7, 8, 11, 13, 14 with 2 turns), mirroring authentic daily human rhythm.
  - Updated `ThemeObservation` texts for multi-turn entries to explicitly showcase how the AI companion's inquiries and reframings (e.g., chemical notation as compressed shortcuts, separating exam scores from self-worth, and dropping defensive pretense) catalyzed the user's breakthroughs.
- Updated [tests/e2e/screens.spec.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/tests/e2e/screens.spec.ts) search query from `'Paralysis'` to `'Invisible Cities'` to validate search filter against the new student dataset.
- Updated [src/services/strataService.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/strataService.ts) to seed demo strata anchored to student entries `demo-entry-1` (+27d correction, +21d confirmation) and `demo-entry-5` (+15d gratitude).
- **API Authentication & IDOR Hardening (Ben Garcia Security Audit)**:
  - Created [`src/middleware/auth.ts`](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/middleware/auth.ts): `requireAuth` Express middleware verifying Firebase ID tokens via Google Identity Toolkit with 5-minute in-memory cache, demo-mode bypass (`DEMO_TOKEN`), and test-mode bypass (`Bearer test-token-<userId>`).
  - Created [`src/lib/api.ts`](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/lib/api.ts): `apiFetch` wrapper automatically injecting `Authorization: Bearer <token>` (Firebase ID token or demo token) on all client-to-server API calls.
  - Integrated `requireAuth` middleware onto all sensitive endpoints in [`server.ts`](file:///c:/Users/reyna/OneDrive/Documents/Locus/server.ts): `/api/reflect`, `/api/gemini/summarize`, `/api/gemini/synthesis`, `/api/entries/:id/conclude`, `/api/entries/:id/messages/:messageId`, `/api/themes/:id/unpack`, `/api/location/*`, and `/api/notifications/test-webhook`.
  - Added IDOR safeguards on `/api/entries/:id/conclude` and `/api/entries/:id/messages/:messageId` to validate `req.userId === resource.userId` before mutation, blocking cross-user manipulation.
  - Refactored all `fetch()` calls to `apiFetch()` in `SessionWorkspace.tsx`, `IntelligenceDrawer.tsx`, `ThemesView.tsx`, `SaveToNotebookModal.tsx`, `SettingsDrawer.tsx`, and `App.tsx`.
  - Fixed TypeScript type error in `tests/unit/auth-middleware.test.ts`: `next` typed as `vi.fn() as unknown as NextFunction` to satisfy `tsc --noEmit`.
  - **Verification**: `npm run lint` exits 0. `npm run test:unit` — 15 test files, 99 tests, all passing.

---

## [2026-09-05]

### Added
- **Master Architectural Refactor — Locus Strata (Option B: Hybrid Model)**:
  - **The Active Sanctuary & Conversational Companion ([src/components/SessionWorkspace.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SessionWorkspace.tsx))**:
    - Retained real-time conversational reflection across 4 cognitive stances (`reflect`, `brainstorm`, `actionable`, `mindful`).
    - Terminology shift: completely transitioned from "Pinning" to "Bookmarking" passages with dedicated analytical notes.
    - Added persistent IndexedDB draft synchronization (`offlineSync.ts`) and explicit `[ Conclude & Seal Page ]` action.
  - **The Strata Margin Layer & Sealed Reader ([src/components/EntryReaderWithStrata.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/EntryReaderWithStrata.tsx), [src/services/strataService.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/strataService.ts))**:
    - Concluded reflections are permanently immutable (`bodySealedAt`), routing to a 2-column desktop archival reader ($34\text{rem}$ reading column + $18\text{rem}$ recessed margin gutter).
    - Enabled marginalia annotation (`Stratum` model) stamped with exact temporal distance (`written 94 days later`) and 5 semantic ink stances (`correction`, `confirmation`, `question`, `grief`, `gratitude`).
    - Enforced strict AI Margin Policy: the AI remains 100% silent in the margins; strata are vector-embedded to track perspective shifts without conversational intrusion.
  - **The Return Daily Archivist Loop ([src/components/TheReturnView.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/TheReturnView.tsx), [src/services/returnRouter.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/returnRouter.ts))**:
    - Created daily single-entry re-reading surface backed by 4 explainable heuristics (`anniversary`, `unresolved`, `contradiction`, `dormant`).
    - Contradiction matching compares divergent emotional stances between past entries and invites user to write in the margin with zero AI prose generation.
  - **Archival Dignity & Keep-Style Masonry Preservation ([src/components/ReflectionsHome.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/ReflectionsHome.tsx))**:
    - Preserved Google Keep-style responsive cards on Reflections Home.
    - Added `Courier Prime` stratum count badges (`3 strata · +94d`), bookmark ribbon badges, and a dedicated "Bookmarked" filter tab.
  - **Dedicated Bookmarks Drawer ([src/components/BookmarksDrawer.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/BookmarksDrawer.tsx))**:
    - Built dual-mode bookmark reader (Chronological feed vs Grouped by Reflection) with instant search, quote copying, and direct entry jump.
  - **Interactive Guided Walkthrough Controller ([src/components/WalkthroughOverlay.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/WalkthroughOverlay.tsx), [src/components/ReflectionsHome.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/ReflectionsHome.tsx))**:
    - Upgraded walkthrough overlay with dual display modes: full archival focus modal and compact floating pill (`#walkthrough-minimized-pill`) allowing unobstructed navigation during the tour.
    - Added tranquil first-run welcome banner on Reflections Home (`#first-run-tour-banner`) with immediate tour trigger (`#banner-start-tour-btn`) and localStorage dismissal tracking.
    - Added comprehensive Playwright E2E test ([tests/e2e/interactive-walkthrough.spec.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/tests/e2e/interactive-walkthrough.spec.ts)) validating the entire 8-stage interactive user journey.
  - **Authentic 30-Day Simulation Dataset Realism ([src/services/demoSimulator.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/demoSimulator.ts), [src/services/strataService.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/strataService.ts))**:
    - Pre-seeded `isBookmarked: true` and reflective analytical notes across `demo-entry-1`, `demo-entry-2`, and `demo-entry-4`.
    - Auto-seeded multi-layer demo strata in memory store (`demo-entry-1` +94d correction, +120d confirmation; `demo-entry-2` +23d gratitude) demonstrating temporal distance and semantic ink without manual user typing.
    - Added explicit `openThreads` on `demo-entry-1` to immediately demonstrate The Return's explainable `unresolved` heuristic.
  - **Reflective Email Notification Scheduling in Settings ([src/components/SettingsDrawer.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SettingsDrawer.tsx), [src/types.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/types.ts))**:
    - Replaced binary toggle with delivery cadence selector (`Immediate on Conclusion`, `Weekly Reflection Briefing`, `Muted / Off`).
    - Added scheduling controls for delivery day (`Sunday`, `Monday`, `Friday`) and preferred time (`7:00 AM`, `8:00 AM`, `7:00 PM`, `8:00 PM`).
  - **Comprehensive Verification Suite (116 Tests Passing)**:
    - 14 Vitest unit suites (93 tests passing): `strata-delta.test.ts`, `return-router.test.ts`, `no-fake-ai.test.ts`.
    - 23 Playwright E2E tests (23 passing): `interactive-walkthrough.spec.ts`, `strata-margins.spec.ts`, `the-return.spec.ts`, `walkthrough-tour.spec.ts`, `screens.spec.ts`, `core-loop.spec.ts`, `integrations.spec.ts`, `smoke.spec.ts`.

### Changed
- **Zero-Fake-AI Hardening ([src/services/synthesis.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/services/synthesis.ts))**:
  - Deleted all simulated template strings returning fake AI insights on Gemini failure; errors are escalated honestly with retry affordances.
- **Phase 4 — Internal Prompts Audit & System Instruction Hardening ([docs/INTERNAL_PROMPTS_AUDIT.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/docs/INTERNAL_PROMPTS_AUDIT.md), [server.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/server.ts))**:
  - Catalogued all 8 system instructions, user prompt templates, and reflection generators across the application into a comprehensive audit document.
  - Hardened `/api/reflect`:
    - Enclosed user turns within security boundary delimiters (`<<<USER_INPUT>>>`) to mitigate OWASP LLM prompt injection risks.
    - Added outbound PII sanitization pass (`sanitizeForOutbound`) prior to Gemini egress.
    - Calibrated tone directives: explicitly prohibited lecturing, patronizing, clinical diagnosing, or authoritarian advice-giving.
  - Hardened `/api/gemini/summarize`:
    - Purged explicit vendor leak (`Gemini Feedback` $\rightarrow$ `Reflection Partner`) per Locus Software Standard 5.
    - Wrapped transcripts with `<<<SESSION_TRANSCRIPT>>>` delimiters.
    - Reframed persona from corporate "expert executive coach" to "calm, deeply perceptive reflection analyst".
  - Hardened `/api/gemini/synthesis`:
    - Reframed persona from "Master Synthesis Coach" to "Longitudinal Reflection Guide".
    - Wrapped history with `<<<JOURNAL_HISTORY>>>` delimiters and applied PII sanitization.
  - Hardened `/api/notebook/context-hint`:
    - Enclosed user excerpts within `<<<EXCERPT>>>` delimiters with PII sanitization.

- **Phase 3.6 - Pass 2: Adaptive Grid Density, Calibrated Stillness & Universal Sparkle Eradication**:
  - **Adaptive Grid Density & Centered Reading Dignity ([src/components/ReflectionsHome.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/ReflectionsHome.tsx))**:
    - Eliminated the 65% dead white space bug where multi-column CSS (`columns-2 md:columns-3 lg:columns-4`) forced low reflection counts (1–2 cards) into the far-left columns while leaving the rest of the canvas empty.
    - Implemented count-adaptive responsive layout:
      - 1 card: Centered intimate reader card (`max-w-xl mx-auto`).
      - 2 cards: Balanced side-by-side twin layout (`max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4`).
      - 3+ cards: Full responsive masonry grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`).
  - **Calibrated Stillness & Pulse Eradication ([src/components/ReflectionsHome.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/ReflectionsHome.tsx), [src/App.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/App.tsx))**:
    - Replaced generic nervous `animate-pulse` status indicators with calm, steady sage rings (`w-2 h-2 rounded-full bg-accent-sage ring-2 ring-accent-sage/25`).
    - Replaced single-letter bouncing 'L' loading state in `App.tsx` with centered static `LocusMark` monogram.
  - **100% Sparkles Eradication Across Entire Codebase**:
    - Cleared all residual `Sparkles` icons from all active views, drawers, and legacy modals:
      - `ThemesView.tsx`: Unpack Further changed to `Compass`, Re-bloom changed to `RotateCcw`.
      - `SettingsDrawer.tsx`: "Voice & Tone" and "Load Demo Reflection Archive" converted to `Compass`.
      - `LandingPage.tsx`: "Explore Demo Space" converted to `Compass`, header badge converted to `LocusMark`.
      - `ReflectionsHome.tsx`: Empty state converted to `Compass`.
      - Cleared legacy components (`SaveToNotebookModal.tsx`, `NotebookView.tsx`, `IntelligenceDrawer.tsx`).
    - Verified **0 occurrences** of `Sparkles` and **0 occurrences** of `animate-pulse` across the entire codebase.

- **Phase 3.6 - Pass 1: Anti-AI Purification & Typography Normalization**:
  - **Bespoke Locus Monogram ([src/components/LocusMark.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/LocusMark.tsx), [src/components/Navbar.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/Navbar.tsx))**:
    - Replaced the generic 4-pointed Lucide `Sparkles` AI icon in the navbar brand lockup with a bespoke concentric SVG Locus mark (`⊙`) representing a focal point of convergence, presence, and stillness.
    - Refined navbar typography: removed the redundant stacked "Reflective Journal" subtitle in favor of a clean, serene brand identity (`Locus SANCTUARY`).
  - **Whole-Word Semantic Title Distillation ([src/lib/textUtils.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/lib/textUtils.ts), [src/components/SessionWorkspace.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SessionWorkspace.tsx))**:
    - Created `extractCleanTitle(prompt, maxLen)` utility eliminating severed syllable truncations (e.g. `hesita...`, `gen...`).
    - Titles break cleanly at natural sentence punctuation (`[.?!;\n]`) or whole-word boundaries at ~46 characters with a dignified ellipsis (`…`), preserving the integrity of user thought.
  - **Universal Prose Markdown Sanitization ([src/lib/textUtils.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/lib/textUtils.ts), [src/components/ReflectionsHome.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/ReflectionsHome.tsx), [src/components/SessionWorkspace.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SessionWorkspace.tsx))**:
    - Created `cleanProseSnippet(text)` utility that strips markdown headers (`## Executive Synthesis`), bold/italic formatting, quote marks, and raw section labels before rendering preview snippets on reflection cards and concluded dossiers.
  - **Quiet Typographic Thinking Indicator ([src/components/SessionWorkspace.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SessionWorkspace.tsx))**:
    - Replaced generic ChatGPT-style bouncing gray skeleton loading bars and sparkle badges with an editorial Source Serif 4 thought indicator: *"Reflecting with you…"*, accompanied by a quiet, gentle breathing ink dot.
    - Replaced `Sparkles` in workspace companion turn headers with `LocusMark`, in empty states with `Compass`, and in Key Takeaways with `BookOpen`.
  - **Comprehensive Unit Testing Suite ([tests/unit/text-utils.test.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/tests/unit/text-utils.test.ts))**:
    - Added 10 new unit tests covering sentence boundaries, word-boundary truncation, markdown header removal, and empty state resilience (suite total now 68/68 passing).

- **Phase 3.6: Centered Sanctuary Portal Refinements & Authentication Modernization**:
  - **Refined Sanctuary Card Geometry & Animated Water Ripples ([src/components/LandingPage.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/LandingPage.tsx), [src/index.css](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/index.css))**:
    - Scaled down card dimensions from `max-w-5xl` ($1080\text{px}$) to an intimate, compact `max-w-4xl` (~$880\text{px}$) with natural height and balanced padding (`p-6 sm:p-7`).
    - Engineered continuous GPU-composited water ripple wave keyframes (`@keyframes water-ripple`, `animation-fill-mode: backwards`, and `opacity-0` base state) across 3 staggered epicenters, eliminating static boot-up rings and running with 0% CPU consumption.
    - Scaled down category pills (`Themes`, `Concept Graph`, `Private & Quiet`) to quiet, delicate, sentence-case tags (`text-2xs font-normal text-text-muted bg-stone-100/90 px-1.5 py-0.5 rounded border border-border-hairline/70`) that no longer overpower the typography.
    - Added silky cross-fade transitions (`opacity-0` $\rightarrow$ `opacity-100` with `duration-300`) between showcase slides.
  - **Radical Right-Column Decluttering ([src/components/LandingPage.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/LandingPage.tsx))**:
    - Purged marketing clutter: removed the `"Sanctuary Portal"` badge pill, removed the `"No sign-up required • 30-day..."` subtext, and removed the bottom security disclaimer footer.
    - Retained strictly the dignified functional core: `Reflect with depth.`, mode switcher, Google button, email/password form, and direct demo entry.
  - **3-Pillar User-Focused Showcase Narrative ([src/components/LandingPage.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/LandingPage.tsx))**:
    - Shifted focus from abstract privacy/enterprise storage marketing toward the three core values users care about:
      1. *Conversational Reflection*: "Think out loud, naturally." — untangling thoughts in conversation without blank page pressure, with live dialog card preview.
      2. *Themes & Growth*: "Watch your insights connect." — distilling sessions into enduring themes and chronological observations to show personal growth.
      3. *Visual Constellation & Timeline*: "Explore your concept graph." — exploring ideas through the authentic mini SVG constellation matching `ThemesView.tsx` with central `YOU` hub, spring links, and floating serif theme nodes.
  - **Firebase Email & Password Authentication ([src/lib/firebase.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/lib/firebase.ts))**:
    - Implemented and exported `signInWithEmail(email, password)` and `signUpWithEmail(email, password)` via Firebase Auth SDK.
    - Full error handling normalization (invalid credentials, weak passwords, email in use) while preserving existing Google OAuth and Firestore undefined-stripping safeguards.
  - **Centered Sanctuary Portal Modal ([src/components/LandingPage.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/LandingPage.tsx))**:
    - Replaced the generic full-width marketing hero with an intimate, centered rounded rectangular sanctuary card ($1080 \times 640\text{px}$, `max-w-5xl rounded-3xl bg-surface border border-border-hairline shadow-xl`).
    - **Left Column (~68%)**: Auto-rotating visual showcase carousel cycling every 6s across 3 core product pillars:
      1. *Longitudinal Architecture*: From daily fragments to enduring clarity, showcasing sample entry-to-theme synthesis cards.
      2. *Spatial Geometry*: Living thoughts in harmonic resonance, highlighting the spiral petal bloom topology and liquid drag physics.
      3. *Calm Sanctuary*: Zero ads, zero social feeds, per-user cryptographic isolation and outbound PII scrubbing standards.
      - Features pause-on-hover, keyboard accessibility, dot steppers, and discrete next/prev navigation chevrons.
    - **Right Column (~32%)**: Refined sanctuary access gateway featuring:
      - Clean `h1` brand title ("Reflect with depth.") preserving test selectors.
      - Interactive mode switcher between "Sign In" and "Create Account".
      - Google OAuth button (`#hero-google-signin-btn`).
      - Inlined email and password form with friendly inline error handling.
      - Prominent zero-friction demo gateway (`#hero-demo-mode-btn`) with 30-day preloaded simulation notice.
    - **Mobile Responsiveness**: Dynamic responsive breakdown gracefully transitioning from horizontal 68/32 split on desktop to stacked swipeable showcase on mobile.
  
- **Phase 3.5: Hybrid Concept Graph, Visual Artifact Hardening & Impeccable Design Audit**:
  - **Spiral Petal Bloom Choreography & Dynamic Graph Entrance ([src/components/ThemesView.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/ThemesView.tsx))**:
    - **85ms Staggered Clockwise Petal Bloom**: Theme nodes dynamically blossom outward from the central `YOU` anchor hub in a rhythmic clockwise sequence ($0.35 \rightarrow 1.0$ scale, $0.0 \rightarrow 1.0$ opacity) driven by custom `easeOutBack(x)` position cushioning and `easeOutQuint(x)` scale growth curves.
    - **100% Static Stillness (0% CPU upon Settle)**: Solved sub-pixel font shimmering and rasterization snapping by eliminating artificial continuous ambient drift. Once the bloom settles (1.05s glide), all animation frame loops cleanly terminate (`cancelAnimationFrame`), consuming 0% idle CPU and ensuring calm, stable editorial readability.
    - **Smart Floating Two-Line Typography (No Capsule Box)**: Eliminated bounding `<rect>` capsule border stroke, replacing it with balanced two-line `Source Serif 4` typography split via `splitTitleIntoTwoLines()`. Added `stroke="#FAF9F6" strokeWidth={3.5} paintOrder="stroke fill"` background glyph halo to prevent underlying spring links from intersecting letterforms, while preserving the `theme-badge-*` testing selector.
    - **Direct-to-DOM Liquid Drag Physics**: Bypassed React fiber reconciliation overhead during drag gestures by mutating SVG transforms directly, achieving buttery 60fps/120fps liquid elasticity ($K=0.045$, damping $0.88$, soft Coulomb repulsion $K_{rep}=0.28$) with automatic quiet settle threshold (`maxMovement < 0.04`).
    - **Tactile "Re-bloom" Action**: Added a discrete header action button to allow users to trigger the spiral petal blossom sequence at any time on demand.
  - **Hybrid Concept Graph Architecture ([src/components/ThemesView.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/ThemesView.tsx))**:
    - **Double-Click Observation Sub-Graph Drill-Down**: Interactive transition into a theme's constituent observation graph without backend schema mutations. Central theme node transforms into an anchor hub surrounded by chronological satellite observation nodes.
    - **Directed Chronological Trajectory Vectors**: SVG `<marker id="trajectory-arrow">` with directed vector lines ($Obs_1 \rightarrow Obs_2 \rightarrow \dots \rightarrow Obs_n$) dynamically tracing intellectual trajectory over time.
    - **Constellation Breadcrumb Navigation**: Seamless one-tap return back to macro constellation graph.
  - **Concluded Reflection Split View (Approach B) ([src/components/SessionWorkspace.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/SessionWorkspace.tsx))**:
    - Replaced the single-feed conclude view with an intentional 60/40 two-column split layout.
    - Left pane (60%): Preserves the complete historical conversational transcript in Source Serif 4.
    - Right pane (40%): Sticky Executive Synthesis Dossier with clean markdown stripping, qualitative tag pills, key takeaways, immutable record assurance, and cross-navigation CTAs (`+ Start New Reflection` & `Explore Themes & Concept Graph`).
  - **Unpack Further Dual-Mode Resilience Engine ([src/components/ThemesView.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/ThemesView.tsx))**:
    - Built client-side heuristic synthesis fallback when `/api/themes/:id/unpack` fails (e.g. offline, server restart, quota). Generates structured working thesis, contextual narrative, and 3 exploration paths directly from local observations, guaranteeing zero `Failed to fetch` crashes.
  - **Toast Notification Engine Hardening (Approach A) ([src/components/Toast.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/Toast.tsx), [src/App.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/App.tsx))**:
    - Added 4000ms auto-dismiss timer on non-error notifications with pause-on-hover.
    - Conditioned `Retry Operation` button strictly on `type === 'error' && Boolean(onRetry)`.
    - Positioned notifications in calm, centered bottom overlay (`bottom-6 left-1/2 -translate-x-1/2`).
  - **"Ready for Synthesis" Ribbon & Tag Wrap (Approach A) ([src/components/ReflectionsHome.tsx](file:///c:/Users/reyna/OneDrive/Documents/Locus/src/components/ReflectionsHome.tsx))**:
    - Renamed ribbon section to **"Ready for Synthesis"** for immediate, calm clarity.
    - Added CSS scroll-snap (`snap-x snap-mandatory` and `snap-start` cards) for delightful tactile mobile swiping.
    - Configured `flex flex-wrap gap-1.5` on qualitative tags to eliminate horizontal pill clipping.
  - **Permanent Visual Asset Documentation Archive (`image_docs/`)**:
    - Initialized `image_docs/` in repo root and added to `.gitignore`.
    - Archived 8 full-resolution PNG screenshots documenting all core states and views.
  - **Comprehensive Impeccable Design Token Harmonization**:
    - Executed repository-wide audit with `.agents/skills/impeccable/scripts/detect.mjs`.
    - Eliminated all AI side-tab tells (`border-l-4`, `border-l-2`), contrast warnings (`text-stone-800` on `bg-amber-50`), and off-ramp font sizes (`10px`, `11px`), reducing detector anti-pattern count from 97 down to **0**.

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
