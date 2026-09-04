import { test, expect } from '@playwright/test';

test.describe('Phase 2 Integrations & Privacy Hardening E2E (Tier 3 TDD)', () => {
  const testThemeId = 'theme-e2e-' + Date.now();

  // 1. Unpack Further Engine
  test.describe('Unpack Further Engine (POST /api/themes/:id/unpack)', () => {
    test('rejects unpack request when theme has fewer than 2 observations', async ({ request }) => {
      const res = await request.post(`/api/themes/${testThemeId}/unpack`, {
        data: {
          theme: {
            id: testThemeId,
            userId: 'user-e2e',
            title: 'Premature Architecture Optimization',
            currentSynthesis: 'Tends to over-engineer before validating assumptions.',
            observationCount: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          observations: [
            {
              id: 'obs-1',
              userId: 'user-e2e',
              entryId: 'entry-1',
              themeId: testThemeId,
              observationText: 'Over-abstracted database adapter on day 1.',
              timestamp: new Date().toISOString(),
            }
          ]
        }
      });

      expect(res.status()).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('at least 2 observations');
    });

    test('successfully unpacks theme into thesis, narrative, and exploration paths for >= 2 observations', async ({ request }) => {
      const res = await request.post(`/api/themes/${testThemeId}/unpack`, {
        data: {
          theme: {
            id: testThemeId,
            userId: 'user-e2e',
            title: 'Creative Disengagement & Physical Sketching',
            currentSynthesis: 'User reaches breakthroughs by stepping away from keyboards to paper.',
            observationCount: 2,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString(),
          },
          observations: [
            {
              id: 'obs-1',
              userId: 'user-e2e',
              entryId: 'entry-1',
              themeId: testThemeId,
              observationText: 'Stepped away to draw data structures on a notebook; simplified the mental model immediately.',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              locationSnapshot: 'Coffee Shop Lab',
            },
            {
              id: 'obs-2',
              userId: 'user-e2e',
              entryId: 'entry-2',
              themeId: testThemeId,
              observationText: 'Realized that screen friction causes premature code restructuring rather than problem-solving.',
              timestamp: new Date().toISOString(),
              locationSnapshot: 'Balanga Studio',
            }
          ]
        }
      });

      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.unpackResult).toBeDefined();

      const { workingTitle, evolutionaryThesis, narrativeArc, explorationPaths } = data.unpackResult;
      expect(typeof workingTitle).toBe('string');
      expect(workingTitle.length).toBeGreaterThan(0);

      expect(typeof evolutionaryThesis).toBe('string');
      expect(evolutionaryThesis.length).toBeGreaterThan(0);

      expect(typeof narrativeArc).toBe('string');
      expect(narrativeArc.length).toBeGreaterThan(0);

      expect(Array.isArray(explorationPaths)).toBe(true);
      expect(explorationPaths.length).toBeGreaterThan(0);
      for (const path of explorationPaths) {
        expect(typeof path.pathTitle).toBe('string');
        expect(typeof path.creativePrompt).toBe('string');
      }
    });
  });

  // 2. Location Context Geocoding & Minimization
  test.describe('Unified Location Context (POST /api/location/*)', () => {
    test('POST /api/location/resolve-query rejects empty query with 400', async ({ request }) => {
      const res = await request.post('/api/location/resolve-query', {
        data: { query: '   ' }
      });
      expect(res.status()).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('query string is required');
    });

    test('POST /api/location/resolve-query resolves text query and returns location object', async ({ request }) => {
      const res = await request.post('/api/location/resolve-query', {
        data: { query: 'The Mill Coffee SF', storeCoordinates: false }
      });
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.location).toBeDefined();
      expect(typeof data.location.name).toBe('string');
      expect(data.location.name.length).toBeGreaterThan(0);
      expect(data.location.source).toBe('manual');
      // Verify coordinate minimization
      expect(data.location.latitude).toBeUndefined();
      expect(data.location.longitude).toBeUndefined();
    });

    test('POST /api/location/resolve-gps rejects invalid coordinates with 400', async ({ request }) => {
      const res = await request.post('/api/location/resolve-gps', {
        data: { latitude: 'invalid', longitude: -122.4 }
      });
      expect(res.status()).toBe(400);
    });

    test('POST /api/location/resolve-gps enforces coordinate minimization by default', async ({ request }) => {
      const res = await request.post('/api/location/resolve-gps', {
        data: { latitude: 37.7749, longitude: -122.4194, storeCoordinates: false }
      });
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.location).toBeDefined();
      expect(typeof data.location.name).toBe('string');
      expect(data.location.source).toBe('gps');
      // Coordinate minimization: lat/lng omitted when storeCoordinates is false
      expect(data.location.latitude).toBeUndefined();
      expect(data.location.longitude).toBeUndefined();
    });

    test('POST /api/location/resolve-gps preserves coordinates only when explicitly requested', async ({ request }) => {
      const res = await request.post('/api/location/resolve-gps', {
        data: { latitude: 37.7749, longitude: -122.4194, storeCoordinates: true }
      });
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.location.latitude).toBe(37.7749);
      expect(data.location.longitude).toBe(-122.4194);
    });
  });

  // 3. Webhook SSRF Validation
  test.describe('Webhook SSRF Validation (POST /api/notifications/test-webhook)', () => {
    test('rejects empty webhook URL with 400', async ({ request }) => {
      const res = await request.post('/api/notifications/test-webhook', {
        data: { webhookUrl: '' }
      });
      expect(res.status()).toBe(400);
    });

    test('blocks non-HTTPS webhook destination', async ({ request }) => {
      const res = await request.post('/api/notifications/test-webhook', {
        data: { webhookUrl: 'http://example.com/webhook' }
      });
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data.isValid).toBe(false);
      expect(data.error).toContain('HTTPS');
    });

    test('blocks internal loopback (127.0.0.1)', async ({ request }) => {
      const res = await request.post('/api/notifications/test-webhook', {
        data: { webhookUrl: 'https://127.0.0.1:8080/hook' }
      });
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data.isValid).toBe(false);
      expect(data.error).toContain('internal');
    });

    test('blocks cloud metadata endpoint (169.254.169.254)', async ({ request }) => {
      const res = await request.post('/api/notifications/test-webhook', {
        data: { webhookUrl: 'https://169.254.169.254/latest/meta-data/' }
      });
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data.isValid).toBe(false);
      expect(data.error).toContain('internal');
    });

    test('validates safe public HTTPS webhook destination', async ({ request }) => {
      const res = await request.post('/api/notifications/test-webhook', {
        data: { webhookUrl: 'https://example.com/webhook' }
      });
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data.isValid).toBe(true);
      expect(data.error).toBeUndefined();
    });
  });
});
