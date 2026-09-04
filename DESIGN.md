---
name: Locus (ReflectAI)
description: A calm, private reflective journaling and longitudinal theme synthesis platform.
colors:
  bg-canvas: "#FAF9F6"
  bg-surface: "#FFFFFF"
  accent-sage: "#3B7A57"
  accent-sage-tint: "#DCEEE3"
  text-primary: "#232323"
  text-muted: "#6B6B6B"
  border-hairline: "#E6E3DC"
  bg-inverse: "#1C1C1C"
typography:
  display:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.25
  heading:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  serif-journal:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent-sage}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "8px 18px"
  button-secondary:
    backgroundColor: "{colors.bg-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  card-surface:
    backgroundColor: "{colors.bg-surface}"
    rounded: "{rounded.md}"
    padding: "20px"
  chip-active:
    backgroundColor: "{colors.accent-sage-tint}"
    textColor: "{colors.accent-sage}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  chip-inactive:
    backgroundColor: "{colors.bg-surface}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
---

# Locus Design System Specification

## Overview

Locus (ReflectAI) is a sanctuary for thinking — a private, unhurried space for reflection, sensemaking, and longitudinal insight. The design rejects enterprise dashboard clutter, gamified pressure (streaks, badges, urgency prompts), and technical plumbing. Every interaction embodies three core pillars:
- **Calm**: Low cognitive load, generous whitespace, quiet chrome, and subtle feedback.
- **Personal**: Physical journal warmth, editorial serif typography for user prose, and unhurried layouts.
- **Trustworthy**: Honest privacy boundaries, absolute user isolation, and complete anti-leakage of backend or vendor mechanics.

---

## Colors

The palette is intentionally restrained. A single botanical green (`accent-sage`) is reserved strictly for action and selection:

| Token | Value | Role & Usage |
|---|---|---|
| `bg-canvas` | `#FAF9F6` | Main application canvas. Warm, natural off-white. |
| `bg-surface` | `#FFFFFF` | Cards, panels, modal dialogs, and slide-overs. |
| `accent-sage` | `#3B7A57` | **The Single Accent**: Primary action buttons, active toggles, selected chips. |
| `accent-sage-tint` | `#DCEEE3` | Background fill for selected filter chips and soft highlights. |
| `text-primary` | `#232323` | Deep ink for headers, user reflection text, and primary labels. |
| `text-muted` | `#6B6B6B` | Secondary metadata, timestamps, input placeholders. |
| `border-hairline` | `#E6E3DC` | Delicate dividers, card outlines, subtle framing. |
| `bg-inverse` | `#1C1C1C` | High-emphasis accent quotes or deep focus elements only. |

> [!IMPORTANT]
> **The Rule of One Accent**: `#3B7A57` appears **only** on elements the user can act on or has selected. If two unrelated elements on screen are accent-colored, one is wrong.

---

## Typography

A strict division of labor between two distinct typefaces:

