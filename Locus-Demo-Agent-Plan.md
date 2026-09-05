# Locus Demo-Data Generation Agent — Operating Plan

*Companion to `Locus-Demo-Data-Brief.md`. This is the operating spec for whatever agent (browser-automation bot, scripted persona runner, etc.) actually drives the app to produce the demo data — not narrative content itself, but the rules for how it acts.*

## Objective

Produce ~14–16 real Entries through the app's normal Start → converse → Conclude flow, in strict chronological order, following the persona and thread map in the Demo Data Brief — so the real synthesis pipeline generates real Themes and Observations, not scripted ones.

## Prerequisite before running this (flag to yourself, not the agent's job)

Normal Entry flow stamps `createdAt`/`concludedAt` with real server time. Running 14–16 entries in one sitting will bunch every timestamp into the same hour, which breaks the "over a month" illusion the demo depends on. You need a seed-mode override — a debug-only parameter that lets these specific writes carry explicit historical timestamps instead of `serverTimestamp()` — built and available *before* pointing the agent at the app. This is a small backend addition, not something the agent can fake on its own.

## Per-entry limits

- **3–6 user messages per entry**, not counting the AI's replies. This is a conversation, not a chapter.
- **Each user message: 1–4 sentences.** Diary voice, not essay voice.
- **Respond to at least one AI follow-up before concluding**, except for the intentionally short "three lines before bed" entries the brief calls for — those can end after a single exchange.
- **Always end with an explicit Conclude action.** Don't rely on the 2-hour auto-timeout to close entries during generation — far too slow for a seeding run, and it's not what you're testing here.

## Weekly cadence and mix

3–4 entries per week, ~15 total across 4 weeks. Mix within *every* week, not just week 1 — roughly one multi-topic "whole day" entry per week, the rest single-topic:

| Week | Entries | Mix |
|---|---|---|
| 1 | 4 | 3 multi-topic (everything tangled together — realistic for the overwhelmed opening), 1 single-topic |
| 2 | 4 | 1 multi-topic, 3 single-topic (bad midterm, PII-line entry, roommate conflict) |
| 3 | 4 | 1 multi-topic, plus the singleton reflection, the relapse dip, and the pin-worthy quote as their own single-topic entries |
| 4 | 3–4 | 1 multi-topic "whole day" wrap-up, rest single-topic resolution entries |

## Ordering rule — non-negotiable

Entries must be created and **fully concluded, one at a time, in narrative order.** Don't start entry N+1 until entry N has reached `Concluded` and the synthesis pass has run. Later entries' believability depends on Theme-matching against what already exists — skip this and the accumulated Observations won't be real.

## Per-entry checklist the agent tracks

For each entry, log: which thread(s) from the brief it targets, whether it's multi- or single-topic, and whether it's one of the flagged technical-checkpoint entries (PII line, geocoding opt-in, singleton, relapse dip, pin-worthy quote). After conclusion, do a quick sanity check that the extracted Theme(s) look plausible — not a rewrite, just a flag. If something extracts as obvious garbage, that's a real signal to surface to you before the demo, not something to quietly plow past.

## Guardrails

- **Never name a Theme in the conversation itself.** Write what the person would actually think ("I don't know, I keep getting stuck on the roommate thing again") — not a label ("This is about roommate boundaries"). The extraction's job is to find the pattern, not transcribe one you handed it.
- **Let the real Locus AI respond.** No canned or substituted AI turns — the point is exercising the actual pipeline, imperfect responses included.
- **No retries on a mediocre AI reply.** An occasional so-so response is realistic and fine; editing it away defeats the purpose.
- **Don't reorder or backfill entries.** Chronological, one at a time, as above.

## End-of-run report

When done, the agent should produce: the full list of Entries created (title, week, target thread(s)), the resulting Themes with their Observation counts, confirmation that every technical checkpoint from the brief was hit, and a note of anything that looked off during extraction — so you're reviewing a summary before the actual demo, not discovering surprises live.
