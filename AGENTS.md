# AGENTS.md — Locus / ReflectAI

Welcome to **Locus** (ReflectAI) — an intelligent, calm, and private reflective journaling and personal insight platform built with Express, Vite, React 19, TailwindCSS v4, Firebase Firestore/Auth, and the `@google/genai` SDK.

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
- **Tool & API Execution**: Principle of least privilege, SSRF prevention, no raw shell/dynamic execution risks.
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

## 🎨 UI/UX Design System Guidelines

Adhere strictly to [Locus Design Guidelines](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/rules/design-guidelines.md) and the [`locus-design-guidelines`](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/locus-design-guidelines/SKILL.md) skill:

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
4. **Typography**:
   - **Serif** (e.g. Source Serif): User's own words, journal entries, quotes.
   - **Sans** (e.g. Inter): UI chrome, navigation, buttons, AI responses, metadata.
5. **No Plumbing / Backend Leaks in UI**: Never expose "Firestore", "Gemini", or database/vendor names in user-facing copy. Use plain, active language: "Saved" (not "Persisted to Firestore"), "Send" (not "Send to Gemini").
6. **One Taxonomy**: Sidebar filter categories are the single source of truth.

---

## 🛠️ Tech Stack & Directory Layout

- **Frontend**: React 19, TypeScript, TailwindCSS v4, Lucide React, Motion (Framer Motion).
- **Backend / API**: Express 4 (`server.ts`), `@google/genai` (Gemini SDK), Vite dev server integration.
- **Database & Auth**: Firebase 12 (Firestore, Firebase Authentication).

```
Locus/
├── .agents/
│   ├── rules/                           # Workspace rules applied automatically
│   │   ├── software-standards.md        # Core production & security directives
│   │   └── design-guidelines.md         # Visual tokens & UI/UX principles
│   └── skills/                          # Progressive disclosure agent skills
│       ├── locus-software-standards/    # Primary development & security skill
│       ├── locus-design-guidelines/     # UI/UX design & anti-leakage skill
│       ├── third-party-integration-standards/ # src/integrations/ wrapper pattern
│       ├── firestore-vector-search/     # Vector embeddings & KNN query rules
│       ├── feature-architecture-spec/   # 7-point design spec authoring
│       └── code-quality-standards/      # Strict typing & mock testing standards
├── docs/
│   ├── standards/                       # Project standards documentation
│   ├── design/                          # Design guidelines and redesign specs
│   └── specs/                           # Feature architecture specs (durable record)
├── src/
│   ├── components/                      # React UI components
│   ├── integrations/                    # Isolated 3rd-party wrappers (client/types/errors/mocks)
│   ├── lib/                             # Firebase and shared helpers
│   ├── types.ts                         # Core shared application types
│   ├── App.tsx                          # Root React view
│   └── index.css                        # Design token definitions
├── server.ts                            # Unified Express + Vite server entrypoint
└── firestore.rules                      # Owner-bound security rules
```

---

## ⚡ Available Agent Skills Quick Reference

When performing specific workflows, leverage the relevant skill:

| Skill | Trigger / When to Apply | Path |
|---|---|---|
| **`locus-software-standards`** | **Primary baseline for 90%+ of all development tasks** (threat modeling, resilience, error handling, persistence). | [SKILL.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/locus-software-standards/SKILL.md) |
| **`locus-design-guidelines`** | Writing or modifying any React UI component, modal, drawer, or copy. | [SKILL.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/locus-design-guidelines/SKILL.md) |
| **`third-party-integration-standards`** | Adding or touching external APIs (Maps, embeddings, auth) via `src/integrations/<service>/`. | [SKILL.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/third-party-integration-standards/SKILL.md) |
| **`firestore-vector-search`** | Storing embeddings, composite vector indexing, `findNearest` cosine queries, idea graphs. | [SKILL.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/firestore-vector-search/SKILL.md) |
| **`feature-architecture-spec`** | Non-trivial feature design before writing code (`docs/specs/<feature>.md`). | [SKILL.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/feature-architecture-spec/SKILL.md) |
| **`code-quality-standards`** | Code changes, strict typing boundaries, error handling, mock integration tests. | [SKILL.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/code-quality-standards/SKILL.md) |

---

## 🚀 Development Commands

- `npm run dev`: Boots unified full-stack server on `http://localhost:3000` (Express + Vite).
- `npm run build`: Builds client bundle (`vite build`) and bundles server (`dist/server.cjs`).
- `npm run start`: Runs production server (`node dist/server.cjs`).
- `npm run lint`: Runs TypeScript type validation (`tsc --noEmit`).
