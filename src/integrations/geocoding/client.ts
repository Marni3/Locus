import { GeocodeResult } from './types';

/**
 * Resolves live device GPS coordinates into a human-friendly place name.
 * Enforces data minimization: discards raw lat/long unless storeCoordinates === true.
 */
export async function resolveGpsCoordinates(
  latitude: number,
  longitude: number,
  storeCoordinates = false,
  apiKeyOverride?: string
): Promise<GeocodeResult> {
  const apiKey = apiKeyOverride ?? process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn('GOOGLE_MAPS_API_KEY not configured. Falling back to coordinates label.');
    return {
      name: `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
      latitude: storeCoordinates ? latitude : undefined,
      longitude: storeCoordinates ? longitude : undefined,
      source: 'gps',
    };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
      const bestMatch = data.results[0];
      const placeName = bestMatch.formatted_address || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

      return {
        name: placeName,
        latitude: storeCoordinates ? latitude : undefined,
        longitude: storeCoordinates ? longitude : undefined,
        source: 'gps',
      };
    }

    // Fallback if zero results
    return {
      name: `GPS Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
      latitude: storeCoordinates ? latitude : undefined,
      longitude: storeCoordinates ? longitude : undefined,
      source: 'gps',
    };
  } catch (err: any) {
    console.warn('Reverse geocoding request failed:', err.message);
    return {
      name: `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
      latitude: storeCoordinates ? latitude : undefined,
      longitude: storeCoordinates ? longitude : undefined,
      source: 'gps',
    };
  }
}

/**
 * Resolves a text query into a standardized Google Maps location (Forward Geocoding),
 * or gracefully preserves personal place names ("Home Office") as custom tags without map rendering.
 */
export async function resolvePlaceQuery(
  query: string,
  storeCoordinates = false,
  apiKeyOverride?: string
): Promise<GeocodeResult> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return { name: 'Unspecified Place', source: 'manual' };
  }

  const apiKey = apiKeyOverride ?? process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    // Graceful fallback for local development without Maps API key
    return { name: cleanQuery, source: 'manual' };
  }

  try {
    const encoded = encodeURIComponent(cleanQuery);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${apiKey}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      throw new Error(`Google Geocoding error: HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
      const match = data.results[0];
      const loc = match.geometry?.location;

      return {
        name: match.formatted_address || cleanQuery,
        latitude: storeCoordinates && loc ? loc.lat : undefined,
        longitude: storeCoordinates && loc ? loc.lng : undefined,
        source: 'manual',
      };
    }

    // Custom place tag fallback (ZERO_RESULTS on non-geographic inputs like "Home Office")
    return {
      name: cleanQuery,
      source: 'manual',
    };
  } catch (err: any) {
    console.warn('Forward geocoding error. Preserving custom place string:', err.message);
    return {
      name: cleanQuery,
      source: 'manual',
    };
  }
}
