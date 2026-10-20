// This file will contain the railway data from the KMZ file
// with enriched metadata (categories, dates, etc.)

import railroadsRaw from './railroads.json';

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
  coords: Coordinate[];
}

// Metadata from the original curated App.tsx database
const CURATED_METADATA: Record<string, Omit<Railway, 'id' | 'name' | 'coords'>> = {
  'caldera-copiapo': { cat: 'minero', op: 'Ferrocarril de Copiapó (privado) / Estado', gauge: '1.676 mm (luego 1.000 mm)', km: 81, opened: 1851, closed: 1975, desc: 'Primer ferrocarril de Chile y de Sudamérica (25 dic. 1851). Unión el puerto de Caldera con Copiapó para la minería de plata; luego integrado al Longitudinal Norte.' },
  'taltal': { cat: 'ramal', op: 'Ferrocarril de Taltal / EFE', gauge: '1.000 mm', km: 68, opened: 1879, closed: 1976, desc: 'Ramal minero que unía el puerto de Taltal con las minas de cobre de Cerrillos, en la pampa atacameña.' },
  'potrerillos': { cat: 'minero', op: 'Ferrocarril El Salado (Andes Copper / Anaconda)', gauge: '1.000 mm', km: 155, opened: 1919, closed: 1977, desc: 'Ferrocarril de la minería del cobre (El Salvador–Potrerillos) desde el muelle de El Salado, cerca de Chañaral.' },
  'tocopilla-toco': { cat: 'minero', op: 'The Tocopilla Railway Co. (privado)', gauge: '1.435 mm', km: 145, opened: 1890, closed: 1996, desc: 'Ferrocarril minero de la pampa de Toco y María Elena; el último gran ramal salitrero/minero del norte en cerrar.' },
  'fcab': { cat: 'internacional', op: 'FCAB (privado)', gauge: '1.000 mm', km: 440, opened: 1873, closed: null, desc: 'Línea minera de la Compañía Huanchaca; une Antofagasta con el altiplano (Ollagüe) y continúa hacia Bolivia. Hoy opera carga de minerales.' },
  'fcst': { cat: 'minero', op: 'FC Salitrero de Tarapacá / Estado', gauge: '1.000 mm', km: 160, opened: 1871, closed: 1942, desc: 'Red salitrera de la provincia de Tarapacá (construida bajo soberanía peruana): Pisagua–Pintados con ramal a Iquique.' },
  'junin': { cat: 'minero', op: 'Ferrocarril de Junín / Estado', gauge: '1.000 mm', km: 58, opened: 1904, closed: 1937, desc: 'Ramal de las oficinas salitreras al este de Iquique; decayó con el fin del salitre natural.' },
  'long-norte': { cat: 'troncal-norte', op: 'EFE (Red Norte) / Ferronor', gauge: '1.000 mm', km: 1160, opened: 1913, closed: 1975, desc: 'Troncal del norte, trocha métrica, que unificó los ramales salitreros y mineros entre La Calera y Pintados.' },
  'pintados-iquique': { cat: 'troncal-norte', op: 'EFE (Red Norte)', gauge: '1.000 mm', km: 72, opened: 1928, closed: 1975, desc: 'Prolongación del Longitudinal Norte hasta Iquique por Alto Hospicio, reemplazando al antiguo FC Salitrero.' },
  'arica-lapaz': { cat: 'internacional', op: 'EFE / FC Arica–La Paz (Chile–Bolivia)', gauge: '1.435 mm', km: 206, opened: 1913, closed: null, desc: 'Ferrocarril internacional construido tras el tratado con Bolivia; une Arica con La Paz vía Visviri. Hoy opera carga (y un servicio turístico).' },
  'tacna-arica': { cat: 'internacional', op: 'Perú / Chile (compartido)', gauge: '1.435 mm', km: 62, opened: 1856, closed: null, desc: 'Uno de los ferrocarriles más antiguos de Sudamérica (1856); une Arica con Tacna.' },
  'tongoy': { cat: 'minero', op: 'Privado', gauge: '1.435 mm', km: 27, opened: 1867, closed: 1928, desc: 'Pequeño ferrocarril minero de cobre entre el puerto de Tongoy y el mineral de Tamaya, cerca de La Serena.' },
  'seccion-interior': { cat: 'troncal-norte', op: 'FC de La Serena / Estado', gauge: '1.000 mm', km: 235, opened: 1873, closed: 1971, desc: 'Vía interior del norte chico: de La Serena a Puntilla (Ovalle) por los valles del Elqui y Limarí (1873), unida desde 1910 con San Marcos y la costa.' },
  'cabildo': { cat: 'troncal-norte', op: 'EFE (Red Norte)', gauge: '1.000 mm', km: 71, opened: 1910, closed: 1981, desc: 'Tramo del Longitudinal Norte por el valle del Aconcagua hacia Petorca y Cabildo; el último tramo construido en el norte.' },
  'valpo-santiago': { cat: 'troncal-sur', op: 'FC de Valparaíso a Santiago / EFE', gauge: '1.676 mm', km: 180, opened: 1863, closed: 1986, desc: 'Línea troncal entre el puerto principal y la capital (1863), con la cuesta de Las Vacas.' },
  'llayllay-andes': { cat: 'ramal', op: 'EFE', gauge: '1.676 mm', km: 26, opened: 1871, closed: null, desc: 'Ramal de la Red Sur hacia Los Andes; puerta al paso ferroviario internacional hacia Argentina.' },
  'trasandino': { cat: 'internacional', op: 'FC Trasandino Chileno–Argentino', gauge: '1.000 mm (cremallera)', km: 74, opened: 1910, closed: 1979, desc: 'Único ferrocarril que cruzó la cordillera de los Andes (con cremallera hasta Las Cuevas); unía Los Andes con Mendoza y Buenos Aires.' },
  'long-sur-1': { cat: 'troncal-sur', op: 'FC del Sur / EFE', gauge: '1.676 mm', km: 400, opened: 1873, closed: null, desc: 'Tramo inicial del ferrocarril al sur: Santiago–San Bernardo (1857), Rancagua (1859), Curicó (1868), Talca (1871), Chillán (1873).' },
  'long-sur-2': { cat: 'troncal-sur', op: 'FC del Sur / EFE', gauge: '1.676 mm', km: 180, opened: 1873, closed: null, desc: 'Enlace entre Chillán, San Rosendo y los puertos de Talcahuano y Concepción (1870s); corazón ferroviario del Biobío.' },
  'long-sur-3': { cat: 'troncal-sur', op: 'EFE', gauge: '1.676 mm', km: 250, opened: 1891, closed: null, desc: 'Avance de la red hacia La Frontera: Renaico, Victoria y Temuco (1891), con la colonización de La Araucanía.' },
  'long-sur-4': { cat: 'troncal-sur', op: 'EFE', gauge: '1.676 mm', km: 330, opened: 1906, closed: null, desc: 'Conexión del valle central sur: Loncoche, Antilhue, Valdivia y Osorno (1899), enlazada con Temuco en 1906.' },
  'long-sur-5': { cat: 'troncal-sur', op: 'EFE', gauge: '1.676 mm', km: 115, opened: 1913, closed: null, desc: 'Tramo final de la Red Sur: Osorno–Puerto Varas–Puerto Montt (1912–13).' },
  'melipilla': { cat: 'ramal', op: 'EFE', gauge: '1.676 mm', km: 61, opened: 1893, closed: 1994, desc: 'Línea del surponiente de Santiago hacia Melipilla y el valle de Mallarauco. Cerrada en los 90.' },
  'pichilemu': { cat: 'ramal', op: 'EFE', gauge: '1.676 mm', km: 98, opened: 1924, closed: 1980, desc: 'Ramal hacia la costa de Colchagua, terminado en los años 20; trasladó el comercio agrícola al puerto de Pichilemu.' },
  'hualane': { cat: 'ramal', op: 'EFE', gauge: '1.676 mm', km: 90, opened: 1896, closed: 1977, desc: 'Ramal agrícola del valle del Mataquito, de Curicó hacia Hualañé y la costa de Vichuquén.' },
  'talca-constitucion': { cat: 'ramal', op: 'EFE', gauge: '1.676 mm', km: 88, opened: 1928, closed: null, desc: 'Último ramal de pasajeros de la Red Sur que sigue operativo; corría en busello por la costa del Maule.' },
  'rucapequen': { cat: 'ramal', op: 'EFE', gauge: '1.676 mm', km: 65, opened: 1915, closed: 1997, desc: 'Línea de carga por la costa del Biobío hacia Penco y Lirquén, para el embarque de cereales y madera del Itata.' },
  'coronel': { cat: 'ramal', op: 'FC de Concepción a Curanilahue / EFE', gauge: '1.676 mm', km: 120, opened: 1890, closed: 1995, desc: 'Línea del carbón: sirvió a los yacimientos de Lota y Coronel, y siguió hacia Curanilahue.' },
  'angol': { cat: 'ramal', op: 'EFE', gauge: '1.676 mm', km: 65, opened: 1876, closed: 1985, desc: 'Ramal del Biobío hacia Angol, en el marco de la ocupación de La Araucanía.' },
  'lonquimay': { cat: 'ramal', op: 'EFE', gauge: '1.676 mm', km: 120, opened: 1913, closed: 1983, desc: 'Ramal hacia la precordillera de La Araucanía y el alto Biobío (malón de altura hacia Lonquimay); cerrado en los 80.' },
  'antilhue': { cat: 'ramal', op: 'EFE', gauge: '1.676 mm', km: 40, opened: 1900, closed: 1980, desc: 'Ramal del empalme de Antilhue a la ciudad de Valdivia; dañado por el terremoto de 1960, sobrevivió hasta los 80.' },
  'chiloe': { cat: 'ramal', op: 'Ferrocarril de Chiloé / EFE', gauge: '1.000 mm', km: 77, opened: 1912, closed: 1957, desc: 'Ferrocarril de trocha métrica que recorrió la isla grande entre Ancud y Castro (1912–1957).' },
};

