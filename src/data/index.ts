// Data processing utilities for geographic data

import chileGeoJson from './chile-outline.json';

// Type for coordinate pairs [longitude, latitude]
export type Coordinate = [number, number];

/**
 * Extracts the outline coordinates of Chile from the GeoJSON file.
 * The GeoJSON contains a MultiPolygon with mainland and all islands.
 * Returns all outer rings of all polygons in the MultiPolygon.
 */
export function getChileOutline(): Coordinate[][] {
  try {
    // The GeoJSON is a FeatureCollection
    const featureCollection = chileGeoJson as any;
    
    if (!featureCollection.features || featureCollection.features.length === 0) {
      console.warn('No features found in GeoJSON');
      return [];
    }

    const feature = featureCollection.features[0];
    const geometry = feature.geometry;

    if (!geometry) {
      console.warn('No geometry found in feature');
      return [];
    }

    // Handle MultiPolygon - return ALL outer rings
    if (geometry.type === 'MultiPolygon') {
      const allPolygons: Coordinate[][] = [];
      const coordinates = geometry.coordinates as number[][][][];
      
      for (const polygon of coordinates) {
        if (polygon.length > 0) {
          // First ring is the outer boundary
          const outerRing = polygon[0] as number[][];
          
          // Clean up the coordinates: ensure they are [lon, lat] pairs
          const cleanedRing = outerRing.map((coord: number[]) => {
            if (Array.isArray(coord) && coord.length >= 2) {
              return [coord[0], coord[1]] as Coordinate;
            }
            return [0, 0] as Coordinate;
          });
          
          allPolygons.push(cleanedRing);
        }
      }
      
      return allPolygons;
    }
    
    // Handle simple Polygon
    if (geometry.type === 'Polygon') {
      const coordinates = geometry.coordinates as number[][][];
      if (coordinates.length > 0) {
        const cleanedRing = coordinates[0].map((coord: number[]) => [coord[0], coord[1]] as Coordinate);
        return [cleanedRing];
      }
    }

    console.warn('Unsupported geometry type:', geometry.type);
    return [];
    
  } catch (error) {
    console.error('Error processing GeoJSON:', error);
    return [];
  }
}

/**
 * Get the Chile outline, falling back to hardcoded data if needed.
 */
export function getChileOutlineWithFallback(): Coordinate[][] {
  const outline = getChileOutline();
  if (outline.length > 0) {
    return outline;
  }
  // If GeoJSON processing failed, return an empty array
  // The app will still work with an empty outline (it just won't show Chile's shape)
  console.warn('Failed to load Chile outline from GeoJSON, using empty array');
  return [];
}

// Re-export the raw GeoJSON for advanced use cases
export { default as chileGeoJsonRaw } from './chile-outline.json';

// Import railroad data from KML (converted to JSON)
import railroadsRaw from './railroads.json';

// Type for railroad feature
export interface RailroadFeature {
  name: string;
  description: string;
  type: string;
  coords: Coordinate[];
}

/**
 * Get all railroad features from the KML data
 */
export function getRailroadFeatures(): RailroadFeature[] {
  return railroadsRaw as RailroadFeature[];
}

// Re-export raw railroads data for advanced use cases
export { default as railroadsRaw } from './railroads.json';

// Export the processed railways with metadata
export { getRailways, RAILWAYS, type Railway } from './railways';
