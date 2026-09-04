---
name: geocoding-integration
description: Use whenever implementing, modifying, or reviewing the opt-in location-context feature (Google Maps Geocoding API) — capturing device coordinates, resolving them to a place name, and storing that on an Entry. Covers API key restriction, data minimization, consent enforcement, and error handling specific to this integration. Builds on third-party-integration-standards; read that first for the general wrapper pattern.
---

# Geocoding integration

## Consent is enforced in the client AND the server
The opt-in toggle is a UI convenience, not the security boundary. The backend function that accepts a geocode request must independently verify the Entry has location enabled before calling the Maps API or writing `locationContext` — never trust a client-sent "consent: true" flag on the request body.

## Data minimization
- Request `navigator.geolocation` coordinates client-side, send them to your backend wrapper, resolve to a place name, **then discard the raw lat/long** — store only the resolved string (`"Balanga, Bataan"`) on Entry. Don't persist precise coordinates once you have the string; they're more identifying than the district name and you don't need them for anything downstream.
- Geocode at Entry-start time only, once. Don't re-geocode on every message or poll location during an active session.

## API key handling
- The Geocoding API key used server-side must be restricted (IP or API restriction in Google Cloud Console) and separate from any client-exposed Maps key, if one exists elsewhere in the app. Never call the Geocoding API directly from client JS with an unrestricted key.

## Error handling
- No results / zero-results response: don't fail Entry creation. Log it, leave `locationContext` null, continue — location is enhancement, not a required field.
- Quota/rate-limit errors: same treatment — degrade silently from the user's point of view, surface in logs only.
- Timeout: geocoding must not block the Entry-start flow. Fire it async after the Entry is already created; update `locationContext` when it resolves rather than making the user wait on it.

## Testing
Mock the Geocoding API response in tests (see third-party-integration-standards). Test explicitly: zero-results, malformed coordinates, and the consent-flag-ignored-from-client case — a test that sends `consent: false` server-side state but tries to trigger geocoding anyway should fail closed.
