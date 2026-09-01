---
name: locus-design-guidelines
description: Use whenever creating, styling, updating, or reviewing any user interface component, screen, modal, drawer, or user-facing copy in Locus / ReflectAI. Enforces the calm journal aesthetic, the strict single-accent color system (#3B7A57), progressive disclosure of controls, typography rules (Serif for user voice, Sans for UI), and complete anti-leakage of backend or vendor names in the UI.
---

# Locus (ReflectAI) Design Guidelines Skill

Standing reference for any screen, modal, tab, drawer, or component in Locus / ReflectAI.

---

## 1. Brand Personality & Mental Model

ReflectAI is a **private space for thinking**, not an enterprise dashboard or a gamified productivity tracker.
- **Calm**: Low visual noise, generous whitespace, no urgency-driven badges or streak pressure.
- **Personal**: Feels like a physical notebook/journal, warm and unhurried.
- **Trustworthy**: Private thoughts stay private. Never make the UI look like a corporate logger or analytics tool.

---

## 2. Visual Tokens & The Rule of One

| Role | Token | Value | Allowed Usage |
|---|---|---|---|
| Background | `bg-canvas` | `#FAF9F6` | Main app canvas / background |
| Surface | `bg-surface` | `#FFFFFF` | Cards, panels, modals, drawers |
| Accent | `accent-sage` | `#3B7A57` | **Primary buttons, active states, selected chips ONLY** |
| Accent Tint | `accent-sage-tint` | `#DCEEE3` | Backgrounds for selected chips, subtle highlights |
| Ink | `text-primary` | `#232323` | Body and headline text |
| Muted | `text-muted` | `#6B6B6B` | Metadata, timestamps, input placeholders |
| Border | `border-hairline` | `#E6E3DC` | Dividers, card outlines |
| Inverse Dark | `bg-inverse` | `#1C1C1C` | Single high-emphasis element per screen (e.g. quote block), not chrome |

> [!IMPORTANT]
> **The Rule of One Accent**: The accent color (`#3B7A57`) appears **only** on items the user can act on or has actively selected. If two unrelated elements on screen are both accent-colored, one is wrong.

---

## 3. Typography Division of Labor

- **Serif** (e.g. Source Serif 4 / Lyon): Entry titles, user-written reflection notes, saved quotes — *the user's own words*.
- **Sans** (e.g. Inter): Navigation, buttons, labels, AI responses, metadata — *the interface voice*.
- **Scale**:
  - Entry title / Display: `28px` serif, regular weight
  - Section heading: `18px` sans, medium
  - Body: `15px` sans, regular, 1.5 line-height (max 80 chars per line)
  - Metadata / Caption: `13px` sans, muted color

---

## 4. Anti-Leakage / Plumbing Rules

Never allow backend or vendor names into user-facing copy:
- ❌ "Past Entries • Firestore" ➔ ✅ **"Past Entries"**
- ❌ "Auto-persisted to Firestore" ➔ ✅ **"All changes saved"** (or silent subtle indicator)
- ❌ "Send to Gemini" ➔ ✅ **"Send"**
- ❌ "Vector KNN Index Error" ➔ ✅ **"Unable to find related entries right now"**

---

## 5. Layout & Component Guidelines

1. **One Taxonomy**: The category filters (e.g. All / Personal / Work / Ideas / Gratitude / Goals) are the single source of truth.
2. **Progressive Disclosure**: Collapse secondary controls (e.g. mood and stance pickers) into compact inline triggers (`Mood: Focused · Stance: Mindful Unpack ▾`) that expand on click.
3. **Buttons Hierarchy**:
   - **Primary**: Filled sage accent (`#3B7A57`), max one per screen.
   - **Secondary**: Outlined neutral (`border-hairline`).
   - **Tertiary**: Icon-only, appears on hover for item-level actions (Copy, Bookmark, Regenerate).
4. **Active Verbs**: Buttons use explicit verbs matching their confirmation toasts: "Save" ➔ "Saved".

---

## 6. Pre-Ship UI Checklist

- [ ] Is there exactly one primary (accent-colored) action visible?
- [ ] Are secondary/rare controls collapsed by default?
- [ ] Does any copy leak vendor names (Gemini, Firestore, Google Cloud)?
- [ ] Is the typography divided properly (Serif for user content, Sans for UI)?
- [ ] Is it responsive on mobile width with visible focus rings?
