# Locus — Integrations, Demo Tooling & Build Plan

*Design doc 2 of 2. Companion doc: `Locus — Core Object Model & Schema`.*

## Feature 1: Unpack Further

Turns an established Theme into a writing/reflection starter — the "Substack" idea, renamed to fit casual journalers rather than writers specifically.

- **Trigger:** manual CTA on a Theme's detail view, available once that Theme has **2+ Observations**.
- **Data flow:** feed the Theme's title, current synthesis, and full chronological Observation feed into Gemini. Prompt for: a working title, a one-line thesis capturing how the thinking evolved from the first Observation to the latest, and a short outline of that progression.
- **Output is a suggestion, not a save-worthy artifact by default** — shown inline, with an option to save it (ties into the Notebook feature once that's back in scope; for MVP, a simple copy/export is enough).
- **Build note:** zero external API surface — pure prompt engineering against data already collected. Lowest technical risk of the four.

## Feature 2: Location context (reverse geocoding)

- **Opt-in, per-entry** — not automatic, not a global setting. Presented as a toggle when starting an Entry.
- **No interactive map.** On toggle, pull lat/long via the browser's `navigator.geolocation`, resolve to a city/district string via the Google Maps Geocoding API, store as a single `locationContext` string attribute on Entry.
- **Usage:** passed into the Gemini session as ambient context ("the user is currently reflecting from [location]") — informs the conversation, isn't rendered as a map anywhere.
- **Why opt-in matters here specifically:** location is one of the more identifying pieces of data a journal could hold, and Security is a judging criterion — defaulting to on would cut against that.

## Feature 3: Notification dispatcher (Email + Zapier)

Discord is dropped — more integration overhead than it's worth for the timeline.

- **Zapier:** a single incoming-webhook URL field in settings. On Entry conclusion, POST a JSON payload (entry title, summary, updated Themes, any pinned insights) — Zapier/Make users route it wherever they want from there.
- **Email:** same trigger, same payload, sent via a transactional email API (e.g. Resend/SendGrid) rather than building any inbox/SMTP handling.
- **Build note:** both are synchronous fire-and-forget calls at the same point in the pipeline as the Theme extraction step — no separate batch processor.

## Feature 4: PII sanitizer + crisis protocol

- **Scope: outbound only.** A regex pass scrubs structured PII (phone numbers, emails, exact street addresses) from any content leaving the system boundary — the Gemini API call, the embedding/vector store, and any webhook/email payload.
- **Firestore keeps the raw, unredacted message.** The user's own view of their own entries is never redacted; scrubbing only applies to what's sent outward. This resolves the earlier tension between security and not degrading the user's ability to read their own past entries.
- **Crisis/self-harm protocol:** a hardened system-prompt instruction — if the user expresses severe distress or self-harm ideation, the model follows a defined de-escalation path and surfaces vetted support resources rather than continuing standard reflective/brainstorming responses. This is worth keeping exactly as scoped; it's a real safety behavior, not just a judging checkbox.

## Feature 5: Similar-thoughts surface (lightweight, scoped down from the "napkin swarm" idea)

Rather than a dedicated exploration tab with its own visualization system, this rides entirely on the vector search infrastructure Feature 4/the Theme pipeline already requires — no new nav slot, no new physics/canvas work.

- **Where it lives:** a small "you've felt this before" strip inside the Entry/Theme detail view — not a standalone screen.
- **Data flow:** on load, run a `findNearest` query against existing Entry-summary embeddings (or Message-level embeddings if that granularity gets added later), surface the top 2–3 semantically close hits from *other* entries, each shown as a short excerpt linking back to its source.
- **Explicitly out of scope for now:** the standalone "exploration tab" with an organic/swarm visualization, and Message-level embedding (current pipeline only embeds Entry summaries — finer-grained "similar sentence" matching is a real scope increase, not this). Both are worth a line in the README as acknowledged future direction, not something attempted under deadline.

## RBAC: reframing the course's "Admin Dashboard" suggestion

The course's suggested Admin Dashboard (RBAC, elevated permissions) doesn't fit this product as literally described — an admin role with read access to other users' journal entries directly contradicts the product's core privacy guarantee ("isolated strictly to this specific user"), and building it would actively work against the Security/Authenticity judging criteria rather than for them.

The legitimate RBAC need already exists elsewhere in this plan: **the dummy-data import panel.** Implement it as a real `role` field (`user` | `admin`) on the user's profile document, enforced by Firestore Security Rules, gating access to the seed-data tooling specifically — not to any other user's content. Firestore rules must explicitly deny cross-user reads of Entry/Message/Theme documents regardless of role; the admin role only unlocks the dev/demo tooling, nothing content-related. This satisfies the course's RBAC requirement with a real, defensible use case instead of an artificial one, and the README should say so explicitly — that the team considered a data-visibility admin panel and deliberately rejected it as inconsistent with the product's privacy commitment.

## Demo tooling: dummy-data import panel

For presentation purposes only — **not a real user-facing feature.** Gated by the `admin` role above (Firestore Security Rules enforced, not just hidden client-side), never reachable from the actual Settings UI a normal user sees, since an exposed "load fake data / wipe my journal" control is exactly the kind of thing that reads badly against the Security criterion.

Two import modes, both supported:
1. **Raw conversations, run live** — a batch of pre-written Entries/Messages gets pushed through the real synthesis pipeline in front of testers, demonstrating the actual extraction working end-to-end.
2. **Pre-baked dataset** — a second set where Themes and Theme Observations are already generated and stored, for instantly showing the Theme timeline / graph view without waiting on live model calls or risking a rate-limited demo.

## Build order & risk plan

Priority to protect, in order (cut from the bottom if Day 2 runs long): **Sanitizer → Unpack Further → Notification dispatcher → Geocoding.** Geocoding is the first thing to drop if time is tight; the sanitizer is the last.

| Day | Focus |
|---|---|
| 1 (half day) | OOUX draft — done |
| 2 (full day) | Core loop: Entry/Message/Theme/Observation schema, chat loop, synchronous synthesis pipeline. Layer in integrations in priority order as time allows. |
| 3 (full day) | Polish, dummy-data panel for demo, README + public showcase writeup |
| 4 (buffer) | Not to be used — treat any slide into Day 4 as a signal that scope was cut too late, not a safety net |

## Judging criteria → feature mapping

| Criterion | Addressed by |
|---|---|
| Authenticity | Theme/Observation model showing real longitudinal thought change; Unpack Further surfacing the user's own evolving thinking |
| Usability | 2-hour auto-conclude removing manual session management; pinned-message view; opt-in geocoding kept out of the way by default |
| Stability | Synchronous, dependency-light pipeline (no background workers/queues) reduces failure surface for a one-day build |
| Security | Outbound-only PII sanitization, opt-in location, crisis de-escalation protocol, dev-gated demo-data tooling |