// Mapping from keywords to curated IDs
const NAME_MAPPING: Record<string, string> = {
  // Northern lines
  'caldera': 'caldera-copiapo',
  'copiapo': 'caldera-copiapo',
  'taltal': 'taltal',
  'el salado': 'potrerillos',
  'potrerillos': 'potrerillos',
  'tocopilla': 'tocopilla-toco',
  'toco': 'tocopilla-toco',
  'fcab': 'fcab',
  'antofagasta a bolivia': 'fcab',
  'fc as': 'fcab',
  'salitrero de tarapaca': 'fcst',
  'pisagua': 'fcst',
  'iquique': 'fcst',
  'junin': 'junin',
  'longitudinal norte': 'long-norte',
  'la calera': 'long-norte',
  'pintados': 'long-norte',
  'arica': 'arica-lapaz',
  'la paz': 'arica-lapaz',
  'tacna': 'tacna-arica',
  'tongoy': 'tongoy',
  'tamaya': 'tongoy',
  'seccion interior': 'seccion-interior',
  'puntilla': 'seccion-interior',
  'san marcos': 'seccion-interior',
  'cabildo': 'cabildo',
  
  // Central/Southern lines
  'valparaiso': 'valpo-santiago',
  'santiago': 'valpo-santiago',
  'llay': 'llayllay-andes',
  'los andes': 'llayllay-andes',
  'trasandino': 'trasandino',
  'mendoza': 'trasandino',
  'las cuevas': 'trasandino',
  'longitudinal sur': 'long-sur-1',
  'rancagua': 'long-sur-1',
  'curico': 'long-sur-1',
  'chillan': 'long-sur-2',
  'san rosendo': 'long-sur-2',
  'talcahuano': 'long-sur-2',
  'concepcion': 'long-sur-2',
  'victoria': 'long-sur-3',
  'temuco': 'long-sur-3',
  'valdivia': 'long-sur-4',
  'osorno': 'long-sur-4',
  'puerto montt': 'long-sur-5',
  'melipilla': 'melipilla',
  'pichilemu': 'pichilemu',
  'san fernando': 'pichilemu',
  'hualane': 'hualane',
  'hualañé': 'hualane',
  'talca': 'talca-constitucion',
  'constitucion': 'talca-constitucion',
  'rucapequen': 'rucapequen',
  'coronel': 'coronel',
  'lota': 'coronel',
  'curanilahue': 'coronel',
  'angol': 'angol',
  'lonquimay': 'lonquimay',
  'curacautin': 'lonquimay',
  'antilhue': 'antilhue',
  'chiloe': 'chiloe',
  'ancud': 'chiloe',
  'castro': 'chiloe',
};

