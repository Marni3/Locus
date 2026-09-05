# REFACTOR BRIEF — "STRATA" (formerly ReflectAI / locus-app)

You are a senior product engineer + design lead. You are refactoring an existing
React + Vite + Tailwind + Firebase (Auth, Firestore) + Gemini journaling app.
Execute this brief in the order given. Do not skip the anti-slop constraints.
Do not ask for a "vibe" — the design direction is already decided below.

---

## 0. WHAT THE PRODUCT BECOMES

Current product: an AI chat that reflects back at the user, then summarizes.
That is a crowded category (Rosebud, Mindsera, Reflectly, Reflection.app).

New product: **a journal whose core loop is RETURNING to your own words.**

The single sentence positioning:

> Strata is a journal where nothing is edited and nothing is deleted — you write
> in the margins of your own past, and the app's only job is to hand you the one
> page that deserves your handwriting today.

The AI is **demoted from author to archivist.** It does not tell the user who
they are. It decides *which of the user's own sentences they should be reading
right now*, and it stays silent otherwise.

---

## 1. THE NOVELTY — FIVE PAPER MECHANICS NO JOURNALING APP SHIPS

These are all real, centuries-old paper-journal practices. None of them exist in
Rosebud, Mindsera, Reflectly, Day One, or Reflection.app. Build all five. #1 and
#2 are the flagship; ship them first.

### 1.1 STRATA — the palimpsest / margin layer  ★ FLAGSHIP

**The paper practice:** marginalia — readers annotate a page, then re-annotate on
later re-reads, building layers of response over years. Explanatory marginalia is
deliberately written "for a future reader, often yourself in five years."

**Why no app does it:** every digital journal treats an entry as a mutable
document (edit history hidden) or an immutable log (append-only, never revisited).
Neither creates *strata*.

**Build this:**

- An entry body becomes **immutable at first save.** There is no edit button on
  the body. Ever. This is a product promise, not a limitation — surface it as
  "the page is set."
- Every entry has a **margin column** (right side on desktop ≥1024px, an
  inline-expandable gutter on mobile).
- The user can attach a margin note to **any text selection** in the body, or to
  the entry as a whole.
- Every margin note is stamped with **temporal distance, not a date**:
  `written 94 days later`, `written 2 years, 1 month later`. The distance IS the
  content. Render this stamp in the mono face (Courier Prime), right-aligned,
  small caps tracking.
- Margin notes can be annotated themselves → **depth 2**. A note on a note on an
  entry. Cap at depth 3. Render depth by indentation into the gutter + a
  progressively shorter left rule, never by nesting cards.
- **Stratum count** is the entry's most important metadata — shown before word
  count, before mood, before tags. An entry with 6 strata across 3 years is the
  most valuable object in the app.
- Data model:

```ts
// Firestore: users/{uid}/entries/{entryId}
type Entry = {
  id: string
  bodyMarkdown: string        // IMMUTABLE after create
  bodySealedAt: Timestamp     // proof of immutability
  bodyHash: string            // sha-256 of bodyMarkdown, server-computed
  heads: string[]             // see 1.4 The Index
  openThreads: Thread[]       // see 1.3 Migration
  stratumCount: number        // denormalised, server-maintained
  lastReturnedAt: Timestamp | null
  returnCount: number
  createdAt: Timestamp
}

// Firestore: users/{uid}/entries/{entryId}/strata/{stratumId}
type Stratum = {
  id: string
  parentStratumId: string | null   // null = annotates the entry body
  anchor: { startOffset: number; endOffset: number; quotedText: string } | null
  bodyMarkdown: string             // also immutable once sealed
  depth: 1 | 2 | 3
  daysLater: number                // server-computed, never client-trusted
  stance: 'correction' | 'confirmation' | 'question' | 'grief' | 'gratitude'
  sealedAt: Timestamp
}
```

