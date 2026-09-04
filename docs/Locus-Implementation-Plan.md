# Locus — Phased Implementation Plan & Engineering Playbook

*Design doc 3 of 3. Companions: `Locus — Core Object Model & Schema`, `Locus — Integrations, Demo Tooling & Build Plan`, `DESIGN.md`, `PRODUCT.md`.*

---

## 🔁 The Phase Execution Lifecycle

Every phase in this implementation plan operates under a non-negotiable **5-Step Execution Cycle**:

```mermaid
flowchart LR
    Build["1. BUILD\n(Code & Types)"] --> Deploy["2. DEPLOY / RUN\n(Local Vite + Server)"]
    Deploy --> Test["3. TEST\n(Playwright + Unit)"]
    Test --> Feedback["4. FEEDBACK\n(Impeccable + User)"]
    Feedback --> Verify["5. VERIFY\n(Sign-off Gate)"]
    Verify --> NextPhase["Next Phase"]
```

1. **`[BUILD]`**: Write types, services, integration clients, or React components conforming to [Locus Software Standards](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/rules/software-standards.md) and [DESIGN.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/DESIGN.md).
2. **`[DEPLOY / RUN]`**: Boot the unified server (`npm run dev`) or stage build locally.
3. **`[TEST]`**: Execute automated Playwright end-to-end scripts, integration mock suites, and security rejection tests.
4. **`[FEEDBACK]`**: Run Impeccable design audits (`$impeccable audit / critique / polish`), capture visual evidence, and prompt the user for interactive approval.
5. **`[VERIFY]`**: Confirm the phase's sign-off criteria before unlocking the next phase.

---

## 📋 Phase 0: Architectural Triage, Re-evaluation & Verification Harness

