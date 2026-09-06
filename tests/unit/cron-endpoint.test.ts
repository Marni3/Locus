import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateCronAuth, runAutoConcludeSweep } from '../../src/services/cronSweep';
import { Entry } from '../../src/types';
import { Request, Response } from 'express';

describe('POST /api/cron/sweep-conclude Handler (Tier 1 Integration TDD)', () => {
  const SECRET = 'cron_test_secret_xyz';
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;
  let res: Partial<Response>;

  // Route handler implementation matching server.ts
  const handleSweepConclude = async (req: Partial<Request>, response: Partial<Response>) => {
    const cronSecret = process.env.CRON_SECRET;
    const isAuthorized = validateCronAuth(
      req.headers as Record<string, string | string[] | undefined>,
      cronSecret
    );

    if (!isAuthorized) {
      return (response.status as any)(401).json({ error: 'Unauthorized: Invalid or missing cron credentials.' });
    }

    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const maxBatch = typeof body.maxBatch === 'number' ? body.maxBatch : 5;
    const providedEntries: Entry[] = Array.isArray(body.entries) ? body.entries : [];

    const result = await runAutoConcludeSweep(
      providedEntries,
      async (entry) => {
        return { concludedId: entry.id };
      },
      { maxBatch }
    );

    return (response.json as any)({
      success: true,
      sweepResult: result
    });
  };

  beforeEach(() => {
    process.env.CRON_SECRET = SECRET;
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock as any,
      json: jsonMock as any,
    };
  });

  it('rejects unauthenticated requests with 401 Unauthorized', async () => {
    const req: Partial<Request> = {
      headers: {},
      body: { entries: [] }
    };

    await handleSweepConclude(req, res);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('Unauthorized'),
      })
    );
  });

  it('rejects requests with invalid secret with 401 Unauthorized', async () => {
    const req: Partial<Request> = {
      headers: { 'x-cron-secret': 'bad_token' },
      body: { entries: [] }
    };

    await handleSweepConclude(req, res);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('Unauthorized'),
      })
    );
  });

  it('accepts valid X-Cron-Secret and returns successful sweep metrics', async () => {
    const twoHoursAgo = new Date(Date.now() - 130 * 60 * 1000).toISOString();
    const testEntries: Entry[] = [
      {
        id: 'test_entry_1',
        userId: 'usr_1',
        title: 'Idle Reflection',
        status: 'active',
        createdAt: twoHoursAgo,
        updatedAt: twoHoursAgo,
        turns: []
      }
    ];

    const req: Partial<Request> = {
      headers: { 'x-cron-secret': SECRET },
      body: { entries: testEntries, maxBatch: 5 }
    };

    await handleSweepConclude(req, res);

    expect(statusMock).not.toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        sweepResult: expect.objectContaining({
          concludedCount: 1,
          status: 'ok'
        })
      })
    );
  });

  it('accepts Bearer authorization token and executes sweep', async () => {
    const req: Partial<Request> = {
      headers: { authorization: `Bearer ${SECRET}` },
      body: { entries: [] }
    };

    await handleSweepConclude(req, res);

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        sweepResult: expect.objectContaining({
          concludedCount: 0,
          status: 'ok'
        })
      })
    );
  });
});
