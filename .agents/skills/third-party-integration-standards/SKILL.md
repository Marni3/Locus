---
name: third-party-integration-standards
description: Use whenever adding, modifying, calling, or debugging ANY external API or SDK integration — Google Maps, Firestore Vector Search, an embeddings provider, an auth provider, or anything added later. Always apply this before writing a raw fetch() or SDK call directly inside feature/UI code, even for "quick" one-off calls. Enforces a consistent wrapper pattern (typed client, centralized config, retries, normalized errors, mockable tests) so integrations stay swappable, testable, and don't leak vendor details into the rest of the app.
---

# Third-party integration standards

## Core rule
Feature and UI code never calls a third-party SDK or `fetch()` directly. It calls a thin wrapper in `src/integrations/<service>/`. If you're about to import a vendor SDK anywhere outside that folder, stop and build the wrapper first.

## Folder shape (per integration)
```
src/integrations/<service>/
  client.ts    - constructs and exports the configured client
  types.ts     - our own types for what we consume (not the vendor's raw types)
  errors.ts    - normalized error classes for this integration
  index.ts     - the only public surface other code imports from
  __mocks__/   - mock implementation used in tests
```

## Required in every wrapper

1. **Centralized config.** All keys/endpoints read from env vars in one place inside the wrapper, never scattered across call sites. Fail fast with a clear error at startup if a required var is missing — don't fail silently mid-request.
2. **Our own types at the boundary.** Convert the vendor's response shape into a type we define in `types.ts` immediately on return. Nothing downstream should import a vendor SDK type.
3. **Retry + backoff for transient failures.** Network/5xx/rate-limit errors get retried with exponential backoff (2–3 attempts). Validation/4xx errors do not retry.
4. **Normalized errors.** Wrap vendor errors into our own error classes (`errors.ts`) with a stable `.code` so calling code can branch without knowing the vendor's exception shape.
5. **No secrets in logs or error messages.** Redact API keys/tokens before logging or surfacing errors to the client.
6. **A mock implementation.** Every wrapper ships a `__mocks__/` version returning realistic fixtures, so feature tests never hit the real network or burn quota.

## When adding a new integration
1. Create the folder shape above.
2. Write `types.ts` first — define what the *rest of the app* needs, not what the vendor returns.
3. Implement `client.ts` against those types, converting vendor responses.
4. Write the mock alongside the real client, not after.
5. Add one integration-level test that hits the mock and asserts the wrapper's error-normalization behavior (a forced timeout, a forced 429, a forced malformed response).

## Red flags to catch in review
- A vendor SDK type or vendor error class appearing outside `src/integrations/`.
- An API key read via `process.env` (or equivalent) anywhere outside a `client.ts`.
- A `fetch()`/SDK call with no retry or timeout.
- A feature test that isn't using the mock (real network calls in CI).
