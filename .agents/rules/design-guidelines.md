# Locus Design Guidelines (Impeccable System Authority)

> [!IMPORTANT]
> The normative visual design specification for Locus / ReflectAI is formalized in **[DESIGN.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/DESIGN.md)** and governed by the **[`impeccable`](file:///c:/Users/reyna/OneDrive/Documents/Locus/.agents/skills/impeccable/SKILL.md)** skill. All frontend code must adhere strictly to these tokens and patterns.

## 1. Brand Personality & Mental Model
- **Calm**: Low visual noise, quiet chrome, unhurried whitespace. Never add dashboard metrics, gamified streaks, or urgency badges.
- **Personal**: Physical journal warmth. Editorial typography.
- **Trustworthy**: Honest privacy boundaries. Absolute data isolation (`request.auth.uid == userId`).

## 2. Core Tokens & The Rule of One Accent
- Canvas: `bg-canvas` (`#FAF9F6`)
- Surface: `bg-surface` (`#FFFFFF`)
- Single Accent: `accent-sage` (`#3B7A57`) — **reserved exclusively for primary actions and active selection**.
- Selected Tint: `accent-sage-tint` (`#DCEEE3`) — soft background for selected chips.
- Primary Ink: `text-primary` (`#232323`)
- Muted Ink: `text-muted` (`#6B6B6B`)
- Dividers: `border-hairline` (`#E6E3DC`)

## 3. Typography Division of Labor
- **Source Serif 4**: User's voice (journal reflections, titles, quotes, notes).
- **Inter**: Interface voice (buttons, navigation, AI responses, metadata).

## 4. Anti-Leakage Rules
Never allow backend or vendor names in user-facing copy:
- Use "Past Entries" (not "Past Entries • Firestore").
- Use "All changes saved" / "Saved" (not "Persisted to Firestore").
- Use "Send" (not "Send to Gemini").

## 5. Active Screen Wireframe Architecture
Detailed wireframes for Reflections Home, Workspace, Themes Split/Graph, and Settings are defined in [DESIGN.md](file:///c:/Users/reyna/OneDrive/Documents/Locus/DESIGN.md).
