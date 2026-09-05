import { test, expect } from '@playwright/test';

test.describe('Phase 1 Core Loop & Conclude Routes (Tier 3 TDD)', () => {
  const testEntryId = 'e2e-test-entry-' + Date.now();
  const testUserId = 'test-user-e2e';

  test('POST /api/entries/:id/conclude synthesizes entry into themes and observations', async ({ request }) => {
    test.setTimeout(60000);
    const mockEntry = {
      id: testEntryId,
      userId: testUserId,
      status: 'active',
      createdAt: new Date().toISOString(),
      locationContext: {
        name: 'Coffee Shop Lab',
        source: 'manual',
      },
      turns: [
        {
          id: 'turn-1',
          entryId: testEntryId,
          userId: testUserId,
          role: 'user',
          content: 'I noticed I make much better architectural decisions when I step away from the keyboard and sketch on paper.',
          timestamp: new Date().toISOString(),
          isPinned: true,
          note: 'Key creative pattern',
        },
        {
          id: 'turn-2',
          entryId: testEntryId,
          userId: testUserId,
          role: 'ai',
          content: 'What tactile physical tools help you disengage from premature code optimization?',
          timestamp: new Date().toISOString(),
        }
      ]
    };

    const res = await request.post(`/api/entries/${testEntryId}/conclude`, {
      data: { entry: mockEntry },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.result.concludedEntry.status).toBe('concluded');
    expect(body.result.concludedEntry.concludedAt).toBeDefined();
    expect(body.result.concludedEntry.summary).toBeDefined();
    expect(body.result.newObservations.length).toBeGreaterThan(0);
  });

  test('PATCH /api/entries/:id/messages/:messageId updates message pin status and notes', async ({ request }) => {
    const messageId = 'turn-1';
    const res = await request.patch(`/api/entries/${testEntryId}/messages/${messageId}`, {
      data: {
        userId: testUserId,
        isPinned: true,
        note: 'Updated personal realization note',
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.updated.isPinned).toBe(true);
    expect(body.updated.note).toBe('Updated personal realization note');
  });
});
