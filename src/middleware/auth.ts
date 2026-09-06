import { Request, Response, NextFunction } from 'express';
import firebaseConfig from '../../firebase-applet-config.json';

export const DEMO_TOKEN = 'demo-token-maya';
export const DEMO_USER_ID = 'demo-user-student-maya';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  isDemoUser?: boolean;
}

export interface TokenVerificationResult {
  isValid: boolean;
  userId?: string;
  email?: string;
  isDemo?: boolean;
  error?: string;
}

// In-memory token cache to avoid repetitive network lookups for active sessions
interface CachedToken {
  userId: string;
  email?: string;
  expiresAt: number;
}
const tokenCache = new Map<string, CachedToken>();

/**
 * Verifies a Firebase ID token using Google Identity Toolkit or test/demo bypass.
 */
export async function verifyFirebaseToken(token: string): Promise<TokenVerificationResult> {
  if (!token || typeof token !== 'string') {
    return { isValid: false, error: 'Authorization token is missing or malformed.' };
  }

  // 1. Check in-memory cache
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return {
      isValid: true,
      userId: cached.userId,
      email: cached.email,
      isDemo: cached.userId === DEMO_USER_ID,
    };
  }

  // 2. Demo Mode Bypass
  if (token === DEMO_TOKEN || token === 'demo-mode-token') {
    return {
      isValid: true,
      userId: DEMO_USER_ID,
      email: 'maya.dorm.journal@example.edu',
      isDemo: true,
    };
  }

  // 3. Test Environment Bypass
  if (process.env.NODE_ENV === 'test' && token.startsWith('test-token-')) {
    const testUid = token.replace('test-token-', '') || 'test-user-id';
    return {
      isValid: true,
      userId: testUid,
      email: `${testUid}@example.com`,
      isDemo: false,
    };
  }

  // 4. Resolve Firebase Web API Key for live verification
  const apiKey =
    process.env.VITE_FIREBASE_API_KEY ||
    process.env.FIREBASE_API_KEY ||
    firebaseConfig.apiKey;

  if (!apiKey || apiKey === 'YOUR_FIREBASE_API_KEY') {
    // In local development where credentials aren't supplied, allow local sandbox with warning
    if (process.env.NODE_ENV !== 'production') {
      return {
        isValid: true,
        userId: 'dev-local-user',
        email: 'dev@local.test',
        isDemo: true,
      };
    }
    return { isValid: false, error: 'Firebase Auth is not configured on the server.' };
  }

  // 5. Query Google Identity Toolkit to verify ID token signature & expiration
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return {
        isValid: false,
        error: err.error?.message || `Token validation failed (${response.status})`,
      };
    }

    const data = await response.json();
    const user = data.users?.[0];
    if (!user || !user.localId) {
      return { isValid: false, error: 'User record not found in verified token payload.' };
    }

    // Cache valid token for 5 minutes
    tokenCache.set(token, {
      userId: user.localId,
      email: user.email,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return {
      isValid: true,
      userId: user.localId,
      email: user.email,
      isDemo: false,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: err.message || 'Error communicating with Google Identity Toolkit service.',
    };
  }
}

/**
 * Express middleware that enforces authentication on protected routes.
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Missing or malformed Authorization header. Expected Bearer <token>.',
    });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  const verification = await verifyFirebaseToken(token);

  if (!verification.isValid || !verification.userId) {
    return res.status(401).json({
      error: `Unauthorized: ${verification.error || 'Invalid authentication token.'}`,
    });
  }

  req.userId = verification.userId;
  req.userEmail = verification.email;
  req.isDemoUser = verification.isDemo;

  next();
}
