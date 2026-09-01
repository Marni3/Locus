# Locus (ReflectAI) Design Guidelines

## 1. Brand Personality
ReflectAI is a private space for thinking, not a productivity dashboard.
- **Calm**: Low visual noise, generous whitespace, no urgency-driven badges or gamified streak pressure.
- **Personal**: Feels like a physical journal, not enterprise software.
- **Trustworthy**: Private thoughts stay private. Never make the interface look like a corporate logger.

## 2. Visual Tokens
| Role | Token | Hex (approx.) | Usage |
|---|---|---|---|
| Background | `bg-canvas` | `#FAF9F6` | App background |
| Surface | `bg-surface` | `#FFFFFF` | Cards, panels, modals |
| Accent | `accent-sage` | `#3B7A57` | Primary buttons, active states, selected chips — **only** these |
| Accent-soft | `accent-sage-tint` | `#DCEEE3` | Backgrounds for selected/active chips, subtle highlights |
| Ink | `text-primary` | `#232323` | Body and headline text |
| Muted | `text-muted` | `#6B6B6B` | Metadata, timestamps, hints |
| Border | `border-hairline` | `#E6E3DC` | Dividers, card outlines |
| Dark surface | `bg-inverse` | `#1C1C1C` | Single high-emphasis element per screen (e.g. quote), not chrome |

**Rule of One**: The accent color appears only on things the user can act on or has selected. If two elements on screen are both accent-colored, one is wrong.

## 3. Typography
- **Serif (Source Serif 4 / Lyon / similar)**: Entry titles, quotes, saved excerpts — *the user's voice*.
- **Sans (Inter / similar)**: Navigation, buttons, labels, AI responses, metadata — *the interface voice*.
- Line length: Keep body text under 80 characters per line. No all-caps labels.

## 4. Anti-Leakage & Plumbing Defense
- **Zero backend/vendor names in the UI**: Never display "Firestore", "Gemini", "Google Cloud", or database terms.
- Use plain language:
  - "Past Entries" (not "Past Entries • Firestore")
  - "Saved" (not "Persisted to Firestore")
  - "Send" (not "Send to Gemini")
  - "AI model" (not raw model IDs in user-facing labels)

## 5. Layout & Navigation Principles
1. **One taxonomy per concept**: Sidebar filter categories are the single source of truth.
2. **One primary action per screen**: Visually distinct via the accent color.
3. **Progressive disclosure**: Controls used occasionally (pickers, advanced options) start collapsed.
4. **Active voice with matching verbs**: A "Save" button produces a "Saved" toast.

## 6. Quality Floor
- Responsive down to mobile width.
- Visible keyboard focus states on all interactive elements.
- Accessible color contrast on `bg-canvas`.
