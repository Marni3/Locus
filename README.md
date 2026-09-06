# Locus (ReflectAI)

> A private reflective sanctuary and longitudinal insight companion built for the **Google Gen AI Academy APAC Edition (Cohort 3)**.

I took my sweet time working on my submission for the Google Gen AI Academy APAC Edition, but I'm happy to finally call it finished. I learned quite a lot building it and applying what we were taught in Cohort 3.

Since we were tasked with creating a "Personal Gemini Journal" and were even given a starter prompt that scaffolded a base application, I wanted to step back first and ask: *what does a journal actually need to do?* 

I asked this because I have spent years journaling on paper and experimenting with different digital note apps. Most AI journaling tools feel like a generic chat assistant with a database save button tacked on. You chat, you close the tab, and the conversation vanishes into an endless list of unread text dumps. That's not how real reflection works.

In a physical journal, your past thoughts stay grounded on paper. Over weeks and months, you start seeing the recurring threads in your life—the questions you keep returning to, the ideas that quietly evolve, and the moments where your thinking shifted. 

Locus is built around that reality. For the full behind-the-scenes engineering story, lessons learned, and trade-offs, see the [Talking Points & Retrospective](file:///c:/Users/reyna/OneDrive/Documents/Locus/TALKING_POINTS.md).

---

## Designing for the 4 Academy Evaluation Pillars

I used the **Google Gen AI Academy Evaluation Criteria** as our compass during architecture and development, treating each pillar as a real engineering constraint rather than a post-hoc checklist:

### 1. Authenticity (Originality & Custom-Built Concept)
- **Rethinking the Domain with OOUX**: Instead of cloning a standard chat app, I mapped the reflective domain into concrete, lifecycled objects using **Sophia Prater's Object-Oriented UX (OOUX)** framework: *Entries*, *Messages*, *Themes*, and *Theme Observations*.
- **The Strata Marginalia Layer**: Following feedback from **Ben Garcia**, concluded entries seal into an immutable historical reading view with editable margins, preserving the unvarnished authenticity of original thoughts while leaving space for future editorial notes.
- **Organic Longitudinal Synthesis**: Rather than creating flat tags or task lists, Gemini continuously synthesizes entries into evolving intellectual trajectories with discrete observations and vector embeddings.
- **Authentic Student Persona Archive**: To test the engine under realistic conditions, we avoided canned dummy cards and generated a 15-entry chronological archive of a first-year college student adjusting to campus life, with non-linear emotional relapses, cross-entry theme synthesis, and genuine voice.

### 2. Usability (Intuitive Design, Accessibility & Craft)
- **Exorcising AI Design Clichés with Impeccable**: I used **Impeccable** to audit visual hierarchy and deliberately eliminate generic "AI app" tropes—no glowing purple gradients, no floating sci-fi cards, and no low-contrast gray text.
- **Rule of One Accent**: Muted sage green (`#3B7A57` daylight / `#4E9B71` dark) is reserved strictly for interactive and actionable elements.
- **Dual-Palette Substrates**: 
  - *Daylight*: Warm archival ivory (`#FAF9F6`).
  - *Obsidian Dark*: Deep charcoal substrates (`#141412` canvas, `#1E1D19` surface) engineered specifically for late-night journaling with zero eye fatigue.
- **Accessible Dual Typography**: Human thoughts are set in warm serif typefaces (**Literata** / **Source Serif 4**), while UI chrome and AI inquiries use crisp sans-serif (**Inter**). All contrast ratios meet or exceed **WCAG 2.1 AA** ($\ge 4.5:1$ text, $\ge 6.2:1$ body).
- **Native Voice-to-Text Dictation**: A built-in microphone composer allows hands-free stream of consciousness dictation without breaking cognitive flow.
- **Interactive Concept Graph**: Liquid spring physics with phyllotaxis spiral blooming allows you to touch and drag themes, watching observations orbit their parent trajectories dynamically.

### 3. Stability (Zero-Crash Engineering & Fault Tolerance)
- **6-Tier Gemini Fallback Ladder**: To handle API rate limits, model deprecations, and upstream cloud hiccups gracefully, all generative AI calls pass through an automatic model fallback ladder:
  $$\text{gemini-3.5-flash} \longrightarrow \text{gemini-3.6-flash} \longrightarrow \text{gemini-2.5-flash} \longrightarrow \text{gemini-3.5-flash-lite} \longrightarrow \text{gemini-3.1-flash-lite} \longrightarrow \text{gemini-flash-latest}$$
- **Defensive Payload Ingestion**: Strict ordering guarantees (body parsers before routes), null-safe destructuring, and undefined-stripping ensure Firestore never rejects database writes.
- **Instant Offline Demo Simulator**: Anyone can experience the full app immediately with 100% of features unlocked without configuring API keys or credentials.
- **100% Automated Test Suite**:
  - **93 Vitest Unit Tests**: Validating PII sanitization, SSRF protection, prompt structures, geocoding fallbacks, and honest error handling.
  - **28 Playwright E2E Tests**: Validating user journeys, graph physics, dark mode switches, and automated visual regressions.
  - **22-Screen Automated Visual Audit Pipeline (`npm run audit:screens`)**: Automatically captures high-resolution screenshots of all 11 core screens across both light and dark modes.

### 4. Security (Data Protection & Secure Cloud Infrastructure)
- **Outbound PII Gate**: All outgoing reflection text is scrubbed for phone numbers, emails, and physical addresses before reaching external AI or embedding APIs. Your raw, unredacted thoughts stay safely inside your private storage.
- **SSRF-Protected Webhooks**: The notification dispatcher resolves webhook target hosts against DNS and strictly rejects loopback addresses (`127.0.0.1`), private networks (`10.0.0.0/8`, `192.168.0.0/16`), and cloud metadata endpoints (`169.254.169.254`).
- **Owner-Bound Firestore Security Rules**: Cloud Firestore enforces strict path-level isolation (`request.auth.uid == userId`) with default-deny rules on all collections.
- **Zero-Secret Hygiene**: Zero API keys or secrets are stored in code or client bundles. Secrets are injected at runtime via environment variables.

---

## Architecture & Google Cloud Infrastructure

Locus is built as a unified full-stack application designed to run as a single containerized service on **Google Cloud Run**, integrating cleanly with Google's cloud ecosystem:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             Google Cloud Run                             │
│       Stateless Container Runtime · Dynamic $PORT Binding · Auto-Scale   │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                    Express 4 + Vite SSR Middleware                 │  │
│  │                                                                    │  │
│  │  • Health Probe (/api/health)       • Egress PII Sanitizer         │  │
│  │  • Resilient Model Ladder Engine    • SSRF Webhook Validator       │  │
│  │  • Synthesis & Theme Pipeline       • Location Context Wrapper     │  │
│  └──────────────────┬───────────────────────────────────┬─────────────┘  │
└─────────────────────┼───────────────────────────────────┼────────────────┘
                      │                                   │
                      ▼                                   ▼
        ┌───────────────────────────┐       ┌───────────────────────────┐
        │     Google Gemini API     │       │      Google Firebase      │
        │    @google/genai SDK      │       │    Auth & Cloud Firestore │
        │   Multi-Model Fallback    │       │     User-Path Isolation   │
        └───────────────────────────┘       └───────────────────────────┘
```

- **Containerized for Google Cloud Run**: The entire app compiles into a standalone production server (`dist/server.cjs`) and client bundle. The server dynamically binds to `process.env.PORT` and provides `/api/health` probes for automated container lifecycle management.
- **AI Engine**: Powered by Google's new `@google/genai` TypeScript SDK using the Gemini Flash family for high-speed, cost-effective synthesis and vector search.
- **Database & Storage**: Google Cloud Firestore for secure, schema-flexible document storage with owner-isolated security rules.
- **Zero Heavy Native Dependencies**: Uses pure-JS engines (custom Euler spring physics, Canvas/SVG constellation graphics, Web Speech API) to guarantee instant cold boots on Cloud Run.

---

## What Locus Does

- **Multi-Stance Reflection**: Choose how the companion reflects back to you—*Reflective Mirror* for emotional unpacking, *Idea Spark* for brainstorming, *Action Blueprint* for pragmatic next steps, or *Mindful Grounding* for presence.
- **Voice-to-Text Dictation**: Native speech recognition composer built directly into the reflection workspace, allowing you to speak your stream of consciousness naturally without breaking focus.
- **Synchronous Synthesis Pipeline**: The moment an entry is concluded, Gemini analyzes the transcript and any pinned highlights, checks for related themes via semantic similarity, and creates or updates persistent theme dossiers with discrete observations.
- **Dual-View Themes Canvas**:
  - **Timeline Trajectory**: Read a chronological feed of how your thoughts on a topic evolved over weeks.
  - **Concept Graph**: An interactive, force-directed network showing connected themes, observation density, and cluster relationships.
- **The Return**: An explainable daily review loop that resurfaces exactly one past entry based on clear criteria (time horizon, margin density, or theme relevance). No fake urgency, streaks, or guilt trips.
- **Archival Appearance & Dark Mode**:
  - **Daylight**: Warm archival ivory (`#FAF9F6`) substrate.
  - **Obsidian Dark Mode**: Natural charcoal palette (`#141412` canvas, `#1E1D19` surface) engineered for quiet nighttime reflection.
  - **Rule of One Accent**: Muted sage green (`#3B7A57` / `#4E9B71`) reserved strictly for interactive actions.
- **Privacy & Security First**: Outbound PII scrubbing, SSRF-validated webhooks, owner-bound Firestore isolation, and full offline Demo Mode.

---

## Transparent Documentation & Process Archive

I believe in being transparent about how this system was designed, built, and tested. If you'd like to explore the deeper technical rationale, design specs, or development logs, they are documented across the repository:

| Document | Purpose |
|---|---|
| [CHANGELOG.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/CHANGELOG.md) | Running daily log of every change, feature addition, refactoring, and test result. |
| [TALKING_POINTS.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/TALKING_POINTS.md) | Authentic retrospective on engineering decisions, design epiphanies, and learnings. |
| [PRODUCT.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/PRODUCT.md) | Product definition, user personas, problem space, and core domain boundaries. |
| [DESIGN.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/DESIGN.md) | Visual design authority, typographic tokens, color system, and screen wireframes. |
| [docs/Locus-Core-Object-Model.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/docs/Locus-Core-Object-Model.md) | Deep breakdown of the Object-Oriented UX (OOUX) architecture and entity lifecycles. |
| [docs/demo/Locus-Demo-Data-Brief.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/docs/demo/Locus-Demo-Data-Brief.md) | Maya's authentic 15-entry student persona narrative specification. |
| [docs/standards/locus-software-standards.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/docs/standards/locus-software-standards.md) | The 5 Agentic Threat Zones, model fallback ladders, and zero-crash engineering standards. Based on the initial system prompt google provided for the system.|
| [docs/DEMO_DATA_RUN_REPORT.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/docs/DEMO_DATA_RUN_REPORT.md) | Autonomous runner report and verification results for the 15-entry student narrative dataset. |

### Video Walkthroughs
Pre-rendered full-spectrum Playwright video captures are included in the repository showcasing all 7 core application acts:
- 🖥️ **Desktop (1080p Full HD)**: `media/demo_recordings/locus_desktop_walkthrough_1080p.webm` (1920×1080)
- 📱 **Mobile (Retina DPR 2)**: `media/demo_recordings/locus_mobile_walkthrough_retina.webm` (780×1688)

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- A Google Gemini API Key (optional if running in Demo Mode)
- A Firebase project with Firestore enabled (optional if running in Demo Mode)

### 1. Clone & Install

```bash
git clone https://github.com/Marni3/Locus.git
cd Locus
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Client Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional Integrations
GOOGLE_MAPS_API_KEY=your_optional_maps_key
```

### 3. Run Locally

```bash
# Starts Express and Vite on http://localhost:3000
npm run dev
```

Open `http://localhost:3000` in your browser. You can immediately click **Explore Demo Space** on the landing page to experience the full app with realistic sample reflections, synthesized themes, and marginalia.

---

## Testing & Quality

I used a test-driven approach throughout development so changes to the synthesis pipeline or UI never broke existing functionality:

```bash
# Type check TypeScript
npm run lint

# Run all 93 unit tests (Vitest)
npm run test:unit

# Run all 28 browser E2E tests (Playwright)
npm run test:e2e

# Run 22-screen automated visual audit (Light & Dark modes)
npm run audit:screens

# Production build validation (Express server + Vite client bundle)
npm run build
```

---

## Acknowledgments

- **Google Gen AI Academy APAC**: For organizing Cohort 3 and providing guidance, prompts, and inspiration.
- **Sophia Prater**: For the Object-Oriented UX (OOUX) framework that brought structure and clarity to the domain model.
- **Ben Garcia**: For the thoughtful insight and discussion on physical notebook marginalia, which directly shaped the sealed reader and strata layer.
