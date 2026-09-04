# AGENTS.md — Locus / ReflectAI

Welcome to **Locus** (ReflectAI) — an intelligent, calm, and private reflective journaling and personal insight platform built with **React 19**, **TypeScript**, **TailwindCSS v4**, **Express 4**, **Firebase Firestore/Auth**, and the **`@google/genai`** SDK.

---

## 🚨 MANDATORY PRIMARY DIRECTIVE: Locus Software Standards

> [!IMPORTANT]
> **All AI agent interactions, architecture decisions, and code generation in this repository MUST comply with the [Locus Software Standards](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/rules/software-standards.md) (also available via the [`locus-software-standards`](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/locus-software-standards/SKILL.md) skill).**
>
> You must strictly enforce these standards in **90%+ of all development prompts**.

### 1. Agentic Threat Modeling (5 Threat Zones)
Prior to outputting non-trivial code or system architecture, perform a scenario-driven threat analysis:
- **Input Surfaces**: Prompts, untrusted user inputs, external API payloads (strict schema validation via OWASP A03 / LLM02).
- **Planning & Reasoning**: Prompt injection defense, system instruction isolation (OWASP LLM01).
- **Tool & API Execution**: Principle of least privilege, SSRF prevention on webhooks, no raw shell/dynamic execution risks.
- **Memory & State**: Firestore user data isolation (`request.auth.uid == userId`), session integrity.
- **Inter-System Communication**: Token leakage prevention, zero secrets in logs.

### 2. Gemini Model Resilience & Fallback Protocol
Never hardcode a single model string. Always wrap content generation with the standard fallback ladder:
```typescript
export const MODEL_FALLBACK_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
  'gemini-2.5-flash'
];
```
Catch recoverable status codes (`503`, `429`, `404`, `500`) and sequentially attempt the next model in the fallback chain via `generateContentWithFallback()`.

### 3. Server-Side Robustness & Payload Ingestion
- **Ordering Guarantee**: Mount body parsers (`express.json()`, `express.urlencoded()`) *before* registering any endpoint routes.
- **Defensive Null-Safe Destructuring**: Guard incoming request data:
  ```typescript
  const data = (req.body && typeof req.body === 'object') ? req.body : {};
  ```
- **Unified Full-Stack Entrypoint**: Startup scripts (`dev`, `build`, `start`) run the unified Express + Vite entrypoint (`server.ts`).

### 4. Database Persistence & Zero-Crash Hygiene
- **Strict Undefined-Stripping**: Never allow `undefined` values to reach Firestore `setDoc`/`updateDoc`. Always sanitize payloads before writing.
- **Guaranteed Persistence (Input-to-Save Completeness)**: Ensure user input AND generated responses are persisted. Never fail silently.
- **Explicit Error Escalation**: Catch database errors and surface actionable retry options in the UI. Never clear the user's input buffer if saving fails.

### 5. Zero-Hardcoding & Secret Hygiene
- Never hardcode API keys or credentials (`AIzaSy...`).
- Read runtime secrets from environment variables or Google Cloud Secret Manager.

---

## 🎨 Impeccable Design System & Authority

Frontend design is governed by **[PRODUCT.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/PRODUCT.md)**, **[DESIGN.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/DESIGN.md)**, and the **[`impeccable`](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/impeccable/SKILL.md)** skill:

1. **Brand Personality**: **Calm**, **Personal**, **Trustworthy**. ReflectAI is a private space for thinking, not an enterprise dashboard or gamified tracker.
2. **Visual Tokens**:
   - `bg-canvas`: `#FAF9F6` (Main background)
   - `bg-surface`: `#FFFFFF` (Cards, panels, modals)
   - `accent-sage`: `#3B7A57` (**Single action accent** — primary buttons, active chips)
   - `accent-sage-tint`: `#DCEEE3` (Soft active chip backgrounds)
   - `text-primary`: `#232323` (Body & headers)
   - `text-muted`: `#6B6B6B` (Timestamps, hints)
   - `border-hairline`: `#E6E3DC` (Dividers, borders)
