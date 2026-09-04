# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary**: Reflective knowledge workers, founders, and professionals navigating complex cognitive knots, strategic crossroads, and personal burnout over days and weeks.
- **Secondary**: Casual writers and thoughtful journalers seeking deeper self-insight and pattern recognition across their unstructured reflections without manual tagging overhead.

## Product Purpose

Locus (ReflectAI) is an intelligent, calm, and private reflective space where episodic conversational sensemaking is automatically synthesized into persistent, longitudinal **Themes**. Rather than serving as an ephemeral chatbot or a static note silo, Locus captures how a person's thinking, friction points, and convictions actually shift over time using their own words.

## Positioning

Unlike traditional journaling apps (which act as passive chronological archives) or conversational AI tools (which suffer from amnesia and treat each session in isolation), Locus introduces the **Entry ➔ Theme ➔ Observation** architecture:
- Historical entries are immutable historical records.
- Themes evolve as longitudinal dossiers, accumulating discrete, dated Observations that illustrate authentic perspective shifts across weeks of dialogue.
- A Theme is an evolving trajectory of thought, never a gamified task list or productivity metric.

## Operating Context

- **Private Reflection Rituals**: Used during quiet morning planning, end-of-day decompression, or moments of intense cognitive friction/decision-making.
- **Episodic Sessions**: Time-bound conversations that naturally conclude manually or auto-conclude after **2 hours of inactivity**, firing a synchronous synthesis pipeline.
- **Zero-Pressure Environment**: Free from gamified streak counters, corporate dashboards, or unsolicited productivity advice.

## Capabilities and Constraints

- **Core Loop**: Start Entry ➔ Send Message (with inline turn Pinning and Notes) ➔ Conclude Entry (manual or 2-hour inactivity trigger).
- **Synchronous Synthesis Pipeline**: On Entry conclusion, summary embeddings query candidate Themes via Firestore Vector Search (`findNearest`), prompting Gemini to map updates, write new immutable Theme Observations, or spawn emerging Themes.
- **Unpack Further**: Theme exploration engine that triggers once a Theme accumulates 2+ Observations, synthesizing a thesis and progression outline for deep writing.
- **Location Context**: Opt-in reverse geocoding via Google Maps API; resolves coordinates to a city/district string ambiently passed to the AI session, then immediately discards raw lat/long coordinates.
- **Notification Dispatcher**: Outbound fire-and-forget webhook (Zapier/Make) with hardened SSRF protection (DNS resolution, private IP rejection, HTTPS only) and transactional email.
- **Outbound-Only PII Sanitizer**: Regex scrubber stripping phone numbers, emails, and physical addresses from text leaving the system boundary (Gemini API, embeddings, webhooks); Firestore maintains raw unredacted text for the user's personal view.
- **RBAC Scope**: Admin role strictly gates the dev-seed demo panel; cross-user journal reading is explicitly prohibited by database security rules.
- **Deferred Post-MVP**: Notebook item clipping, multi-folder taxonomies, zones, and complex persona switching.

## Brand Commitments

- **Calm**: Low visual noise, generous breathing room, muted palette with a single sage accent (`#3B7A57`), quiet chrome.
- **Personal**: Physical journal aesthetic; serif typography (Source Serif 4) for the user's voice, clean sans-serif (Inter) for interface elements.
- **Trustworthy**: Absolute data isolation (`request.auth.uid == userId`), zero backend or vendor leakage in UI copy ("Saved", never "Persisted to Firestore"; "Send", never "Send to Gemini").

## Evidence on Hand

- Validated schema specifications in `docs/Locus-Core-Object-Model.md`.
- Architecture and security mitigations in `docs/Locus-Integrations-and-Build-Plan.md`.
- Phased 5-stage delivery plan in `docs/Locus-Implementation-Plan.md`.
- Working React 19 + Tailwind v4 + Express full-stack codebase.

## Product Principles

1. **Thinking Trajectory Over Task Tracking**: Measure personal evolution and intellectual shifts over time, never checkboxes or tickets.
2. **The User's Words Are Sacred**: The interface honors user prose with warm editorial typography and preserves raw reflections unredacted in the database.
3. **Plumbing Stays Invisible**: Never expose databases, models, or infrastructure mechanics in the user experience.
4. **Defense in Depth**: Treat every external payload, user URL, and location coordinate with strict zero-trust security and data minimization.
5. **Calm Autonomy**: Provide deep longitudinal synthesis without nagging notifications, artificial urgency, or gamification.

## Accessibility & Inclusion

- WCAG AA contrast compliance across the warm neutral canvas (`#FAF9F6`) and ink tones (`#232323`, `#6B6B6B`).
- Visible keyboard focus rings across all conversational inputs and navigation chips.
- Crisis & Self-Harm De-escalation Protocol embedded in system instructions to provide supportive resources during severe user distress.
