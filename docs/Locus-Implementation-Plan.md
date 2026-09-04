# Locus — Phased Implementation Plan

*Design doc 3. Companions: `Locus — Core Object Model & Schema`, `Locus — Integrations, Demo Tooling & Build Plan`.*

Each phase ends with a test checkpoint before the next phase starts — nothing gets layered on top of an unverified layer below it.

## Phase 1 — Core loop (Day 2, morning)
**Build:** Entry/Message/Theme/Theme Observation schema in Firestore. Start Entry → Send Message → Conclude Entry flow. The synchronous synthesis pipeline (embed summary → vector search candidate Themes → LLM resolution → write Theme/Observation).

**Test before moving on:**
- Manually run 3–4 varied conversations through Conclude and confirm Observations land against sensible Themes, not one catch-all Theme.
- Confirm the 2-hour auto-conclude timeout actually fires (don't just trust the timer logic — force-test it with a shortened window locally).
- Confirm re-running the same topic in a second Entry appends a new Observation to the existing Theme rather than creating a duplicate.

**Fallback if behind schedule:** simplify the vector-matching threshold rather than cutting anything structural — this phase is not optional, everything else depends on it.

## Phase 2 — Integration layer, in priority order (Day 2, afternoon)
**Build**, in this order, stopping and shipping whatever's done if time runs out: PII sanitizer → Unpack Further → Notification dispatcher (email + Zapier) → Geocoding.

**Test after each one lands, not just at the end of the phase:**
- Sanitizer: run the fixture test suite (see `pii-sanitizer-implementation` skill) and manually confirm a real Gemini API call payload has PII scrubbed while Firestore's copy doesn't.
- Unpack Further: confirm it's disabled/hidden below the 2-Observation threshold, and that output quality is coherent on a Theme with real Observations, not just Day-1 stub data.
- Notification dispatcher: confirm the SSRF validation actually rejects a localhost/private-IP URL (this is the one test not to skip — see `notification-dispatcher-integration` skill), and that a failed send never blocks Entry conclusion.
- Geocoding: confirm the opt-in toggle is per-entry and off by default, and that raw coordinates aren't persisted anywhere.

**Fallback:** cut from the bottom of the list (Geocoding first) if the day is running long — this order was set specifically so a partial build still ships the highest-value, highest-risk pieces.

## Phase 3 — Screens (Day 3, morning)
**Build:** Reflections home (note-grid + Unpack Further strip), Themes (list + graph toggle), Settings (tone/custom-prompt field, integration config), dummy-data import panel (dev-gated).

**Test:**
- Full click-through of the primary path: start an entry, reflect, conclude, see it land on the home grid, see a Theme update, open the graph, expand a Theme to see its Observation satellites.
- Dummy-data panel: both import modes actually populate the UI correctly and are unreachable from the real Settings screen.

## Phase 4 — Polish + stretch (Day 3, afternoon)
**Build, if time allows, in this order:** guided walkthrough overlay → mobile-width pass on the screens already built. Both are additive, not required for the core submission to function — treat them as genuinely optional rather than scheduling them as if they're guaranteed.

**Test:** walkthrough doesn't break if a user dismisses it mid-sequence; mobile pass checked at actual small-viewport width, not just a resized desktop window.

## Phase 5 — Documentation + submission (Day 3, evening)
**Build:** README covering the object model, the four integrations and their security decisions (this is where the sanitizer's outbound-only scope and the webhook SSRF protections get written up explicitly — that's the Security-criterion evidence), deploy, public showcase writeup.

**Test:** a final end-to-end run on the deployed build, not just localhost — this is what a judge will actually see.

## Day 4 (buffer)
Untouched, ideally. If Phase 5 slides into Day 4, that's the signal to look back at which fallback should have been cut earlier rather than trying to finish everything late.