3. **Rule of One Accent**: The accent color appears **only** on elements the user can act on or has selected.
4. **Typography Division**:
   - **Serif** (Source Serif 4): User's own words, journal entries, reflection quotes.
   - **Sans** (Inter): UI chrome, navigation, buttons, AI responses, metadata.
5. **No Plumbing / Backend Leaks in UI**: Never expose "Firestore", "Gemini", or vendor names in copy.
6. **Screen Wireframe Architecture**: Detailed layout specifications for Reflections Home, Active Workspace, Themes Split/Graph, and Settings are defined in [DESIGN.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/DESIGN.md).

---

## 🏛️ Core Object Model & Architecture

Consult [Locus-Core-Object-Model.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/docs/Locus-Core-Object-Model.md) and [Locus-Integrations-and-Build-Plan.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/docs/Locus-Integrations-and-Build-Plan.md) for the active domain architecture:

- **`Entry`**: Episodic reflection conversation between user and AI. Immutable historical record once `concluded` (manually or via **2-hour auto-conclude** timer). Cascade deletes its Messages.
- **`Message`**: Atomic conversational turn within an Entry. Supports `isPinned` and `note` inline.
- **`Theme`**: Persistent, longitudinal intellectual/creative trajectory across entries. Stores a rolling `currentSynthesis` (never a task list).
- **`Theme Observation`**: Discrete, immutable delta connecting an Entry to a Theme. The chronological Observation feed forms the progress timeline.
- **Synchronous Synthesis Pipeline**: Triggered immediately when an Entry concludes:
  1. Embed Entry summary via Gemini embeddings API.
  2. Vector similarity search (`findNearest`) against Theme titles and current syntheses.
  3. LLM resolves matches: updates existing Themes with new Observations or proposes new Themes.
  4. Persist updated Themes and new Observations to Firestore.

---

## ⚡ Active Workspace Skills Quick Reference

| Skill | Trigger / When to Apply | Path |
|---|---|---|
| **`locus-software-standards`** | **Primary baseline for 90%+ of all development tasks** (threat modeling, resilience, error handling, persistence). | [SKILL.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/locus-software-standards/SKILL.md) |
| **`impeccable`** | **Primary design authority** for UI development, shaping wireframes, audits, and aesthetic craft. | [SKILL.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/impeccable/SKILL.md) |
| **`third-party-integration-standards`** | Adding or touching external APIs via `src/integrations/<service>/`. | [SKILL.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/third-party-integration-standards/SKILL.md) |
| **`firestore-vector-search`** | Storing embeddings, composite vector indexing, `findNearest` cosine queries, Themes. | [SKILL.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/firestore-vector-search/SKILL.md) |
| **`feature-architecture-spec`** | Non-trivial feature design before writing code (`docs/specs/<feature>.md`). | [SKILL.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/feature-architecture-spec/SKILL.md) |
| **`code-quality-standards`** | Code changes, strict typing boundaries, error handling, mock integration tests. | [SKILL.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/code-quality-standards/SKILL.md) |
| **`pii-sanitizer-implementation`** | Scrubbing phone/email/address prior to egress (Gemini/embeddings/webhooks). | [SKILL.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/pii-sanitizer-implementation/SKILL.md) |
| **`notification-dispatcher-integration`** | Webhook SSRF validation (HTTPS, DNS IP check, no redirects) & transactional email. | [SKILL.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/notification-dispatcher-integration/SKILL.md) |
| **`geocoding-integration`** | Opt-in Maps reverse geocoding, server consent checks, lat/long minimization. | [SKILL.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/geocoding-integration/SKILL.md) |

---

## 🚀 Development Commands

- `npm run dev`: Boots unified full-stack server on `http://localhost:3000` (Express + Vite).
- `npm run build`: Builds client bundle (`vite build`) and bundles server (`dist/server.cjs`).
- `npm run start`: Runs production server (`node dist/server.cjs`).
- `npm run lint`: Runs TypeScript type validation (`tsc --noEmit`).