// Function to find best match based on name
function findMatchByName(kmzName: string): { metadata: Omit<Railway, 'id' | 'name' | 'coords'>; id: string } | null {
  const nameLower = kmzName.toLowerCase();
  
  // Try exact ID match
  if (CURATED_METADATA[nameLower]) {
    return { id: nameLower, metadata: CURATED_METADATA[nameLower] };
  }
  
  // Try keyword matching
  for (const keyword in NAME_MAPPING) {
    if (nameLower.indexOf(keyword.toLowerCase()) >= 0) {
      const id = NAME_MAPPING[keyword];
      return { id, metadata: CURATED_METADATA[id] };
    }
  }
  
  return null;
}

// Process all KMZ entries
function processRailwayData(): Railway[] {
  const processed: Railway[] = [];
  let autoIdCounter = 0;
  
  for (const kmz of railroadsRaw as any[]) {
    const match = findMatchByName(kmz.name);
    
    if (match) {
      processed.push({
        id: match.id,
        name: kmz.name || match.metadata.desc.split('.')[0],
        cat: match.metadata.cat || 'ramal',
        op: match.metadata.op || '',
        gauge: match.metadata.gauge || '1.676 mm',
        km: match.metadata.km || 0,
        opened: match.metadata.opened || null,
        closed: match.metadata.closed || null,
        desc: kmz.description || match.metadata.desc || '',
        coords: kmz.coords.map((c: number[]) => [c[0], c[1]] as Coordinate)
      });
    } else {
      // No match found - create entry with defaults and TODO for dates
      const id = `auto-${autoIdCounter++}`;
      const name = kmz.name || `Unnamed Railway ${autoIdCounter}`;
      
      // Try to auto-categorize based on name
      let cat = 'ramal';
      const nameLower = name.toLowerCase();
      
      if (nameLower.indexOf('troncal') >= 0) {
        cat = 'troncal-sur';
      } else if (nameLower.indexOf('minero') >= 0 || nameLower.indexOf('salitrero') >= 0 || 
                 nameLower.indexOf('cobre') >= 0 || nameLower.indexOf('salitre') >= 0) {
        cat = 'minero';
      } else if (nameLower.indexOf('internacional') >= 0 || nameLower.indexOf('argentina') >= 0 || 
                 nameLower.indexOf('bolivia') >= 0 || nameLower.indexOf('peru') >= 0 || 
                 nameLower.indexOf('mendoza') >= 0) {
        cat = 'internacional';
      } else if (nameLower.indexOf('longitudinal norte') >= 0 || nameLower.indexOf('red norte') >= 0) {
        cat = 'troncal-norte';
      }
      
      processed.push({
        id,
        name,
        cat,
        op: '',
        gauge: '1.676 mm',
        km: 0,
        opened: null, // TODO: Add opening year
        closed: null, // TODO: Add closing year (null if still active)
        desc: kmz.description || '',
        coords: kmz.coords.map((c: number[]) => [c[0], c[1]] as Coordinate)
      });
    }
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
