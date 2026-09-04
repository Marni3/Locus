import { EntryLocation } from '../../types';

export type GeocodeResult = EntryLocation;

export interface ResolveGpsParams {
  latitude: number;
  longitude: number;
  storeCoordinates?: boolean;
}

export interface ResolveQueryParams {
  query: string;
  storeCoordinates?: boolean;
}
