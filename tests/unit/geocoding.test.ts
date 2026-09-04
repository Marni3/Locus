import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveGpsCoordinates, resolvePlaceQuery } from '../../src/integrations/geocoding';

describe('Unified Location Context & Geocoding (Tier 1 & 2 TDD)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Reverse Geocoding (Live Device GPS)', () => {
    it('resolves coordinates to a clean place string and discards raw coordinates by default (Data Minimization)', async () => {
      // Mock Google Geocoding API response
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'OK',
          results: [
            {
              formatted_address: 'Balanga City, Bataan, Philippines',
              address_components: [
                { long_name: 'Balanga', types: ['locality'] },
                { long_name: 'Bataan', types: ['administrative_area_level_2'] },
              ],
              geometry: { location: { lat: 14.6823, lng: 120.5412 } },
            },
          ],
        }),
      });
      global.fetch = mockFetch;

      const result = await resolveGpsCoordinates(14.6823, 120.5412, false, 'dummy-key');

      expect(result.name).toBe('Balanga City, Bataan, Philippines');
      expect(result.source).toBe('gps');
      // Coordinates MUST be discarded for data minimization
      expect(result.latitude).toBeUndefined();
      expect(result.longitude).toBeUndefined();
    });

    it('attaches exact coordinates when user explicitly opts in via storeCoordinates: true', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'OK',
          results: [
            {
              formatted_address: 'The Mill, 736 Divisadero St, San Francisco, CA',
              geometry: { location: { lat: 37.7764, lng: -122.4379 } },
            },
          ],
        }),
      });

      const result = await resolveGpsCoordinates(37.7764, -122.4379, true, 'dummy-key');

      expect(result.name).toContain('The Mill');
      expect(result.source).toBe('gps');
      expect(result.latitude).toBe(37.7764);
      expect(result.longitude).toBe(-122.4379);
    });
  });

  describe('Forward Geocoding (Text Query to Place)', () => {
    it('resolves typed query into a standardized place name without rendering a map', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'OK',
          results: [
            {
              formatted_address: 'Central Park, New York, NY, USA',
              geometry: { location: { lat: 40.785091, lng: -73.968285 } },
            },
          ],
        }),
      });

      const result = await resolvePlaceQuery('Central Park NYC', false, 'dummy-key');

      expect(result.name).toBe('Central Park, New York, NY, USA');
      expect(result.source).toBe('manual');
    });

    it('gracefully falls back to raw text for personal places that return ZERO_RESULTS (e.g. "Home Office")', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'ZERO_RESULTS',
          results: [],
        }),
      });

      const result = await resolvePlaceQuery('Home Office / Corner Desk', false, 'dummy-key');

      // Preserves user input without throwing error
      expect(result.name).toBe('Home Office / Corner Desk');
      expect(result.source).toBe('manual');
      expect(result.latitude).toBeUndefined();
    });

    it('gracefully handles missing API key by keeping user query as a manual custom place tag', async () => {
      const result = await resolvePlaceQuery('Cozy Coffee Shop', false, undefined);

      expect(result.name).toBe('Cozy Coffee Shop');
      expect(result.source).toBe('manual');
    });
  });
});