### Objective
Re-evaluate the inherited Google AI Studio prototype, separate durable infrastructure from legacy clutter, align the repository to the [Locus Core Object Model](file:///c:/Users/reyna/OneDrive/Documents/Locus/docs/Locus-Core-Object-Model.md), and establish automated Playwright testing.

### Codebase Triage Matrix

| Component / File | Current Status | Action | Rationale |
|---|---|---|---|
| **Firebase Auth** (`src/lib/firebase.ts`) | Working Google popup auth | **KEEP** | Complies with federated authentication standard. Keep user session listener intact. |
| **Server Deserialization** (`server.ts`) | Top-level body parsers mounted first | **KEEP** | Complies with Software Standard 6.1 (ordering guarantee). |
| **Model Fallback Ladder** (`server.ts`) | `MODEL_FALLBACK_LADDER` helper exists | **KEEP & REFACTOR** | Move helper into reusable service module (`src/services/gemini.ts`). |
| **Undefined Stripping** (`src/lib/firebase.ts`) | Basic `stripUndefined` utility | **KEEP & EXPAND** | Ensure recursive stripping handles nested arrays and null objects safely. |
| **Data Types** (`src/types.ts`) | Uses legacy `Interaction` & `NotebookItem` | **REWORK** | Replace with locked schema: `Entry`, `Message`, `Theme`, `ThemeObservation`. Move `NotebookItem` to deferred status. |
| **Firestore Collections** (`src/lib/firebase.ts`) | `/users/{uid}/interactions` | **REWORK** | Migrate collection paths to `/users/{uid}/entries`, `/users/{uid}/themes`, `/users/{uid}/observations`. |
| **Firestore Rules** (`firestore.rules`) | Basic owner check on `interactions` | **REWORK** | Add owner-bound rules for `entries`, `themes`, `observations` guaranteeing strict user isolation. |
| **Sidebar & Pill Controls** (`src/components/`) | 11 permanent pills & dual taxonomies | **REBUILD** | Replace with Impeccable calm wireframes: collapsed toolbar, single taxonomy, serif user voice. |
| **Synthesis Pipeline** (`src/components/IntelligenceDrawer.tsx`) | Client-side ad-hoc prompt | **REBUILD** | Replace with backend synchronous synthesis pipeline (`embed ➔ findNearest ➔ Gemini resolution ➔ batch write`). |
| **Integrations** (PII, Webhooks, Maps) | Missing / stubs | **REBUILD** | Implement isolated wrappers in `src/integrations/<service>/` per third-party integration standards. |

### Technical Implementation Details
1. **Verification Tooling Setup**:
   - Install Playwright: `npm install -D @playwright/test`.
   - Scaffold `playwright.config.ts` targeting `http://localhost:3000` with headless Chromium.
   - Create test harness directory: `tests/e2e/`.
2. **Schema Restructuring** (`src/types.ts`):
   ```typescript
   export type EntryStatus = 'active' | 'concluded';
   
   export interface EntryLocation {
     name: string;            // e.g. "Balanga, Bataan", "Home Office", or "The Mill Coffee, SF"
     latitude?: number;       // Optional GPS lat
     longitude?: number;      // Optional GPS lng
     source: 'gps' | 'manual';
   }

   export interface Entry {
     id: string;
     userId: string;
     createdAt: string;
     concludedAt?: string;
     status: EntryStatus;
     summary?: string;
     locationContext?: EntryLocation | null;
     mood?: string;
     stance?: string;
     isDemo?: boolean;
   }

   export interface Message {
     id: string;
     entryId: string;
     userId: string;
     role: 'user' | 'ai';
     content: string;
     timestamp: string;
     isPinned?: boolean;
     note?: string;
   }

   export interface Theme {
     id: string;
     userId: string;
     title: string;
     currentSynthesis: string; // rolling 2-3 sentences
     observationCount: number;
     createdAt: string;
     updatedAt: string;
     embedding?: number[];
     isDemo?: boolean;
   }

   export interface ThemeObservation {
     id: string;
     userId: string;
     entryId: string;
     themeId: string;
     observationText: string;
     timestamp: string;
     locationSnapshot?: string; // e.g. "Home Office" at time of observation
     isDemo?: boolean;
   }
   ```
3. **Firestore Security Rules Realignment** (`firestore.rules`):
   - Enforce absolute user document isolation:
     `match /users/{userId}/{document=**} { allow read, write: if request.auth != null && request.auth.uid == userId; }`

### User Actions & External Services Required
- [ ] Confirm local `.env` contains `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, and `GEMINI_API_KEY`.

### Verification Gate (Phase 0)
- `npm run lint` (`tsc --noEmit`) passes cleanly with new schema.
- Playwright runner boots and passes a basic smoke test (`npx playwright test`).

---

## ⚡ Phase 1: Core Loop & Synchronous Synthesis Pipeline

### Objective
Build the immutable `Entry` lifecycle (`Start Entry` ➔ `Send Message` ➔ `Conclude Entry`), turn pinning/notes, the 2-hour inactivity auto-conclude timer, and the synchronous Gemini + Vector similarity synthesis pipeline.

### Technical Implementation Details

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as Client (Workspace)
    participant Server as Express Backend
    participant Gemini as Gemini API (@google/genai)
    participant Firestore as Cloud Firestore

    User->>Frontend: Clicks "Conclude Entry" (or 2h timer expires)
    Frontend->>Server: POST /api/entries/:id/conclude
    Server->>Gemini: Generate Entry Summary (fallback ladder)
    Server->>Gemini: Generate Summary Embedding (text-embedding-004)
    Server->>Firestore: findNearest(candidate Themes by cosine similarity, limit: 3)
    Firestore-->>Server: Top candidate Themes
    Server->>Gemini: Prompt with Summary + Location + Pinned Messages + Candidates
    Gemini-->>Server: JSON { matchedThemes: [{themeId, observation}], newThemes: [{title, synthesis, observation}] }
    Server->>Firestore: Atomic Batch Write (Update Entry, Themes, insert Observations)
    Server-->>Frontend: 200 OK { entry, updatedThemes, newObservations }
    Frontend-->>User: Visual update: "All changes saved & synthesized"
```

1. **2-Hour Auto-Conclude Engine**:
   - Client records `lastActivityTimestamp` in `localStorage`.
   - On tick (every 30s), if `Date.now() - lastActivity > 2 * 60 * 60 * 1000`, automatically dispatch conclusion.
   - Server-side defense: Backend validates inactivity delta on entry fetch; if past 2 hours and still `active`, triggers conclusion on server.
2. **Synchronous Synthesis Pipeline (`src/services/synthesis.ts`)**:
   - **Step 1: Summary Generation**: Summarizes conversation transcript via `generateContentWithFallback()`.
   - **Step 2: Vector Embedding**: Embeds summary into 768-dimensional vector using `@google/genai`.
   - **Step 3: Vector Similarity Search**:
     Queries Firestore collection `/users/{userId}/themes` using `findNearest('embedding', queryVector, { limit: 3, distanceMeasure: 'COSINE' })`.
   - **Step 4: LLM Resolution**:
     Prompts Gemini with: Entry summary, location context (e.g. "Reflected from Coffee Shop"), candidate Theme titles + current syntheses, and any **pinned messages + user notes** (injected as high-priority semantic anchors). The model outputs structured JSON resolving observations to existing themes or creating new ones.
   - **Step 5: Transactional Persistence**:
     Executes atomic batch write to Firestore: updates Entry `status: 'concluded'`, creates new `ThemeObservation` records, and updates Theme `currentSynthesis`.
3. **Message Pinning & Notes**:
   - `PATCH /api/entries/:entryId/messages/:messageId` toggles `isPinned: boolean` and updates `note: string`.

### User Actions & External Services Required
- [ ] **Google Cloud Console**: Ensure Cloud Firestore is in Native mode.
- [ ] **Firestore Composite Vector Index**: Run index creation command:
  ```bash
  gcloud firestore indexes composite create \
    --collection-group=themes \
    --query-scope=COLLECTION \
    --field-config=vector-config='{"dimension":"768","flat":{}}',field-path=embedding
  ```
  *(Or configure via Firebase Console: Indexes ➔ Composite ➔ Vector Index).*

### Testing & Verification Plan
- **Automated Tests (`tests/e2e/core-loop.spec.ts`)**:
  - Script simulated dialogue across 4 turns.
  - Pin message 2 and add a note.
  - Trigger `/api/entries/:id/conclude` and assert HTTP 200 with structured JSON response.
  - Assert Firestore records: Entry is `status: 'concluded'`, Theme exists, Observation contains backlink `entryId`.
- **Manual Walkthrough**:
  - Run 3 distinct conversations: (1) Work burnout, (2) Creative project, (3) Work burnout follow-up.
  - Verify conversation (3) appends a second observation to the existing Work Theme rather than creating a duplicate.
  - Fast-forward the local 2-hour inactivity timer (set threshold to 30 seconds) and confirm auto-conclude executes cleanly.

### Impeccable Design & Feedback Checkpoint
- Run `$impeccable shape session-workspace` to verify calm, distraction-free chat stream and invisible auto-conclude countdown.
- Request user review on synthesis prompt accuracy and Theme clustering fidelity.

---

## 🔒 Phase 2: Integration Layer (Strict Fallback Ladder)

### Objective
Implement the four core integrations in strict risk/priority order:
$$\text{PII Sanitizer} \longrightarrow \text{Unpack Further} \longrightarrow \text{Notification Dispatcher} \longrightarrow \text{Dual-Mode Geocoding}$$
If build time runs short, features are dropped from the bottom up (Geocoding cut first, Sanitizer preserved at all costs).

### Integration Technical Specifications

```
src/integrations/
├── sanitizer/                   # Integration 1: Outbound PII Scrubber
│   ├── client.ts
│   ├── regex.ts
│   ├── types.ts
│   └── __tests__/fixtures.test.ts
├── unpack/                      # Integration 2: Theme Writing Engine
│   ├── client.ts
│   ├── prompt.ts
│   └── types.ts
├── notifications/               # Integration 3: SSRF-Hardened Webhooks + Email
│   ├── webhook.ts               # SSRF DNS IP validator
│   ├── email.ts                 # Resend / SendGrid client
│   ├── types.ts
│   └── __tests__/ssrf.test.ts
└── geocoding/                   # Integration 4: Dual-Mode Location Context
    ├── client.ts
    ├── types.ts
    └── __tests__/location.test.ts
```

#### 1. Outbound PII Sanitizer (`src/integrations/sanitizer/`)
- **Scope**: Outbound only. Raw reflections in Firestore stay unredacted for the user.
- **Function**: `sanitizeForOutbound(text: string): string`.
- **Regex Coverage**: Phone numbers (North American & E.164 formats), email addresses, exact street addresses.
- **Egress Gates**: Injected as middleware before: (a) Gemini synthesis calls, (b) embedding generation, (c) webhook payloads, (d) transactional emails.

#### 2. Unpack Further Engine (`src/integrations/unpack/`)
- **Condition**: Available on Themes with $\ge 2$ Observations.
- **Mechanism**: Pure prompt engineering against Gemini (zero external API risk).
- **Prompt**: Takes Theme title, rolling synthesis, and chronological Observation deltas ➔ returns a working title, one-line evolutionary thesis, and structured writing outline.

#### 3. Notification Dispatcher (`src/integrations/notifications/`)
- **Webhook Path (Zapier / Make)**:
  - High-risk SSRF vector. Enforces dual validation (at save time AND at send time):
    1. Scheme check: `https://` only.
    2. DNS IP Resolution: Resolves hostname to IP and blocks all private/reserved CIDRs: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16` (Cloud Metadata endpoint), and IPv6 equivalents.
    3. Redirect check: Transparent redirects forbidden.
    4. Timeout & Backoff: 3-second hard timeout, single retry with exponential backoff. Fire-and-forget; never blocks Entry conclusion.
    5. Rate Limiting: Max 5 outbound webhooks per user per hour.
- **Email Path**:
  - Dispatches conclusion executive summary via Resend / SendGrid API. User content HTML-escaped to prevent injection.

#### 4. Dual-Mode Location Context (`src/integrations/geocoding/`)
- **Dual Mode**:
  - **Mode A (GPS Auto-Detect)**: Browser requests `navigator.geolocation`, sends coordinates to backend, backend resolves city/district string via Google Maps Geocoding API, then **immediately discards raw coordinates**.
  - **Mode B (Manual Place Name)**: User clicks location pill and types a place name (e.g. `"Home Office"`, `"Kyoto, Japan"`, `"Coffee Shop"`). Works seamlessly when GPS is disabled or denied.
- **Theme Synthesis Enriched**: Location name passed into Gemini sessions allows the AI to extract spatial and environmental patterns across reflections (e.g., creative breakthrough outdoors vs. burnout at the desk).

### User Actions & External Services Required
- [ ] **Google Cloud Console**: Enable **Geocoding API** and generate an API key restricted to Geocoding API (`GOOGLE_MAPS_API_KEY`).
- [ ] **Transactional Email**: Obtain API key from [Resend](https://resend.com) or SendGrid (`EMAIL_API_KEY`).
- [ ] **Zapier Webhook**: Setup a catch-hook URL in Zapier/Make for end-to-end webhook verification.

### Testing & Verification Plan
- **Sanitizer Fixture Test (`tests/unit/sanitizer.test.ts`)**:
  - Run test suite with 15 known PII strings and 10 near-PII non-sensitive strings. Assert PII is redacted while surrounding journal sentiment remains intact.
- **SSRF Hardening Test (`tests/unit/ssrf.test.ts`)**:
  - Test targets: `http://localhost:3000`, `http://127.0.0.1:8080`, `http://169.254.169.254/latest/meta-data`, and `http://10.0.0.1`.
  - Assert all are strictly rejected with `400 Invalid Webhook Destination`.
- **Location Context Test (`tests/unit/geocoding.test.ts`)**:
  - Test GPS resolution mock and manual place input. Assert only clean `name` is stored on Entry without raw coordinates leaking.

### Impeccable Design & Feedback Checkpoint
- Verify location input pill is compact, quiet, and non-intrusive.
- Review webhook test payloads with user to confirm zero raw user data leakage.

---

## 🎨 Phase 3: Screen Development & Impeccable Craft Execution

### Objective
Implement the complete UI/UX architecture defined in [DESIGN.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/DESIGN.md) and [PRODUCT.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/PRODUCT.md) using React 19, TailwindCSS v4, Lucide React, and Framer Motion.

### Screen Wireframe Breakdown

```
Screen 1: Reflections Home (/)
┌────────────────────────────────────────────────────────┐
│  [Logo] Locus     [Search]     Reflections  Themes  (Avatar) │
├────────────────────────────────────────────────────────┤
│  [Banner] Theme ready to unpack: Creative Crossroads  │
│  "3 observations synthesized over 2 weeks" [Unpack] [x]│
├────────────────────────────────────────────────────────┤
│  ▼ Ready for Synthesis (2 themes ready)               │
├────────────────────────────────────────────────────────┤
│  Past Reflections                       [+ Start Entry]│
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Overwhelm    │  │ Architecture │  │ Morning Walk │  │
│  │ Sep 3 · 4m   │  │ Sep 1 · 8m   │  │ Aug 28 · 2m  │  │
│  │ [Focused]    │  │ [Mindful]    │  │ [Reflect]    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────────────────────────────────────┘

Screen 2: Active Workspace (/entry/:id)
┌────────────────────────────────────────────────────────┐
│  ← Back    Career Crossroads    [Loc: Office] Auto: 1h45m│
├────────────────────────────────────────────────────────┤
│  User: I feel like the engineering roadmap is slipping.│
│                                                        │
│  AI: What specific friction surfaced first this week? │
│     [Hover: 📌 Pin  📝 Note  📋 Copy]                 │
├────────────────────────────────────────────────────────┤
│  Mood: Focused · Stance: Mindful Unpack ▾              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Type your reflection...           [Cmd+Enter] [Send]│
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘

Screen 3: Themes Master-Detail & Graph (/themes)
┌────────────────────────────────────────────────────────┐
│  Themes                         [ Timeline | Graph ]   │
├─────────────────────────┬──────────────────────────────┤
│  [Search Themes...]     │ Creative Crossroads          │
│  ┌────────────────────┐ │ Current Synthesis:           │
│  │ Creative Cross...  │ │ "Transitioning from tools to │
│  │ 4 observations     │ │  focusing on execution..."   │
│  ├────────────────────┤ │ [Unpack Further]             │
│  │ Team Delegation    │ ├──────────────────────────────┤
│  │ 2 observations     │ │ Observation Timeline:        │
│  └────────────────────┘ │ • Sep 4: Realized perfection │
│                         │   was stalling the release.  │
│                         │   (Re: Overwhelm →)          │
└─────────────────────────┴──────────────────────────────┘
```

### Technical Implementation Details
1. **Screen 1: Reflections Home (`src/components/ReflectionsHome.tsx`)**:
   - Hero strip: Dismissible card highlighting latest ready Theme (`observationCount >= 2`).
   - Collapsible "Ready for Synthesis" section: horizontal scrolling ribbon.
   - Entry card grid: Cards with Source Serif 4 title, date, duration, mood chip, and location badge. Single accent `+ Start Entry` action.
2. **Screen 2: Active Workspace (`src/components/SessionWorkspace.tsx`)**:
   - Source Serif 4 user bubbles (`#F2EFEB`), Inter AI bubbles (`#FFFFFF`).
   - Message-level inline hover toolbar: Pin toggle (`isPinned`), Note popover, and Copy.
   - Dual-mode location pill (`[ 📍 Home Office ]`) with quick-edit popover.
   - Collapsed toolbar (`Mood: Focused · Stance: Mindful Unpack ▾`).
   - Auto-conclude timer hint and prominent `Conclude Entry` button.
3. **Screen 3: Themes Split & Graph (`src/components/ThemesView.tsx`)**:
   - Segmented toggle: `[ Timeline ]` vs `[ Concept Graph ]`.
   - **Mode A (Split Master-Detail)**: Left rail (35%) list of Themes; right canvas (65%) with rolling synthesis, `Unpack Further` CTA, and chronological Observation feed with entry backlinks.
   - **Mode B (Concept Graph)**: Force-directed SVG/Canvas graph. Theme nodes dynamically sized by `observationCount`. Clicking a node zooms in and animates satellite Observation nodes into view.
4. **Screen 4: Settings Drawer (`src/components/SettingsDrawer.tsx`)**:
   - Left tabs:
     - **Persona & Tone**: Presets (Warm, Direct, Reflective, Mindful) + Custom Instructions textarea.
     - **Integrations**: Zapier incoming webhook URL input (with inline SSRF validation feedback) and Email dispatch preferences.
     - **Demo Mode**: One-click "Enter Demo Mode" / "Exit Demo Mode" sandbox toggle.

### Active Impeccable Workflow
- Run `$impeccable shape reflections-home` before finalizing layout.
- Run `$impeccable audit` on all 4 screens to guarantee WCAG AA contrast against `#FAF9F6` and zero mobile overflow.
- Run `$impeccable polish` to verify font division (Serif for user prose, Sans for UI) and complete anti-leakage of vendor terms.

### Testing & Verification Plan
- **Playwright E2E Test (`tests/e2e/screens.spec.ts`)**:
  - Full happy path: Open Home ➔ Click `+ Start Entry` ➔ Chat 3 turns ➔ Pin turn 2 ➔ Conclude ➔ Land on Themes ➔ Switch to Graph View ➔ Zoom node ➔ Open Settings.
- **Visual Capture**: Playwright captures full-page screenshot artifacts of all 4 screens for review.

### Impeccable Design & Feedback Checkpoint
- Present screenshots to user. Verify that single accent `#3B7A57` is strictly enforced and that no competing pills exist.

---

## 🛠️ Phase 4: Polish, Authentic Month-Long Simulation & Demo Sandbox

### Objective
Create an authentic, longitudinal demo experience for evaluators by authoring realistic chronological reflections spanning a 30-day timeline, running them live through the genuine Gemini synthesis pipeline to produce organic Theme evolution, and adding the guided walkthrough overlay.

### Technical Implementation Details

#### 1. Evaluator Demo Mode (Self-Service Sandbox)
- **Zero-Barrier Access**: Available to any evaluator directly:
  - Button at the start of the **Guided Walkthrough**: `[Explore with Demo Mode]`.
  - Also accessible anytime in **Settings ➔ Demo Mode**.
- **User-Scoped Isolation**:
  - Writes data strictly to the evaluator's own `/users/{uid}/...` collections.
  - All records tagged with `isDemo: true`.
  - A clean `[Exit Demo Mode / Clear Sample Data]` button removes all demo records in 1 click without affecting real user reflections.

#### 2. Authentic 30-Day Simulation Dataset (`src/services/demoSimulator.ts`)
- Rather than loading static pre-baked JSON, we author **6 authentic multi-turn reflections** staged across a 30-day timeline with evolving perspectives and spatial contexts:
  - **Day 1 (Home Office)**: Overwhelm and paralysis around launching a major project; feeling scattered.
  - **Day 7 (Coffee Shop)**: Breakout ideas on simplifying the architecture; momentum returning.
  - **Day 14 (Late Night, Desk)**: Friction delegating tasks to teammates; fear of quality loss.
  - **Day 21 (Weekend Walk, Park)**: Realization that micromanagement is the root cause of fatigue; deciding on clear interface boundaries.
  - **Day 26 (Airport Terminal)**: Strategy session; framing the project trajectory as iterative learning rather than all-or-nothing.
  - **Day 30 (Home Office)**: Reflection on the past month; noticing how anxiety shifted into execution clarity.
- **Genuinely Run Through Gemini**:
  - The simulator runs these entries through the real synthesis pipeline.
  - Gemini organically matches, updates, and creates Themes (e.g. *Creative Crossroads*, *Engineering Leadership*, *Rhythm & Burnout*) and generates real, nuanced Observation deltas.
  - Demonstrates genuine longitudinal trajectory to evaluators with 100% authenticity!

#### 3. Mobile Viewport Optimization
- Collapsible mobile navigation drawer with touch targets $\ge 44\text{px}$.
- Split Themes view collapses to full-width master list with slide-in detail screen on mobile.

#### 4. Guided Walkthrough Overlay (`src/components/WalkthroughOverlay.tsx`)
- 3-step non-blocking tour on first login:
  - Step 1: Welcome & Option to click `[Enter Demo Mode]` or `[Start Fresh Entry]`.
  - Step 2: Highlighting turn Pinning and Notes in the chat stream.
  - Step 3: Explaining how Themes and Observations track longitudinal growth.

### Testing & Verification Plan
- **Simulation Test (`tests/e2e/demo-simulation.spec.ts`)**:
  - Trigger "Enter Demo Mode".
  - Assert that all 6 entries process cleanly and generate 3–4 coherent Themes with multiple dated Observations.
  - Click `[Unpack Further]` on a generated Theme and assert a structured thesis and outline is returned.
  - Click `[Exit Demo Mode]` and assert all demo items are completely wiped from the evaluator's account.
- **Responsive Test (`tests/e2e/mobile.spec.ts`)**:
  - Run Playwright mobile emulation (iPhone 14 / Pixel 7 viewports: 375x667, 412x915). Assert zero horizontal scrollbar and clean tap interactions.

### Impeccable Design & Feedback Checkpoint
- Run `$impeccable adapt` to inspect small-viewport layout stability.
- Run `$impeccable doctor` to confirm zero drift in design artifacts.

---

## 🚀 Phase 5: Production Readiness, Security Review & Deployment

### Objective
Execute the production build, run threat modeling review, generate submission documentation, and deploy the application to Cloud Run.

### Technical Implementation Details
1. **Production Bundling**:
   - Run `npm run build`: Vite bundles client SPA (`dist/client`), Esbuild bundles Express server (`dist/server.cjs`).
   - Validate production startup: `npm run start` running on `http://localhost:3000`.
2. **Security & Threat Model Audit**:
   - Verify all 5 Threat Zones per Locus Software Standards:
     - Input Surfaces: Sanitizer scrubs outbound PII; body limit capped at 10MB.
     - Planning & Reasoning: System prompts separate untrusted user transcript from instructions.
     - Tool Execution: Webhooks protected by DNS IP resolution and strict SSRF blocking.
     - Memory & State: Firestore user rules enforce owner-bound isolation (`request.auth.uid == userId`).
     - Inter-System Communication: API keys read dynamically from environment variables/Secret Manager; zero secrets in client bundle.
3. **Production Documentation**:
   - Generate production `README.md` covering: Architecture diagram, Core Object Model, Security mitigations writeup (outbound PII, SSRF, data minimization, sandboxed demo mode), and Cloud Run deployment instructions.

### User Actions & External Services Required
- [ ] **Google Cloud Run Deployment**:
  ```bash
  gcloud run deploy locus-reflectai \
    --source . \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars="NODE_ENV=production" \
    --update-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"
  ```

### Testing & Verification Plan
- **End-to-End Live Verification**:
  - Perform live click-through on deployed Cloud Run URL.
  - Verify Google Sign-in on production domain (authorized domains configured in Firebase Console).
  - Test end-to-end Entry conclusion and Theme synthesis on live server.

### Final Verification Gate (Phase 5)
- All automated Playwright suites pass (0 failures).
- Production build runs cleanly with 0 TypeScript errors.
- Threat modeling compliance verified and signed off.
