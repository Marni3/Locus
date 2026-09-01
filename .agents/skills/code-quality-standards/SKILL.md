---
name: code-quality-standards
description: Use for every code change in this repo — writing new code, reviewing a PR, or refactoring. Enforces consistent testing expectations, error handling, typing, and commit/PR hygiene so the codebase stays maintainable as features (especially AI-pipeline and integration-heavy ones) are added by different sessions/contributors over time. Apply this alongside third-party-integration-standards and feature-architecture-spec, not instead of them.
---

# Code quality standards

## Typing
- No `any` (or untyped equivalents) at integration boundaries or in shared/exported functions. Local, throwaway variables can be loose; anything another file imports must be typed.
- Prefer narrow, explicit types over generic catch-alls (`ConceptNode` over `Record<string, unknown>`).

## Error handling
- Never swallow an error silently (empty `catch` blocks). At minimum, log with enough context to debug (what operation, what input identifiers — not full user content in logs).
- User-facing errors are plain language and actionable (see the content/tone guidelines if this repo has UI copy standards); internal errors can be technical, but the two shouldn't be the same string shown in two places.
- Distinguish "expected" failures (no results found, invalid input) from "unexpected" failures (integration down, malformed data) — they should not look identical to the user or in logs.

## Testing
- New logic gets a test in the same PR, not a follow-up. Exception: pure UI layout changes with no logic.
- Anything touching an external integration tests against the mock (see `third-party-integration-standards`), never live network calls in CI.
- For AI-pipeline code (extraction, summarization, embedding), test the parsing/handling of malformed or unexpected model output specifically — this fails more often than the happy path.

## Commits & PRs
- One logical change per PR. A UI redesign and a new backend pipeline are two PRs, not one.
- PR description states: what changed, why, and what was explicitly deferred (if anything). "Deferred" items should become tracked follow-ups, not silently forgotten.
- If the change touches a data model, link the spec (see `feature-architecture-spec`) or note that none was needed and why.

## Review checklist (apply both when writing and reviewing)
- [ ] No vendor SDK/type used outside `src/integrations/`
- [ ] No secrets or full user journal content in logs
- [ ] New async/background work has a defined failure behavior
- [ ] Tests added for new logic, using mocks for external calls
- [ ] Types are explicit at any exported/shared boundary
