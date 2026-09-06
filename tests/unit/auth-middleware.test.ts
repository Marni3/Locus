import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth, verifyFirebaseToken, DEMO_TOKEN, DEMO_USER_ID, AuthenticatedRequest } from '../../src/middleware/auth';
import { NextFunction, Response } from 'express';

describe('Authentication Middleware & Token Verification (Zone 1 & 4 Hardening)', () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;
  let next: NextFunction;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock as any,
      json: jsonMock as any,
    };
    next = vi.fn() as unknown as NextFunction;
  });

  it('rejects requests missing an Authorization header with 401 Unauthorized', async () => {
    req = { headers: {} };

    await requireAuth(req as AuthenticatedRequest, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('Missing or malformed Authorization header'),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects requests with malformed Authorization headers with 401 Unauthorized', async () => {
    req = { headers: { authorization: 'Basic dXNlcjpwYXNz' } };

    await requireAuth(req as AuthenticatedRequest, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts and validates the Demo Mode token, binding the student persona ID', async () => {
    req = { headers: { authorization: `Bearer ${DEMO_TOKEN}` } };

    await requireAuth(req as AuthenticatedRequest, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe(DEMO_USER_ID);
    expect(req.isDemoUser).toBe(true);
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('accepts and binds test tokens during unit/E2E test runs', async () => {
    req = { headers: { authorization: 'Bearer test-token-ben-garcia' } };

    await requireAuth(req as AuthenticatedRequest, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe('ben-garcia');
    expect(req.isDemoUser).toBe(false);
  });

  it('rejects an empty or invalid bearer token with 401 Unauthorized', async () => {
    req = { headers: { authorization: 'Bearer ' } };

    await requireAuth(req as AuthenticatedRequest, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('verifies token function correctly identifies demo token', async () => {
    const res = await verifyFirebaseToken(DEMO_TOKEN);
    expect(res.isValid).toBe(true);
    expect(res.userId).toBe(DEMO_USER_ID);
    expect(res.isDemo).toBe(true);
  });
});
