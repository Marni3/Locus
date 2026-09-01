# ReflectAI — Design Guidelines

This is the standing reference for any new screen, modal, tab, or feature. Its job: keep ReflectAI feeling like *one* coherent product a year from now, not a patchwork of whatever pattern was fastest to build. When a new feature spec conflicts with this doc, this doc wins — or the doc gets deliberately updated, not quietly ignored.

## 1. Brand Personality

ReflectAI is a private space for thinking, not a productivity dashboard. Every design decision should be checked against three words:

- **Calm** — low visual noise, nothing competes for attention that doesn't need to.
- **Personal** — feels like a journal, not enterprise software.
- **Trustworthy** — the user is writing private thoughts; nothing should feel like it's being logged, tracked, or processed by "a system."

**Do:** quiet chrome, one clear action per screen, plain language.
**Don't:** dashboard-style metrics, gamified badges/streaks-as-pressure, urgency-driven copy ("Don't lose your streak!"), anything that makes reflection feel like a chore to optimize.

## 2. Visual Tokens

### Color
Formalizing the palette already in use — one accent, warm neutrals, a single dark ink for contrast.

| Role | Token | Hex (approx.) | Usage |
|---|---|---|---|
| Background | `bg-canvas` | #FAF9F6 | App background |
| Surface | `bg-surface` | #FFFFFF | Cards, panels, modals |
| Accent | `accent-sage` | #3B7A57 | Primary buttons, active states, selected chips — **only** these |
| Accent-soft | `accent-sage-tint` | #DCEEE3 | Backgrounds for selected/active chips, subtle highlights |
| Ink | `text-primary` | #232323 | Body and headline text |
| Muted | `text-muted` | #6B6B6B | Metadata, timestamps, hints |
| Border | `border-hairline` | #E6E3DC | Dividers, card outlines |
| Dark surface | `bg-inverse` | #1C1C1C | Reserved for a single high-emphasis element per screen (e.g. a highlighted quote), not general chrome |

Rule of one: **the accent color appears only on things the user can act on or has selected.** If two elements on screen are both accent-colored, one of them is wrong.

### Typography
Two families, each with a job — not decoration, division of labor:

- **Serif (e.g. Source Serif 4 / Lyon / similar)** — entry titles, saved quotes, anything that is *the user's own words*. This is the "journal" voice.
- **Sans (e.g. Inter / similar)** — navigation, buttons, labels, AI responses, metadata. This is the "interface" voice.

Type scale (base 16px):
- Display / entry title: 28px serif, regular weight
- Section heading: 18px sans, medium
- Body: 15px sans, regular, 1.5 line-height
- Metadata/caption: 13px sans, muted color

Line length: keep body text under 80 characters per line. No all-caps labels, no single-word bolding for emphasis in headings.

### Spacing
Base unit: 8px. Between unrelated sections (toolbar → chat → composer): 24px minimum. Between related items in a group (chips in a picker): 8px. Never let two different logical sections touch with only a 1px divider between them — give the divider room to breathe on both sides.

### Iconography & Motion
- Line icons, single weight, no filled/outline mixing on the same screen.
- Motion only in response to a user action (opening a panel, confirming a save). No decorative hover animations on every card, no scroll-triggered reveals.

## 3. Layout & Navigation Principles

1. **One taxonomy per concept.** If entries are categorized, there is exactly one place that categorization lives (sidebar filters). Never let a second control re-express the same thing.
2. **One primary action per screen**, visually distinct via the accent color. Everything else is secondary (outlined/neutral) or tertiary (icon-only, appears on hover/focus).
3. **Progressive disclosure.** Controls used occasionally (pickers, advanced options) start collapsed and expand on demand. Controls used constantly (Send, Save) stay visible.
4. **New nav items earn a top-level slot only if used every session** (like Notebook). Everything else lives inside Settings or an entry's overflow menu.
5. **No backend or vendor names in the UI**, ever — no database names, no model/vendor names in copy. If model choice is a real user-facing feature, expose it as "AI model" with plain labels, not the raw model name.

## 4. Component Patterns

| Component | Rule |
|---|---|
| **Buttons** | Primary = filled accent, one per screen. Secondary = outlined neutral. Tertiary = icon-only, no border, appears on hover for message-level actions. |
| **Modals / slide-overs** | Used for focused tasks (Settings, Save-to-Notebook). Left tabs if the modal has >3 sections. Always Save/Cancel, never a stray "Done" that's ambiguous about whether it saved. |
| **Tabs** | Only for switching between views of the same content (e.g. Timeline/Patterns). Not a substitute for navigation. |
| **Chips/pills** | Reserve for actual multi-select or single-select choices (mood, tags). Never use pill styling for status text — status is a small icon + label, not a pill. |
| **Empty states** | State what's missing and the one action to fix it. No mascot illustrations unless the brand voice is playful (it isn't). |
| **Errors** | Say what happened and what to do next, in plain language. Never blame the user, never apologize performatively. |
| **Confirmations/toasts** | Match the verb on the button: a "Save" button produces a "Saved" toast, not "Success!" |

## 5. Content & UX Writing

- **Active voice, matching verbs.** The button says what happens: "Save changes," not "Submit." Whatever a button is named, the resulting state uses the same word.
- **Plain language, user's mental model.** "Notes," not "metadata objects." "Saved," not "persisted."
- **One job per string.** Don't stack a label, a status, and a timestamp into one sentence — separate them visually and let each be legible on its own.
- **Tone in errors/empty states is instructional, not emotional.** The interface explains and directs; it doesn't perform feelings.

## 6. Quality Floor (applies to every new screen)

- Responsive down to mobile width.
- Visible keyboard focus states on every interactive element.
- Reduced-motion respected (no motion that can't be disabled).
- Color contrast meets accessible minimums, especially muted text on `bg-canvas`.
- Nothing exposes backend/vendor implementation details.

## 7. New-Feature Checklist

Before shipping any new screen, modal, tab, or feature, confirm:

- [ ] Does this introduce a second way to do something we already have a way to do? If yes, consolidate.
- [ ] Is there exactly one primary (accent-colored) action?
- [ ] Are secondary/rare controls collapsed by default?
- [ ] Does any copy leak backend/vendor names?
- [ ] Do button labels, resulting states, and confirmations use matching verbs?
- [ ] Does it hold up at mobile width with visible focus states?
- [ ] Would a first-time user understand what this does without a tooltip?
