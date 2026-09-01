# ReflectAI — UX Redesign Spec

## 1. Critique of Previous AI Studio Prototypes

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

Clicking opens a compact popover with the chip grid. This removes 11 always-visible buttons down to one line.

### Status Badges
Convert "Saved & Isolated" and "Executive Summary" into two small icon-only buttons with tooltips, right-aligned, visually distinct (outlined, muted).

### Chat Thread
- User bubble → light neutral gray, not black. Reserve dark/accent fill for the Send button only.
- Remove the per-message "Saved to Firestore" caption. Replace with one global, subtle "All changes saved" indicator near the header.
- Add a hover-reveal icon row per AI message: **Save to Notebook · Copy · Regenerate** — icons only, no persistent text.

### Composer
- One hint line: `Cmd+Enter to send`. Drop the Firestore mention.
- Rename **"Send to Gemini" → "Send."**

## 4. Settings Panel
**Entry point:** gear icon in the avatar menu → slide-over panel, left-hand tabs.
- **AI Persona & Tone**: System-prompt / custom-instructions textarea; tone presets as chips.
- **Tags & Categories**: Add / rename / recolor / reorder / delete category set.
- **Notebook**: Toggle auto-context-summary on/off; default folder-naming pattern.
- **Model & Data**: Model selection, export/delete data.

## 5. Notebook Feature
**Save flow**:
1. User hovers a message → clicks the bookmark icon.
2. Lightweight popover opens with optional "Add a note…" field and Save button.
3. AI generates a 1–2 sentence context hint, shown pre-filled and editable before confirming.
4. The item files automatically into a folder named after the source entry/conversation.

**Notebook view**:
- Folder list grouped by source conversation.
- Each card shows: saved excerpt, AI context hint, user's note, timestamp, and backlink.
- Repurpose **Pattern Synthesis** feature here as cross-folder insights.
