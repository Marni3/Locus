# Scheduled Tasks & Morning Kickoff Roadmap — Locus (ReflectAI)

This document provides a persistent, tamper-proof record of scheduled tasks, planned morning development, and post-submission stretch goals for **Locus**.

Even when Antigravity IDE or the local machine is powered off, this file preserves all planned instructions and context so you can resume immediately upon bootup.

---

## ✅ Completed Phases & Verification Archive

### Phase 5: Project Documentation & Archival Design (Completed 2026-09-06)
- **Detailed Builder-Voiced README.md**: Fully aligned with Google Gen AI Academy 4 Pillars (Authenticity, Usability, Stability, Security), Cloud Run container architecture, and OOUX domain modeling.
- **Humanized Talking Points ([TALKING_POINTS.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/TALKING_POINTS.md))**: Natural first-person narrative covering Ben Garcia's marginalia, 550KB vector float optimization, Impeccable color restraint, and Gemini fallback engineering.
- **Intentional Archival Dark Mode**: Dual substrate palette (`#FAF9F6` daylight, `#141412` obsidian), WCAG 2.1 AA contrast compliance, zero-flash script in `index.html`, and quick navbar/settings toggles.
- **Automated Visual Screen Audit ([tests/e2e/visual-audit.spec.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/tests/e2e/visual-audit.spec.ts))**: 22 full-page visual captures across all 11 core screens in both Daylight and Obsidian themes.
- **Mobile Touch Audit ([tests/e2e/mobile-audit.spec.ts](file:///c:/Users/reyna/OneDrive/Documents/Locus/tests/e2e/mobile-audit.spec.ts))**: 6/6 tests passing on `390×844` Retina DPR 2 with collapsing navbar icon targets and zero horizontal scroll.
- **Full-Spectrum Video Walkthroughs**: Autonomous Playwright captures of all 7 Acts on Desktop (`media/demo_recordings/locus_desktop_walkthrough_1080p.webm`) and Mobile (`media/demo_recordings/locus_mobile_walkthrough_retina.webm`).
- **Zero-Secret Production Hygiene**: Sanitized `firebase-applet-config.json`, dynamic environment variable resolution in `src/lib/firebase.ts`, and verified 0 leaked API keys in git diff.
- **Repository Reorganization**: Clean root directory with structured `docs/demo/`, `docs/architecture/`, `docs/design/`, and `docs/standards/` subdirectories.

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

## 🎨 Polish Queue (Do When Limits Refresh)

### 1. Impeccable Design Audit Pass
- Run a full Impeccable skill audit across all screens.
- Focus areas: visual hierarchy consistency, spacing rhythm, typographic scale, any remaining hardcoded colors leaking into dark mode.
- Check empty states, loading skeletons, and error surfaces — these tend to miss dark mode coverage.
- Trigger: read `impeccable` SKILL.md → audit mode.

### 2. Motion & Transition Fluidity Pass
- **Page/view transitions**: Add smooth animate-in/fade on `App.tsx` view switches (`reflections` → `session` → `themes` → `return`).
- **Drawers**: Audit `SettingsDrawer`, `BookmarksDrawer`, `IntelligenceDrawer` for consistent slide+fade behavior.
- **Message stream**: Verify new AI turns animate in with subtle `fade-in slide-up` rather than hard-appearing.
- **Concept graph**: Review spring stiffness/damping — aim for more liquid, unhurried settle.
- **Stance mode strip**: Pill indicator should translate smoothly between stances rather than jump.
- **Navbar active tab**: Active indicator should slide between tabs rather than snap.
- Implementation note: prefer CSS `transition` + Tailwind duration classes over JS libraries — keeps bundle lean.

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
