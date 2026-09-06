import { getCurrentIdToken } from './firebase';
import { DEMO_TOKEN } from '../middleware/auth';

/**
 * Centralized API client wrapper that automatically attaches the active Firebase ID token
 * or falls back to the demo authorization token when operating in demo mode.
 */
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});

  if (!headers.has('Authorization')) {
    const liveToken = await getCurrentIdToken();
    if (liveToken) {
      headers.set('Authorization', `Bearer ${liveToken}`);
    } else {
      headers.set('Authorization', `Bearer ${DEMO_TOKEN}`);
    }
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
