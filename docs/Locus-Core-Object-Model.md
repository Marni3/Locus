# Locus — Core Object Model & Schema

*Design doc 1 of 2. Companion doc: `Locus — Integrations, Demo Tooling & Build Plan`.*

## What Locus is

An AI journal where reflection, brainstorming, and unstructured thought get captured as episodic conversations, then automatically synthesized into persistent **Themes** — ongoing threads of thinking, project, or pattern — that accumulate observations over time. The product bet: showing someone how their thinking on something has actually shifted, using their own words, across weeks of entries.

## Object model (locked for MVP)

### Entry
The episodic, time-bound conversational session between user and AI.

- **Nucleus:** the conversation itself — a bounded dialogue captured while it happens.
- **Attributes:** `id`, `createdAt`, `concludedAt`, `status` (`active` | `concluded`), `summary` (generated on conclusion).
- **Relationships:** owns many Messages (1:N, cascade delete). N:M with Theme, through Theme Observation.
- **CTAs:** Start Entry, Send Message, Conclude Entry. No edit/delete once concluded — an Entry is an immutable historical record.
- **Lifecycle:** `active` → `concluded`, triggered either explicitly (user clicks Conclude) or automatically after **2 hours of inactivity**. Concluding freezes the transcript and fires the synthesis pipeline (below).

### Message
An atomic turn within an Entry.

- **Nucleus:** one exchange — what was said, by whom, when.
- **Attributes:** `id`, `entryId`, `role` (`user` | `ai`), `content`, `timestamp`, `isPinned` (bool), `note` (optional string).
- **Relationships:** belongs to exactly one Entry.
- **CTAs:** created implicitly via chat; Toggle Pin; Add/Edit Note.
- **Bookmarking:** pinning a message is metadata on the Message itself, not a separate object. Pinned messages surface in a dedicated filtered view (`isPinned == true`), each rendered with its parent Entry's title and timestamp for context, since a message alone is often meaningless without it.

### Theme
A persistent thread of inquiry, project, or recurring pattern, tracked across multiple entries.

- **Nucleus:** an evolving dossier, not a static tag — the thing that shows *trajectory*, not just subject matter.
- **Attributes:** `id`, `title`, `currentSynthesis` (rolling 2–3 sentence summary of where the thread currently stands), `createdAt`, `updatedAt`.
- **Relationships:** connected to many Entries through Theme Observations.
- **CTAs:** System — extract/create, update synthesis (both automatic, on Entry conclusion). User — view timeline, rename, archive. Manual merge/split is explicitly out of scope for MVP.
- **Boundary rule:** a Theme is an intellectual or creative trajectory (patterns, friction points, shifts in perspective), never a task list. If something that looks like a project surfaces as a Theme, it's tracked as "how my thinking about this project is evolving," not as tickets or completion state — Locus is not a task manager.

### Theme Observation
The discrete, immutable delta connecting one Entry to one Theme.

- **Nucleus:** what specifically shifted, was revealed, or was decided, in this one conversation, regarding this one Theme.
- **Attributes:** `id`, `entryId`, `themeId`, `observationText`, `timestamp`.
- **Relationships:** belongs to one Entry and one Theme.
- **CTAs:** system-generated on Entry conclusion only. Not user-editable — it's a historical record, same as the Entry it came from.
- **Why this exists:** without a separate, immutable Observation per touchpoint, a Theme's synthesis would overwrite itself on every update and progress would become unmeasurable — you'd only ever see the current state, never the path to it. The Observation feed *is* the progress timeline.

## Extraction / synthesis pipeline

Runs synchronously the moment an Entry transitions to `concluded` — no background workers, no queued jobs:

1. Embed the Entry's generated summary.
2. Vector search against existing Theme titles + current syntheses; retrieve the top 2–3 candidates above a similarity threshold (tune during Day 2 testing).
3. Prompt the model with the entry summary, any pinned Messages + their notes (injected as priority anchors — "the user flagged this, weight it heavily"), and the candidate Themes: for each distinct thread found in the entry (an entry can touch multiple Themes), either map to an existing Theme and write a new Observation, or propose a new Theme with an initial synthesis and Observation.
4. Write results: new/updated Theme record(s), new Theme Observation(s).

One Entry can produce zero, one, or several Observations across different Themes in a single conclusion pass — a single conversation touching work stress, a friendship, and a side project produces three separate Observations against three separate Themes, not one muddled Theme called "today."

## Deferred (not cancelled)

Notebook Item, Tag/Folder, Zone, and Persona were part of the original object inventory but are out of MVP scope for the build timeline. They're sequenced for after the core Entry → Theme loop is proven, not dropped — the earlier Notebook UX flow and the Firestore vector-search patterns already speced still apply once these come back into scope.