- **Source Serif 4 (The User's Voice)**: Applied to everything that represents the user's authentic thoughts — entry titles, reflection message bubbles, saved quotes, and personal notes.
- **Inter (The Interface Voice)**: Applied to application chrome, navigation, buttons, AI responses, metadata, and controls.

### Type Scale
- **Display / Entry Title**: `28px` Serif, regular weight (`400`), `1.25` line height.
- **Section Heading**: `18px` Sans, medium (`500`), `1.4` line height.
- **Body (Interface)**: `15px` Sans, regular (`400`), `1.5` line height. Max 80 characters per line.
- **Journal Prose**: `16px` Serif, regular (`400`), `1.6` line height.
- **Caption / Metadata**: `13px` Sans, muted tone (`#6B6B6B`).

---

## Layout & Screen Wireframes

### 1. Reflections Home Screen (`/`)
- **Top Navigation Bar**: Minimal logo, search trigger, navigation links (`Reflections`, `Themes`), avatar menu (`Settings`, `Sign Out`).
- **Hero Strip (Dismissible)**: A calm top card highlighting the latest ready Theme:
  > *"Theme ready to unpack: Creative Crossroads — 3 observations synthesized over 2 weeks."* `[Unpack Further] [Dismiss]`
- **Ready for Synthesis Drawer / Section**: A collapsible horizontal ribbon or card listing all Themes with $\ge 2$ Observations. Users can click to trigger an Unpack session or dismiss the ribbon.
- **Reflections Grid**: Responsive 2-column or 3-column card layout:
  - Each card shows: Entry Title (Serif), creation date, reading duration, mood chip, status badge (`Active` / `Concluded`).
  - Single primary action: `+ Start Entry` pinned cleanly in the upper action bar.

### 2. Active Reflection Session Workspace (`/entry/:id`)
- **Top Bar**: Entry title, subtle location toggle (Google Maps reverse geocoding opt-in), 2-hour auto-conclude timer hint (`Auto-concludes in 1h 45m`), and the primary `Conclude Entry` button.
- **Distraction-Free Chat Stream**:
  - **User Turns**: Soft neutral gray bubble (`#F2EFEB`), rendered in Source Serif 4.
  - **AI Turns**: Clean white surface (`#FFFFFF`), rendered in Inter.
  - **Inline Hover Toolbar**: On message hover, a floating icon strip reveals:
    - **Pin** (toggles `isPinned` state with visual pin icon).
    - **Add Note** (opens lightweight inline popover to attach thoughts).
    - **Copy** (copies turn text to clipboard).
- **Collapsible Entry Toolbar**: Compact single-line trigger: `Mood: Focused · Stance: Mindful Unpack ▾`. Clicking opens a popover chip picker.
- **Composer Strip**: Expanding textarea, `Cmd+Enter` hint, and single primary `Send` button.

### 3. Themes View (`/themes`)
- **Header & View Toggle**: Top segmented pill: `[ Timeline ]  [ Concept Graph ]`.
- **Mode A: Split Master-Detail View (Default)**:
  - **Left Rail (35%)**: Searchable list of Themes sorted by activity. Each card displays: Theme title, observation badge count (e.g. `4 observations`), and last touchpoint date.
  - **Right Canvas (65%)**:
    - **Dossier Header**: Theme title, rolling 2–3 sentence `currentSynthesis`, and `Unpack Further` CTA.
    - **Chronological Observation Timeline**: Chronological progress feed. Each observation node displays: date, specific perspective delta, and a direct clickable backlink to the source Entry.
- **Mode B: Interactive Concept Graph View**:
  - Force-directed network graph.
  - **Theme Nodes**: Scaled proportionally to observation density (Themes with more Observations are physically larger).
  - **Zoom Interaction**: Clicking a Theme node smoothly zooms in, expanding satellite Observation nodes connected to the central Theme hub.

### 4. Settings Drawer (`/settings`)
- Left tabbed navigation:
  - **Persona & Tone**: Presets (`Warm`, `Direct`, `Reflective`, `Mindful`) + Custom Instructions textarea.
  - **Integrations**: Zapier incoming webhook URL input (with inline SSRF validation feedback) and Email dispatch preferences.
  - **Dev Tooling (Admin Gated)**: Unlocks only when `role == 'admin'` in Firestore. Two seed buttons: `Run Live Synthesis Demo` and `Load Pre-baked Theme Dataset`.

---

## Elevation & Depth

Locus avoids heavy drop shadows in favor of editorial paper planes:
- **Level 0 (Canvas)**: `#FAF9F6` base surface.
- **Level 1 (Cards & Feed Surfaces)**: `#FFFFFF` with a `1px` solid `#E6E3DC` border.
- **Level 2 (Dropdowns & Popovers)**: `#FFFFFF`, `1px` border, soft subtle ambient shadow: `0 4px 16px rgba(0, 0, 0, 0.05)`.
- **Level 3 (Modals & Drawers)**: `#FFFFFF`, `1px` border, `0 12px 32px rgba(0, 0, 0, 0.08)` with a 20% dark neutral backdrop blur.

---

## Shapes

- Small utility elements (buttons, inputs): `rounded-md` (`6px`).
- Content cards & workspace panels: `rounded-lg` (`10px` to `12px`).
- Filter chips & category tags: `rounded-full` (`9999px`).

---

## Components

1. **Buttons**:
   - `Primary`: Filled `accent-sage` (`#3B7A57`), white text, bold yet quiet. Max one primary button visible per screen.
   - `Secondary`: Outlined `border-hairline` with `text-primary` and hover state of `#F5F3ED`.
   - `Tertiary`: Icon-only, 0 border, hover reveal for atomic message actions.
2. **Status Badges vs. Action Chips**:
   - Status indicators use a small bullet/icon + plain label.
   - Action chips use rounded-full pill styling (`accent-sage-tint` for active, white/border for inactive).
3. **Toasts**:
   - Match action verbs: `Save` ➔ `Saved`; `Conclude` ➔ `Synthesized`. Displayed at bottom-center with auto-fade after 3 seconds.

---

## Do's and Don'ts

### Do
- Do use Source Serif 4 exclusively for the user's authentic reflections and quotes.
- Do keep chrome minimal; let whitespace frame the entry dialogue.
- Do use progressive disclosure for secondary controls (mood, stance, location).
- Do keep Theme Observations immutable — they are the historical ledger of growth.

### Don't
- ❌ **Never leak backend or vendor names**: No "Firestore", "Gemini", "Google Cloud", or "Vector KNN" in UI copy.
- ❌ **No gamification or streaks**: Never add streaks, points, level-ups, or urgency badges ("Don't break your streak!").
- ❌ **No competing accents**: Never place two different colored buttons on screen competing for primary focus.
- ❌ **No multiple taxonomies**: Category filters in the sidebar/navigation are the single source of truth; never duplicate category assignment dropdowns.
