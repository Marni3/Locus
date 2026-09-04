---
name: notification-dispatcher-integration
description: Use whenever implementing, modifying, or reviewing the entry-conclusion notification feature — the email send and the user-configured Zapier/generic incoming-webhook POST. The webhook path accepts a user-supplied URL, which is a real SSRF (server-side request forgery) vector, not a theoretical one — treat this skill as required reading before that code ships, not optional hardening. Builds on third-party-integration-standards.
---

# Notification dispatcher integration

## The webhook path is the highest-risk integration in this app
A user pastes a URL into settings; your backend later makes an outbound POST to it. Without validation, a malicious or compromised account could point that URL at internal infrastructure (`http://localhost:...`, `http://169.254.169.254/...` — the cloud metadata endpoint, internal service hostnames) and use your server as a proxy to probe or attack your own infrastructure. Treat every webhook URL as untrusted input.

### Required validation, at save time AND at send time
- **Scheme:** `https://` only. Reject `http://`, `file://`, `ftp://`, everything else.
- **Resolve DNS and check the resulting IP**, not just the hostname string — block private/reserved ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`, and IPv6 equivalents). A hostname that resolves to a public IP at save time can be re-pointed to an internal IP later (DNS rebinding) — re-resolve and re-check at send time too, not just once when the user saves the URL.
- **No redirects followed automatically.** If the destination responds with a redirect, don't transparently follow it — that's a bypass for the IP check above. Either refuse to follow, or re-validate the redirect target through the same checks.
- **Timeout** (a few seconds) and **no retry storm** — one retry with backoff, then give up and log. This is a fire-and-forget notification, not a critical path; it must never block or delay Entry conclusion for the user.

### Payload
- Escape/template user content before it goes into the JSON payload — Entry summaries and Theme text are user-generated and end up in a payload another system will parse; don't string-concatenate raw content into the request body.
- Rate-limit sends per user (e.g. max N per hour) so a misconfigured or malicious webhook target can't be hammered using your infrastructure as an amplifier.

## Email path
- Send via a transactional provider API (Resend, SendGrid, etc.) — never raw SMTP credentials in app code.
- Sending API key lives only in the backend wrapper (`src/integrations/email/`), never client-exposed.
- Escape user content when building the email body (HTML email = injection surface same as the webhook payload).
- Same fire-and-forget rule: a failed or slow email send never blocks or fails the user-facing Conclude action.

## Testing
Mock both providers. For the webhook path specifically, add a dedicated test asserting that a URL resolving to a private/reserved IP is rejected at both save time and send time — this is the one test in the whole integration layer that should never be skipped or weakened.
