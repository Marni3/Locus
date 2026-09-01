---
name: feature-architecture-spec
description: Use before writing implementation code for any non-trivial feature — anything touching a new data model, a new external integration, a background/async pipeline, or a UI pattern that doesn't already exist in the app (examples in this repo's context: the concept/idea graph, the notebook auto-summary flow, any new AI-generated-content pipeline). Produces a short written spec (data model, API surface, edge cases, rollout plan) BEFORE code, so architecture decisions are made deliberately instead of discovered mid-implementation. Skip for small, contained changes (a new button, a copy change, a bug fix).
---

# Feature architecture spec

## When to use this
If a feature has more than one of: a new data model, a new external call, a background job, or a new UI surface — write the spec first. Retrofitting architecture after the code exists is how ad hoc, hard-to-change systems happen.

## Spec structure (keep it short — this is a design doc, not a PRD)

1. **One-paragraph summary.** What the feature does and why, in plain language.
2. **Data model.** New collections/fields, their shape, and how they relate to existing ones. Note what's mutable vs. append-only.
3. **Pipeline / flow.** Walk the data from trigger to result. For anything async (embedding generation, concept extraction), state explicitly: what triggers it, what happens on failure, and whether the user sees a pending/loading state or the result just appears later.
4. **API surface.** New functions/endpoints and their inputs/outputs. Which existing integration wrappers (see `third-party-integration-standards`) does this depend on — any new ones needed?
5. **Edge cases.** What happens with zero data, malformed AI output, a duplicate/near-duplicate extraction, a deleted source entry that other things reference?
6. **Cost/scale note.** Anything that calls an LLM or embeddings API per-item needs an explicit answer to "what happens at 10,000 entries" — batching, rate limits, async processing.
7. **Rollout plan.** Can this ship behind a flag? Does existing data need backfilling? Is it reversible if it's wrong?

## Process
1. Write the spec as a markdown file in `docs/specs/<feature-name>.md`.
2. Before implementing, sanity-check section 5 (edge cases) and section 6 (cost/scale) specifically — these are the two sections most often skipped and most often cause rework later.
3. Implement against the spec. If reality diverges from the spec during implementation, update the spec in the same PR — don't let it go stale.
4. Keep shipped specs in `docs/specs/` as the durable record of *why* something was built a certain way — this is what future-you (or a future contributor) reads instead of reverse-engineering intent from code.

## Anti-patterns this prevents
- Discovering the data model is wrong halfway through implementation because relationships weren't thought through up front.
- A background pipeline with no defined failure behavior (silently drops data vs. retries vs. surfaces to user — pick one, deliberately).
- A feature that works at 10 test entries and falls over at 10,000 because cost/scale was never considered.
