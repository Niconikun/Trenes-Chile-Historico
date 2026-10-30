// This file contains the railway data from the KMZ file
// with enriched metadata (categories, dates, etc.)

import railwaysCombined from './railways-combined.json';

// Type for coordinate pairs [longitude, latitude]
export type Coordinate = [number, number];

export interface Railway {
  id: string;
  name: string;
  cat: string; // troncal-sur, troncal-norte, ramal, minero, internacional
  op: string;
  gauge: string;
  km: number;
  opened: number | null;
  closed: number | null;
  desc: string;
  notes?: string;
  coords_count?: number;
  region_guess?: string;
  source?: string;
  coords: Coordinate[];
}

// Process all railway entries
function processRailwayData(): Railway[] {
  const processed: Railway[] = [];
  
  for (const entry of railwaysCombined as any[]) {
    processed.push({
      id: entry.id || `auto-${processed.length}`,
      name: entry.name || `Unnamed Railway ${processed.length}`,
      cat: entry.cat || 'ramal',
      op: entry.op || '',
      gauge: entry.gauge || '1.676 mm',
      km: entry.km || 0,
      opened: entry.opened !== null && entry.opened !== undefined ? entry.opened : null,
      closed: entry.closed !== null && entry.closed !== undefined ? entry.closed : null,
      desc: entry.desc || '',
      notes: entry.notes || '',
      coords_count: entry.coords_count || entry.coords.length || 0,
      region_guess: entry.region_guess || '',
      source: entry.source || '',
      coords: entry.coords.map((c: number[]) => [c[0], c[1]] as Coordinate)
    });
  }
  
  return processed;
}

// Export the processed data
const RAILWAYS: Railway[] = processRailwayData();

// Also provide a function to get the data
export function getRailways(): Railway[] {
  return RAILWAYS;
}

export { RAILWAYS };