- **Stance colours are semantic ink types, not brand colours:**
  `correction` → vermilion (historically red correction ink),
  `confirmation` → moss, `question` → iron-gall blue-black,
  `grief`/`gratitude` → ink at reduced weight. See §3 palette.
- Anchored strata render a **vermilion hairline underline** under the quoted span
  in the body with a small margin-side connector rule (a real 1px line, not a
  glow, not a highlight fill).

### 1.2 THE RETURN — AI as archivist, one page a day  ★ FLAGSHIP

**The paper practice:** re-reading old journals is the most reported source of
value by journalers — perspective, spotting recurring themes you were too close
to see, self-compassion. Nobody does it, because a shoebox of notebooks has no
index and no prompt to open it.

**Why no app does it:** every competitor's AI generates *new* text about you
(summaries, insights, weekly reports). Strata's AI generates almost no prose. It
performs **retrieval and routing.**

**Build this:**

- One screen, once a day: **The Return.** It shows exactly ONE past entry,
  full-bleed, unmodified, in reading typography. Nothing else. No sidebar, no
  nav, no metrics.
- Above it, one line of provenance in mono: `written 1 year, 4 days ago · 2 strata`
- Below it, exactly one affordance: **"Write in the margin."** Plus a quiet
  "Not today" that costs nothing.
- **Selection is server-side and explainable.** Never a black box. The server
  returns a `returnReason` enum + the evidence, and the UI shows it in one
  sentence in mono:
  - `anniversary` — "one year ago today"
  - `unresolved` — "you left a thread open here and never closed it"
  - `contradiction` — "a later entry says the opposite of this"
  - `recurrence` — "the fourth entry filed under the same head"
  - `dormant` — "you have not read this in 11 months"
  - `pre_decision` — "written the week before a decision you later reversed"
- **The `contradiction` router is the differentiator.** Compute embeddings for
  each entry (server-side, stored in Firestore or a vector index). Surface pairs
  that are topically near (cosine ≥ 0.78 on the same head) but stance-divergent.
  Present it with zero interpretation:

  > You wrote this in March. In September you wrote something that disagrees.
  > Both are yours. [Read the other one]

  The AI must NOT resolve the contradiction, name a "pattern," diagnose growth,
  or congratulate the user. It places two of the user's own pages side by side
  and stops. This is the hardest instruction in the codebase — enforce it in the
  system prompt AND in an output validator that rejects any response containing
  interpretive verbs ("this suggests", "you tend to", "your pattern of").
- The Return is the app's **home screen** for any user with ≥14 days of history.
  New users see the composer.
- Ship a strict daily cadence: **one Return per day, no infinite scroll.** If
  they want more, they must open the Index deliberately. Scarcity is the feature.

### 1.3 MIGRATION — friction as a filter

**The paper practice:** Bullet Journal migration. At month end you must
*physically rewrite* every open task/thread into the new month. "If an entry
isn't worth the few seconds of effort required to rewrite it, then it's probably
not that important." Guilt converts to curiosity.

**Why no app does it:** software's entire instinct is to auto-carry-forward
forever, which is why digital task lists and journals rot into infinite backlogs.

**Build this:**

- When concluding an entry, the user may mark **open threads** — a short line of
  their own words, not an AI-extracted tag.
- At month end, a **Migration** screen lists every open thread. For each one the
  user must do exactly one of:
  - **Rewrite it by hand to carry it forward.** The old text is shown greyed;
    the input starts EMPTY. Copy/paste is disabled on this field. Retyping is the
    point.
  - **Strike it.** It stays in the archive with a strikethrough rule and a
    `struck` stamp. Never deleted.
  - **Promote it to a head** (see 1.4) if it has recurred 3+ months.
- Show the honest ledger in mono: `14 threads · 3 rewritten · 9 struck · 2 promoted`.
- **Never auto-migrate. Never nag. No badge counts, no red dots.** Migration is
  available for 7 days at month end and then closes. A missed migration means
  those threads are struck by default, with a plain-language note saying so
  before the window closes.

