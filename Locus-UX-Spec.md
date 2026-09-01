# Locus — UX Redesign Spec

## 1. Critique of Current Design

**Backend leaking into the UI.** "PAST ENTRIES • FIRESTORE," "Saved to user Firestore," "Auto-persisted to Firestore," and "Send to Gemini" all expose implementation details. Users don't need to know your database or model vendor — it breaks the product's own brand voice and adds noise for zero benefit.

**Two taxonomies for one concept.** The sidebar filter tabs (All / Personal / Work / Ideas / Gratitude / Goals) and the entry's own "Personal" dropdown both categorize the same entry. Redundant controls force the user to reconcile two mental models.

**Eleven pill buttons fighting for attention.** The mood row (7 chips) and AI Stance row (4 chips) sit permanently open, styled almost identically to each other and to the status badges above them ("Saved & Isolated," "Executive Summary"). Nothing signals which control is primary vs. secondary vs. status-only.

**Dark bubble = accidental focal point.** The user's message uses the same near-black fill as the "+ New" button, pulling the eye toward a static message instead of the actual next action.

**Triple redundancy in the composer.** "Auto-persisted to Firestore," the Cmd+Enter hint, and "Send to Gemini" are three separate footnotes in one small strip.

Net effect: high chrome-to-content ratio, no clear visual hierarchy, and technical exposure that undermines trust in a *reflection* tool meant to feel calm.

## 2. Guiding Principles

1. **One accent color, reserved for action.** Everything else neutral (gray/white/ink).
2. **Progressive disclosure.** Show pickers on demand, not permanently open.
3. **Hide the plumbing.** No database or model names in user-facing copy.
4. **One taxonomy.** Pick tabs *or* dropdown, not both.
5. **Calm surface, quiet chrome.** Generous whitespace, thin dividers only between true sections.

## 3. Component-Level Redesign

### Header
- Keep: logo, search, single primary action.
- Replace "Pattern Synthesis" top-nav button with a segmented `Timeline / Patterns` toggle, or fold it into the new Notebook (see §5 — Patterns pairs naturally with saved items).
- Avatar menu gains: **Settings**, **Notebook**, **Sign out**.

### Sidebar
- Rename "PAST ENTRIES • FIRESTORE" → **"Past Entries."**
- Keep the filter tabs as the single source of category truth. Drop the per-entry "Personal" dropdown down to a small colored tag chip next to the entry title (editable via pencil icon, not a full dropdown control).

### Entry Toolbar (mood + AI stance)
Collapse both rows into a single line that expands on click:

`Mood: Focused · Stance: Mindful Unpack ▾`

Clicking opens a compact popover with the same chip grid you have now. This alone removes 11 always-visible buttons down to one line, restoring most of the vertical space.

### Status Badges
Convert "Saved & Isolated" and "Executive Summary" into two small icon-only buttons (bookmark icon, doc-summary icon) with tooltips, right-aligned, visually distinct (outlined, muted) from the mood/stance control so users don't mistake status toggles for content controls.

### Chat Thread
- User bubble → light neutral gray, not black. Reserve dark/accent fill for the Send button only.
- Remove the per-message "Saved to Firestore" caption. Replace with one global, subtle "All changes saved" indicator near the header (updates silently).
- Add a hover-reveal icon row per AI message: **Save to Notebook · Copy · Regenerate** — icons only, no persistent text.

### Composer
- One hint line: `Cmd+Enter to send`. Drop the Firestore mention.
- Rename **"Send to Gemini" → "Send."** If multi-model choice is actually a feature, expose it as a small model-picker icon next to Send rather than baking the vendor name into the CTA.

## 4. New Feature: Settings Panel

**Entry point:** gear icon in the avatar menu → slide-over panel, left-hand tabs.

| Tab | Contents |
|---|---|
| **AI Persona & Tone** | System-prompt / custom-instructions textarea; tone presets as chips (Warm, Direct, Clinical, Playful) that pre-fill the textarea; default AI Stance on new entries |
| **Tags & Categories** | Add / rename / recolor / reorder / delete the Personal-Work-Ideas-Gratitude-Goals set; this becomes the *only* place tags are edited, keeping the sidebar taxonomy in sync |
| **Notebook** | Toggle auto-context-summary on/off; default folder-naming pattern (source entry title, or custom) |
| **Model & Data** | Model selection (if applicable), export/delete data |

Standard modal pattern: Save / Cancel footer, changes apply immediately on Save.

## 5. New Feature: Notebook

**Save flow**
1. User hovers a message → clicks the bookmark icon (added in §3).
2. A lightweight popover opens with an optional "Add a note…" field and a Save button.
3. On save, the AI generates a 1–2 sentence context hint (e.g., *"Re: career uncertainty — after discussing overwhelm around the job transition."*), shown pre-filled and editable before confirming.
4. The item files automatically into a folder named after the source entry/conversation. If the folder doesn't exist yet, it's created; later saves from the same conversation append to it.

**Notebook view** (new top-level section, sidebar or header nav)
- Folder list grouped by source conversation, collapsed by default, expandable.
- Each card shows: saved excerpt, AI context hint, user's note (inline-editable), timestamp, and a link back to the original entry.
- Search/filter by folder, tag, or keyword.
- Repurpose the existing **Pattern Synthesis** feature here as a "find patterns across saved notes" view — natural fit since the Notebook is the curated, high-signal subset of everything journaled.

## 6. Visual System

- **Accent:** keep the current soft green, but use it *only* for primary CTAs, active/selected states, and the save indicator.
- **Neutrals:** everything else — borders, secondary buttons, badges — in gray/white/ink, so the eye always finds the one thing to act on.
- **Spacing:** 16–24px between logical groups (toolbar / chat / composer) instead of abutting sections separated only by 1px lines.
- **Type hierarchy:** one clear scale — bold larger for entry titles, small muted gray for metadata/timestamps, regular weight for body/chat text.
- **No vendor names** anywhere in user-facing copy (Firestore, Gemini, etc.).

## 7. Suggested Phasing

1. **Phase 1 — Declutter (no new features):** collapse mood/stance into one expandable line, remove backend labels, restyle bubbles, single global save indicator. Biggest visual win, smallest engineering lift.
2. **Phase 2 — Settings panel:** system prompt/tone + tag management.
3. **Phase 3 — Notebook:** save/note/folder/context-hint flow, plus repurposing Pattern Synthesis as its cross-folder view.