### 1.4 THE INDEX — Locke's head index, built by the human

**The paper practice:** John Locke's commonplace-book method (1685) — the writer
chooses a "Head", an essential word for the matter at hand, and files the entry
under it. The index is authored, not generated.

**Why no app does it:** every app auto-tags with AI, which produces plausible,
forgettable, and un-owned taxonomies.

**Build this:**

- The user assigns **1–2 heads maximum** per entry, typed by hand, from their own
  vocabulary. Hard cap. Scarcity forces meaning.
- Autocomplete may only suggest **heads the user has already created.** The AI
  may never invent a head. It may, once a head has 5+ entries, ask a single
  question: *"Should this be one head or two?"* — and accept "leave it" as a
  first-class answer.
- The Index screen is a **typographic index page**, not a tag cloud: a two-column
  ruled list, heads set in small caps, entry counts in mono, sorted
  alphabetically, with an optional density column (a sparkline is banned — use a
  row of thin vertical rules, one per entry, positioned by date).
- Heads are renameable and mergeable, and every rename is recorded as a stratum
  on the index itself. The taxonomy has its own history.

### 1.5 SEALED ENTRIES & THE DIALOGUE

Two smaller mechanics, both from established therapeutic-writing practice.

**Sealed (the unsent letter).** Letter-writing therapy from Gestalt and narrative
therapy: write to a person, a place, an illness, a fear — and never send it. The
ritual of what you do with it afterwards matters more than the method.
- A `sealed` entry is written to a named recipient (person, concept, past self,
  body, a project).
- It is **excluded from AI processing entirely** — not sanitized, not embedded,
  not summarized, never selected for The Return. Sealed means sealed. Show this
  as a lock state in the UI with plain copy: "This page is not read by anything."
- Optional **release ritual**: the user may choose `keep sealed`, `burn`, or
  `release in N days`. `burn` performs a real cryptographic destruction —
  overwrite the field, delete the doc, keep only a tombstone with the date and
  recipient. Render burn as a slow 1200ms paper-ash dissolve of the text only
  (respect `prefers-reduced-motion`: instant fade + text confirmation instead).
- The 3-letter variant as a guided sequence, 24h apart: raw → refined →
  written-from-the-other-side. Enforce the 24h gap; do not let the user rush it.

**Dialogue (Progoff's Dialogue Dimension).** The Intensive Journal Method has the
writer enter a written dialogue with a facet of their life — a relationship, the
body, a work project, an inner-wisdom figure — by "walking in the shoes" of the
other and letting it answer in their own handwriting.
- The user picks a **subject**: a person, their body, a project, an emotion, or a
  wiser future self.
- The screen is a **two-column ledger**. Left column: the user speaks. Right
  column: **the user also writes the reply.** The AI does NOT play the other
  voice. That is the entire ethical point and the entire novelty — the app
  refuses to impersonate the user's mother, their grief, or their body.
- The AI's only contribution: when a dialogue stalls for 90 seconds it may place
  ONE mono-set question in the gutter, e.g. `what has it not been asked?` — and
  it never speaks again in that session.

---

## 2. ANTI-SLOP CONSTRAINTS (HARD FAILS)

Treat every item as a build-breaking failure. The generic AI-generated UI look is
a documented anti-pattern set: purple/indigo gradients, Inter headlines,
cardocalypse, glassmorphism, glow, neon, three-boxes-with-icons, rounded lucide
icon above every heading, timid palettes, pure #fff/#000, gradient-on-a-big-number
hero metrics.

**Banned outright:**

1. **No emoji.** Anywhere. Not in UI, not in empty states, not in mood pickers,
   not in copy, not in commit messages, not in seed data.
2. **No icon library as decoration.** Remove lucide/heroicons/feather from
   decorative use. Icons are permitted only where an icon is genuinely faster
   than a word, capped at **six glyphs total for the whole app**, each custom-
   drawn as a 1px-stroke SVG on a 16px grid, all in the same optical weight:
   margin-note, seal, migrate, index, return, close. Everything else is a word.
   No icon above any heading, ever.
3. **No glow, no neon, no bloom, no `box-shadow` with a colour, no
   `filter: drop-shadow` for emphasis, no glassmorphism, no `backdrop-blur`
   except on a single modal scrim at 2px.**
4. **No glowing/gradient badges, no pill-shaped status chips with saturated
   fills, no notification dots, no streak counters, no confetti, no trophies,
   no gamification of any kind.** Status is text, set in mono, at 12px, with
   tracking. `struck` not a red pill. `sealed` not a lock badge.
5. **No Inter, Roboto, Open Sans, Poppins, Geist, Montserrat, Nunito, DM Sans,
   or system-ui as a display or body face.** These read as machine-made default.
6. **No purple, indigo, violet, cyan, or teal anywhere in the palette.** No
   gradients of any kind, including "subtle" ones. Flat ink on flat paper.
7. **No cards.** Delete the card component. Separate content with, in this
   order: whitespace → a 3–5% background lightness shift → a single hairline
   rule. A border is a last resort and is never a flat neutral grey box.
8. **No `border-radius` above 3px** except on the avatar (full round) and the
   one primary button (2px). Paper has corners.
9. **No spinners.** Loading is a text state in mono: `retrieving…`. No skeleton
   shimmer animations. If content must be pending, show a ruled empty measure.
10. **No AI-voice microcopy.** Ban this register: "Let's dive in!", "Great job!",
    "Here are some insights for you", "I noticed that you…", "Remember, you've
    got this", any sentence beginning "It sounds like". Ban the em-dash-heavy
    "not just X, but Y" construction. Ban exclamation marks in product copy
    entirely. Copy is plain, declarative, and short: "The page is set."
    "Nothing reads this." "Nine threads struck."
11. **No three-column feature grid, no centred hero with a CTA button, no
    testimonial row, no big-number metric hero.**
12. **No dark mode as a reflex** — but DO ship it (§3.4), because journaling
    happens at night. It must be a designed second palette, not an inverted one.
13. **No `text-stone-400`, no `#a8a29e` on light backgrounds, no 1.22-contrast
    hairlines carrying meaning.** (These are current, measured failures.)

**Purpose test — every UI decision must answer one of these or be deleted:**
- Does it make the user's own words more readable?
- Does it make temporal distance legible?
- Does it reduce the cost of returning?
- Does it prove a privacy promise?

If a decision answers none of the four, remove it.

---

## 3. THE DESIGN SYSTEM — "ARCHIVAL"

Direction: **a working archive.** Ledger paper, iron-gall ink, correction
vermilion, letterpress rules, mono date stamps. Not "wellness". Not "minimal
SaaS". Not skeuomorphic paper texture either — no drop-shadowed page images, no
faux torn edges, no leather. The *structure* is archival; the execution is flat
and typographic.

### 3.1 Palette — three hues, capped

Colours are **ink types with semantic jobs**, not brand decoration. All values
below are measured against WCAG 2.1 AA.

```css
:root {
  /* substrate */
  --paper:            #F2EFE7;  /* app background */
  --paper-deep:       #EAE6DC;  /* recessed: margin gutter, index rules */
  --leaf:             #FBF9F4;  /* the reading measure only */

  /* ink — the user's voice */
  --ink:              #191813;  /* body text            15.5:1 on paper  AA */
  --ink-secondary:    #3D3A31;  /* headings, labels      9.9:1 on paper  AA */
  --ink-muted:        #5A5648;  /* metadata              6.4:1 on paper  AA */
  --ink-faint:        #6E6A5A;  /* least-important       4.7:1 on paper  AA
                                   NOT permitted on --paper-deep (4.35) */

  /* iron gall — the archivist's voice (AI). used ONLY for machine output */
  --irongall:         #2C3A4F;  /*                      10.0:1 on paper  AA */

  /* vermilion — correction, contradiction, anchored strata */
  --vermilion:        #8A3A22;  /*                       6.8:1 on paper  AA */

  /* moss — confirmation, resolved, migrated-forward */
  --moss:             #3B5540;  /*                       7.1:1 on paper  AA */

  /* rules — NON-TEXT ONLY, never the sole carrier of meaning */
  --rule:             #CFC9BA;  /* 1.44:1 — decorative separation only */
  --rule-strong:      #B3AC99;  /* 1.97:1 — still non-text; pair with a label */
}
```

Rules that carry state (a selected row, an input boundary, an error) must be
paired with a text label or an `--ink-muted`-or-darker rule at ≥3:1. Never rely
on `--rule` alone.

Hard cap: **three hues** (irongall, vermilion, moss) plus the neutral ink/paper
ramp. No fourth hue may be introduced for any reason.

### 3.2 Typography — four faces, each with a job

No Inter. Each face is doing work no other face can do.

```css
/* Literata — variable, optical sizes 8–60, built for continuous digital reading,
   OFL. THE USER'S OWN WORDS. This is the most important face in the product. */
--font-leaf: 'Literata', 'Iowan Old Style', Georgia, serif;

/* Newsreader — Production Type, for continuous on-screen reading in
   content-rich environments. Its italic is exceptional. USED FOR: quoted
   fragments in the margin, the anchor quote, pull-quotes on The Return. */
--font-quote: 'Newsreader', 'Literata', Georgia, serif;

/* Archivo — grotesque with real character, wide weight range.
   UI ONLY: buttons, nav, form labels, section heads (small caps + tracking). */
--font-ui: 'Archivo', 'Helvetica Neue', sans-serif;

/* Courier Prime — screenplay-grade typewriter mono. ARCHIVAL METADATA ONLY:
   temporal stamps, stratum counts, return reasons, ledgers, status words.
   This is what makes the app read as an archive instead of an app. */
--font-stamp: 'Courier Prime', 'IBM Plex Mono', monospace;
```

- **Reading measure:** body text at `18px/1.72`, measure locked to **62–68
  characters** via `max-width: 34rem`. On The Return, `20px/1.78`.
- **Scale:** one editorial ratio, ×1.333, on an 8pt grid.
  `12 / 14 / 16 / 18 / 24 / 32 / 42`. No arbitrary values. No `13px`.
- **Optical sizing:** enable `font-optical-sizing: auto` and set Literata's
  `opsz` explicitly — `opsz 12` for metadata, `opsz 18` body, `opsz 42` display.
  This is the whole reason Literata was chosen; do not ship it unused.
- **Hierarchy by weight and case, not by size jumps.** Section heads are
  `--font-ui` 12px, `font-weight: 600`, `letter-spacing: 0.08em`, uppercase.
- **Numerals:** `font-variant-numeric: tabular-nums` on every count, date, and
  ledger. Stratum counts must align in a column.
- **Never** set the user's own words in `--font-ui`. Never set machine metadata
  in `--font-leaf`. The face signals *who is speaking*, and that signal must
  never be violated.

### 3.3 Layout, rules, motion

- **8pt grid.** Every spacing value is a multiple of 8, with 4 as the only
  half-step. Proximity carries meaning: intra-component < inter-component <
  inter-section.
- **The margin is structural, not a panel.** On ≥1024px: a `1fr 34rem 18rem`
  grid — dead space, reading measure, margin gutter. The gutter has
  `--paper-deep` background and a single `--rule` on its left edge. On <1024px
  the gutter collapses to inline strata, each preceded by a 24px vermilion rule.
- **Letterpress rules instead of boxes.** A section is a `1px --rule` above it
  and 32px of air below it. That is the entire chrome.
- **Motion budget: one orchestrated transition per screen, 180–260ms,
  `cubic-bezier(0.2, 0, 0.15, 1)`.** Permitted: opacity, and transform on a
  single axis ≤8px. Banned: elastic/spring easing, scale bounces, stagger
  cascades over 3 items, parallax, anything looping, anything on hover beyond a
  colour change.
- `@media (prefers-reduced-motion: reduce)` must set `animation: none` and
  `transition-duration: 1ms` globally, and must disable the ash-dissolve, the
  Return page-turn, and all graph physics. **This is currently entirely absent
  from the codebase and is a hard fail.**
- The one exception where motion earns its place: the **Return page-turn** — a
  200ms opacity+2px-Y reveal of the past entry. Nothing else animates on that
  screen.

### 3.4 Night palette (deliberate, not inverted)

```css
@media (prefers-color-scheme: dark) {
  :root {
    --paper: #16150F; --paper-deep: #12110C; --leaf: #1F1E16;
    --ink: #EDE9DD;            /* 15.1:1  AA */
    --ink-secondary: #BDB8A7;  /*  9.2:1  AA */
    --ink-muted: #9C9686;      /*  6.2:1  AA */
    --irongall: #9FB6D4;       /*  8.8:1  AA */
    --vermilion: #E39A80;      /*  8.0:1  AA */
    --moss: #8FBF9E;           /*  8.8:1  AA */
    --rule: #37352B;           /*  non-text only */
  }
}
```
Also expose a manual override (`auto | day | night`) persisted per user, because
journaling at 2am should not depend on OS settings.

---

## 4. ACCESSIBILITY — FIX THE MEASURED FAILURES

These are audited defects in the current build. Each must be closed and covered
by a test.

1. **Contrast.** Replace every `text-stone-400` (2.40:1 — fail) and
   `text-stone-500` (4.56:1 — marginal) usage with `--ink-muted` (6.4:1) or
   `--ink-faint` (4.7:1, and only on `--paper`/`--leaf`). Replace sage-on-sage-tint
   (4.23:1 — fail for normal text) with `--moss` on `--paper`. Add a CI script
   that parses the built CSS, computes every text/background pair, and fails the
   build below 4.5:1 for normal text and 3:1 for large/bold.
2. **Focus.** A visible `:focus-visible` ring on every interactive element:
   `outline: 2px solid var(--irongall); outline-offset: 2px;`. No glow, no box-shadow
   ring. Never `outline: none` without a replacement. Verify full keyboard
   traversal of composer → margin → Return → Migration → Index.
3. **Accessible names.** Every one of the six permitted icon buttons gets a real
   `aria-label` plus a visible text label at ≥768px. `title` attributes are not
   an accessible name — remove reliance on them (current
   `title="Delete category"` pattern).
4. **Dialogs.** Migration, seal, burn-confirm, and settings become
   `role="dialog"` `aria-modal="true"` with an `aria-labelledby` title, focus
   trap, Escape to close, focus restoration to the trigger, and
   `inert` on the background.
5. **Live regions.** Save/sync status is an `aria-live="polite"` region.
   Errors are `role="alert"`. Errors must never auto-dismiss (the current
   toast-only error pattern is wrong for a failed save on a private journal).
6. **Targets.** 44×44 CSS px minimum for every control, including margin-note
   affordances on touch.
7. **Zoom + reflow.** No horizontal scroll and no content loss at 200% and 400%
   zoom, and at 320px width. The margin gutter must collapse, not clip.
8. **Selection-anchored strata must be operable without a mouse:** provide a
   keyboard path (focus a paragraph → `M` → choose a sentence from a list) since
   text-range selection is not reliably keyboard-accessible.
9. **Screen-reader semantics for strata:** each stratum is an `<aside>` inside an
   `<article>`, with a visually-hidden preamble read as
   "margin note, 94 days later, correction, annotating the phrase …".
10. **Test matrix:** axe-core in CI, plus manual passes on VoiceOver/Safari,
    TalkBack/Chrome, NVDA/Firefox. Target WCAG 2.2 AA.

---

## 5. FUNCTIONALITY — FIX AND ADD

### 5.1 Fix these audited defects first (they block trust)

1. **Delete every fabricated fallback.** The client currently generates a thesis
   and narrative from string templates when theme-unpack fails
   (`"A recurrent developmental arc spanning N reflections…"`) and slices the last
   160 characters of an AI message as a "summary" when conclude fails, then
   presents both as genuine synthesis. Remove all of it. On failure, show:
   `synthesis unavailable · retry` in mono. Never simulate insight.
2. **Persistent sync state.** Replace toast-only errors with a permanent status
   line in the composer chrome: `set` / `writing…` / `unsaved — offline` /
   `failed — retry`. Back it with an IndexedDB outbox, debounced writes,
   exponential-backoff retry, and a `beforeunload` guard while dirty.
3. **Kill or disclose the 2-hour session expiry.** Sessions currently
   auto-conclude after 7,200,000ms of inactivity with no warning. Under the new
   model there are no timed sessions at all — an entry is sealed by an explicit
   act. Delete `lb = 7200 * 1e3`, `_H()`, `DH()`, and the countdown badge.
4. **Server-side identity.** Stop sending `userId` / `userEmail` / whole entry
   objects in request bodies. Attach `Authorization: Bearer <Firebase ID token>`,
   verify with Admin SDK, derive `uid` from verified claims, ignore all
   client-supplied identity, and enforce object ownership on every
   `/api/entries/:id/*`, `/api/strata/*`, `/api/themes/:id/*` route. Return 401
   vs 403 correctly. Add negative tests: user A cannot read/annotate/seal/burn/
   migrate/export any object of user B.
5. **Firestore rules + emulator tests** requiring `request.auth.uid == uid`,
   immutability of `bodyMarkdown` / `bodyHash` / `sealedAt` after create,
   field-type and size caps, and default-deny on unlisted paths.
6. **Security headers:** CSP (no `unsafe-inline`), HSTS, `X-Content-Type-Options`,
   `frame-ancestors 'none'`, `Referrer-Policy: strict-origin-when-cross-origin`,
   `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`.
7. **Bundle.** Current build ships ~1.15MB of uncompressed JS in one chunk with
   `cache-control: private, max-age=0` despite hashed filenames. Route-split
   (composer / return / index / migration / dialogue / settings), lazy-load demo
   fixtures behind the demo button, enable Brotli, set hashed assets to
   `public, max-age=31536000, immutable`. Budget: ≤180KB compressed initial JS.
8. **Delete the dormant Notebook feature** (export serializes it, the app passes
   an empty array, the handler is a no-op). Its job is now done by strata.
9. Serve real `robots.txt`, `sitemap.xml`, favicon set, OG image,
   `.well-known/security.txt`; return proper 404/405 from `/api/*` instead of the
   SPA shell.

### 5.2 Add these

1. **Voice capture** — the single biggest functional gap versus Rosebud
   (voice journaling in 20 languages) and Mindsera (voice + live call mode).
   Record → on-device or server transcription → the transcript becomes the
   immutable body, with the audio retained as an attachment the user can delete
   independently. Support Filipino, Taglish, and English.
2. **Search over your own words** — full-text plus semantic, scoped by head, date
   range, stance, and stratum count. Competitors are documented as running
   session-based memory with no cross-entry model; this is where you win.
   Results render as an index page, not chat.
3. **Offline-first.** IndexedDB as the source of truth for drafts; sync is a
   background reconciliation. A journal must work on a jeepney with no signal.
4. **Export and erasure.** Markdown-with-strata export (each stratum as a
   blockquote with its temporal stamp), plus JSON, plus verified account deletion
   that removes derived embeddings, themes, webhook logs, and tombstones.
5. **A privacy ledger screen** that states, per data category, exactly what
   leaves the device, to which processor, for what purpose, and for how long —
   and honours per-feature opt-outs (AI routing, embeddings, voice transcription,
   email digests, webhooks) independently. Replace the current absolute claim
   "Outbound Privacy Sanitizer Active" with a precise statement of what the
   regex removes (phone, email, street address) and what it cannot remove (names,
   employers, rare events, medical detail, indirect identifiers), plus an
   **outbound preview** showing the exact payload before it is sent.
6. **Safety layer.** A persistent, plain statement that this is not therapy,
   diagnosis, or emergency support; a conservative pre-generation risk classifier;
   an interruptive crisis response with Philippines-appropriate resources;
   prompt-injection resistance so journal content is always untrusted data; and a
   multilingual (English / Filipino / Taglish) safety eval suite gating release.
   Sealed entries and Dialogue are excluded from AI processing, so the classifier
   must run on the composer input path, not the retrieval path.

---

## 6. THE AI CONTRACT (enforce in code, not just in the prompt)

The archivist has exactly four permitted outputs. Anything else is a bug.

| # | Capability | Max output | Face |
|---|---|---|---|
| 1 | Select one past entry for The Return + a reason enum | 0 words of prose | — |
| 2 | State the reason from a fixed template, filled with dates/counts only | 1 sentence | mono |
| 3 | Ask one question, never twice in a session, never rhetorical | ≤14 words | irongall |
| 4 | Propose a head merge, only after 5+ entries, accepting "leave it" | 1 sentence | irongall |

**Banned in AI output, enforced by an output validator that hard-fails the
response:** "I noticed", "it sounds like", "you tend to", "your pattern of",
"this suggests", "growth", "journey", "unpack", "let's", "great", any praise, any
diagnosis, any summary of the user's character, any emoji, any exclamation mark,
any second-person generalisation about who the user is.

**All machine text renders in `--irongall`, never in `--ink`.** The user's ink and
the archive's ink are visually distinct at all times. A reader must be able to
tell, at a glance and without reading, which words are theirs.

---

## 7. BUILD ORDER

1. Design tokens + the four faces + the contrast CI script + reduced-motion.
   Delete the card component, all icons beyond the six, all glow/gradient, all
   emoji, all AI-voice copy. (This alone changes the product's read.)
2. Server-side token verification, Firestore rules, immutability of the body.
3. Strata: margin column, anchored selection, temporal stamps, depth, counts.
4. The Return: anniversary + unresolved + dormant routers.
5. The Index: hand-authored heads, index page.
6. Migration: month-end ledger, retype-to-carry, strike, promote.
7. Persistent sync state + IndexedDB outbox + offline.
8. Embeddings + the `contradiction` and `recurrence` routers.
9. Sealed entries + burn ritual + the 3-letter sequence.
10. Dialogue (two-column ledger, user writes both voices).
11. Voice capture, search, export/erasure, privacy ledger, safety layer.

## 8. DEFINITION OF DONE

- Zero emoji in the repository, including seed data and copy.
- ≤6 SVG glyphs total; no icon above any heading.
- Zero gradients; zero coloured shadows; zero `backdrop-blur` except one 2px scrim.
- Zero cards; separation is whitespace → lightness shift → hairline.
- No Inter/Roboto/Poppins/Geist/system-ui as display or body.
- All spacing on the 8pt grid; type on the 12/14/16/18/24/32/42 scale.
- Contrast CI passes: every text pair ≥4.5:1 (≥3:1 large/bold).
- `prefers-reduced-motion` disables all animation, including the ash dissolve.
- axe-core: zero violations. Keyboard: full traversal. 400% zoom: no loss.
- No API route trusts a client-supplied user ID; negative auth tests pass.
- No code path fabricates AI prose when a request fails.
- Initial JS ≤180KB compressed; hashed assets immutable-cached.
- The AI output validator rejects every banned phrase in §6.
- A stranger looking at one screenshot for three seconds can tell it was not
  generated by an LLM reaching for the average.
