/// <reference types="react" />
/// <reference types="react-dom" />

import React, { useState, useEffect, useMemo, useRef } from "react";
import { getChileOutlineWithFallback, getRailways, type Coordinate, type Railway } from "./data";

// ============================================================
// BASE DE DATOS: vías férreas históricas de Chile
// Fechas y trazados aproximados (los años corresponden en general
// a la inauguración del tramo principal y al cese del servicio
// de pasajeros y/o carga). Coordenadas: [lon, lat] desde KMZ.
// Categorías:
//  troncal-sur   = Red Sur (EFE, Valparaíso–Puerto Montt)
//  troncal-norte = Longitudinal Norte (La Calera–Iquique)
//  ramal         = ramales locales
//  minero        = ferrocarriles mineros / salitreros
//  internacional = conexiones trasandinas / binacionales
// ============================================================

// Load railway data from KMZ file with enriched metadata
const RAIL_DB: Railway[] = getRailways();

// Note: The KMZ file contains 127 railway lines with accurate coordinates.
// About 41 have been matched with metadata from the original curated database.
// The remaining 86 lines need manual review to add opening/closing dates and descriptions.
// You can modify the metadata in src/data/railways.ts or here directly.

// For now, just use the data as-is

// ============================================================
// STATIONS DATABASE
// ============================================================

const STATIONS_DB: Record<string, Array<[number, number, string]>> = {
  "caldera-copiapo": [[-70.86, -27.07, "Caldera"], [-70.6, -27.25, "Barranquillas"], [-70.39, -27.37, "Copiapó"]],
  "long-norte": [
    [-69.9, -20.4, "Pintados"], [-70.4, -22.5, "Calama"], [-70.5, -24.3, "Chañaral"],
    [-70.7, -26.0, "Diego de Almagro"], [-70.8, -28.6, "Vallenar"], [-71.25, -29.9, "La Serena"],
    [-71.6, -31.2, "Ovalle"], [-71.2, -32.82, "La Calera"]
  ],
  "valpo-santiago": [[-71.6, -33.05, "Valparaíso"], [-71.3, -33.0, "Viña del Mar"], [-70.9, -32.8, "Quillota"], [-70.65, -33.1, "Lampa"], [-70.7, -33.45, "Santiago"]],
  "long-sur-1": [[-70.7, -33.45, "Santiago"], [-70.75, -34.17, "Rancagua"], [-71.24, -34.98, "Curicó"], [-71.66, -35.43, "Talca"], [-71.8, -36.0, "San Javier"], [-72.1, -36.6, "Chillán"]],
  "long-sur-2": [[-72.1, -36.6, "Chillán"], [-72.6, -37.0, "San Rosendo"], [-72.9, -37.28, "Laja"], [-73.0, -36.95, "Yumbel"], [-73.1, -36.72, "Talcahuano"]],
  "long-sur-3": [[-72.9, -37.28, "San Rosendo"], [-72.7, -37.7, "Collipulli"], [-72.35, -38.23, "Victoria"], [-72.5, -38.5, "Temuco"]],
  "trasandino": [[-70.6, -32.83, "Los Andes"], [-70.35, -32.8, "Río Blanco"], [-70.05, -32.82, "Juncal"]],
  "arica-lapaz": [[-70.3, -18.48, "Arica"], [-69.95, -18.3, "Chacalluta"], [-69.7, -18.0, "Visviri"], [-69.4, -17.9, "La Paz"]],
  "fcab": [[-70.4, -23.65, "Antofagasta"], [-69.8, -23.35, "Mejillones"], [-69.3, -22.4, "Calama"], [-68.5, -21.4, "Ollagüe"]],
  "melipilla": [[-70.7, -33.45, "Santiago"], [-70.85, -33.6, "San Bernardo"], [-71.0, -33.8, "Buin"], [-71.2, -33.99, "Melipilla"]],
  "talca-constitucion": [[-71.66, -35.43, "Talca"], [-71.9, -35.3, "San Clemente"], [-72.1, -35.27, "Maule"], [-72.3, -35.33, "Constitución"]],
  "coronel": [[-72.9, -36.83, "Concepción"], [-73.15, -37.03, "Coronel"], [-73.15, -37.08, "Lota"], [-73.25, -37.3, "Lota Alto"], [-73.35, -37.47, "Curanilahue"]],
};

const CATS = {
  "troncal-sur": { label: "Troncal Red Sur (EFE)", color: "#1d4ed8" },
  "troncal-norte": { label: "Longitudinal Norte", color: "#d97706" },
  ramal: { label: "Ramales", color: "#0d9488" },
  minero: { label: "Mineros / salitreros", color: "#b91c1c" },
  internacional: { label: "Internacionales", color: "#7c3aed" },
};

// Contorno de Chile desde GeoJSON (preciso) - array de poligonos (continente + islas)
const CHILE_OUTLINE: Coordinate[][] = getChileOutlineWithFallback();

// Ciudades principales
const CITIES = [
  ["Arica", -70.29, -18.5], ["Cuya", -70.1333, -19.1167], ["Iquique", -70.13, -20.25],
  ["Pozo Almonte", -69.8, -20.2696], ["Lagunas", -69.6833, -20.9829], ["Tocopilla", -70.19, -22.09],
  ["Chuquicamata", -68.93, -22.32], ["María Elena", -69.67, -22.35], ["Calama", -68.92, -22.45],
  ["Mejillones", -70.45, -23.1], ["Toconao", -68.0166, -23.1829], ["Antofagasta", -70.4, -23.65],
  ["Taltal", -70.47, -25.4], ["Chañaral", -70.6215, -26.3481], ["Diego de Almagro", -70.05, -26.3696],
  ["Caldera", -70.83, -27.0696], ["Copiapó", -70.33, -27.3718], ["Tierra Amarilla", -70.28, -27.48],
  ["Huasco", -71.22, -28.4696], ["Vallenar", -70.76, -28.57], ["La Serena", -71.25, -29.9],
  ["Coquimbo", -71.3436, -29.9529], ["Vicuña", -70.74, -30.0295], ["Ovalle", -71.1995, -30.6094],
  ["Combarbalá", -71.0, -31.18], ["Illapel", -71.17, -31.6296], ["Salamanca", -70.98, -31.7796],
  ["La Ligua", -71.24, -32.46], ["San Felipe", -70.72, -32.75], ["Los Andes", -70.6, -32.8296],
  ["Quillota", -71.26, -32.88], ["Viña del Mar", -71.5571, -33.0249], ["Valparaíso", -71.617, -33.0477],
  ["Santiago", -70.6505, -33.4402], ["San Antonio", -71.61, -33.5995], ["San Bernardo", -70.7, -33.6],
  ["Rancagua", -70.74, -34.17], ["Pichilemu", -72.0, -34.38], ["San Fernando", -70.99, -34.58],
  ["Curicó", -71.24, -34.98], ["Constitución", -72.42, -35.3296], ["Talca", -71.6656, -35.4302],
  ["Linares", -71.5914, -35.8507], ["Cauquenes", -72.3136, -35.9751], ["Quirihue", -72.53, -36.28],
  ["Chillán", -72.1113, -36.6068], ["Talcahuano", -73.1167, -36.7167], ["Concepción", -73.05, -36.83],
  ["Coronel", -73.16, -37.0299], ["Lota", -73.16, -37.0896], ["Los Ángeles", -72.3469, -37.4797],
  ["Curanilahue", -73.34, -37.48], ["Lebu", -73.65, -37.6096], ["Santa Bárbara", -72.02, -37.67],
  ["Angol", -72.7055, -37.8022], ["Collipulli", -72.43, -37.96], ["Victoria", -72.34, -38.2395],
  ["Lonquimay", -71.2333, -38.4333], ["Carahue", -73.17, -38.7095], ["Temuco", -72.58, -38.73],
  ["Nueva Imperial", -72.96, -38.74], ["Toltén", -73.2123, -39.2166], ["Villarrica", -72.23, -39.28],
  ["Loncoche", -72.63, -39.37], ["Valdivia", -73.2331, -39.8217], ["Los Lagos", -72.83, -39.8495],
  ["La Unión", -73.09, -40.29], ["Río Bueno", -72.96, -40.34], ["Osorno", -73.1307, -40.5787],
  ["Puerto Varas", -72.99, -41.33], ["Puerto Montt", -72.93, -41.47], ["Calbuco", -73.1947, -41.7605],
  ["Ancud", -73.83, -41.87], ["Castro", -73.7623, -42.4808], ["Chonchi", -73.794, -42.6371],
  ["Quellón", -73.6, -43.0996], ["Puerto Aysén", -72.7, -45.3999], ["Coyhaique", -72.07, -45.57],
  ["Cochrane", -72.5499, -47.2663], ["Villa O'Higgins", -72.593, -48.4669], ["Puerto Natales", -72.5117, -51.7183],
  ["Río Verde", -71.4666, -52.65], ["Punta Arenas", -70.94, -53.165], ["Puerto Williams", -67.6167, -54.9333]
];


// Proyección equirectangular estilizada
const PX = 26, PY = 26, PADX = 30, PADY = 30;
const project = ([lon, lat]) => [PADX + (lon + 77.5) * PX * 0.92, PADY + (-lat - 17.3) * PY];

const YEAR_MIN = 1850, YEAR_MAX = 2026;

const fmt = (y) => (y === null ? "hoy" : String(y));

export default function App() {
  const [year, setYear] = useState(YEAR_MAX);
  const [playing, setPlaying] = useState(false);
  const [activeCats, setActiveCats] = useState(Object.keys(CATS));
  const [showGhost, setShowGhost] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showStations, setShowStationsState] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const mapRef = useRef<SVGSVGElement | null>(null);
  const svgContainerRef = useRef<HTMLDivElement | null>(null);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setYear((y) => {
        if (y >= YEAR_MAX) { setPlaying(false); return y; }
        return y + 1;
      });
    }, 90);
    return () => clearInterval(t);
  }, [playing]);

  // Zoom and pan handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(zoom * delta, 10));
    
    // Zoom towards mouse position
    const svg = mapRef.current;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / rect.width * 420 - 10;
      const mouseY = (e.clientY - rect.top) / rect.height * 1100 - 10;
      
      const newPanX = pan.x - (mouseX - pan.x) * (newZoom - zoom) / zoom;
      const newPanY = pan.y - (mouseY - pan.y) * (newZoom - zoom) / zoom;
      
      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsPanning(true);
      const svg = mapRef.current;
      if (svg) {
        const rect = svg.getBoundingClientRect();
        setDragStart({
          x: (e.clientX - rect.left) / rect.width * 420 - 10 - pan.x,
          y: (e.clientY - rect.top) / rect.height * 1100 - 10 - pan.y
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const svg = mapRef.current;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      const currentX = (e.clientX - rect.left) / rect.width * 420 - 10;
      const currentY = (e.clientY - rect.top) / rect.height * 1100 - 10;
      setPan({
        x: currentX - dragStart.x,
        y: currentY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
  };

  // Reset zoom/pan
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Determine if cities/stations should be shown based on zoom level
  const showLabels = zoom >= 1;
  const showStationsFinal = showStations && zoom >= 1.5;

  const lineState = (l) =>
    l.opened <= year && (l.closed === null || year <= l.closed) ? "active"
      : l.opened > year ? "future"
      : "closed";

  const visible = useMemo(() => RAIL_DB.filter((l) => activeCats.includes(l.cat)), [activeCats]);
  const activeKm = useMemo(
    () => visible.filter((l) => lineState(l) === "active").reduce((s, l) => s + l.km, 0),
    [visible, year]
  );
  const activeCount = visible.filter((l) => lineState(l) === "active").length;

  const toggleCat = (c) =>
    setActiveCats((a) => (a.includes(c) ? a.filter((x) => x !== c) : [...a, c]));

  // Calculate yearly km changes
  const yearlyKmChanges = useMemo(() => {
    const changes: Record<number, { added: number; removed: number }> = {};
    
    // Initialize all years
    for (let y = YEAR_MIN; y <= YEAR_MAX; y++) {
      changes[y] = { added: 0, removed: 0 };
    }
    
    // Calculate changes
    RAIL_DB.forEach((line) => {
      if (line.opened && line.opened >= YEAR_MIN && line.opened <= YEAR_MAX) {
        changes[line.opened].added += line.km;
      }
      if (line.closed && line.closed >= YEAR_MIN && line.closed <= YEAR_MAX) {
        changes[line.closed].removed += line.km;
      }
    });
    
    return changes;
  }, [RAIL_DB]);

  // Get max value for scaling the graph
  const maxKmChange = useMemo(() => {
    let max = 0;
    for (let y = YEAR_MIN; y <= YEAR_MAX; y++) {
      const change = yearlyKmChanges[y];
      if (change) {
        max = Math.max(max, change.added, change.removed);
      }
    }
    return max;
  }, [yearlyKmChanges]);

  // años hito bajo el slider
  const milestones = [
    [1851, "Caldera–Copiapó"], [1863, "Valparaíso–Santiago"], [1884, "Nace EFE"],
    [1910, "Trasandino"], [1913, "Iquique–P.Montt unidos"], [1942, "Declive salitre"],
    [1975, "Cierra Long. Norte"], [1986, "Queronque"], [2026, "Red actual"],
  ];

  const polyline = (coords) => coords.map(project).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans transition-colors duration-300">
      {/* Encabezado */}
      <header className="header-main">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚆</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">Mapa Ferroviario Histórico de Chile</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">Vías férreas construidas entre 1851 y hoy · fechas aproximadas</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="theme-toggle"
            title="Alternar modo oscuro"
          >
            <span className="theme-toggle-icon">{darkMode ? "🌙" : "☀️"}</span>
          </button>
          <button
            onClick={() => { if (year >= YEAR_MAX) setYear(YEAR_MIN); setPlaying((p) => !p); }}
            className="btn-primary text-sm"
          >
            {playing ? "⏸ Pausar" : "▶ Animar historia"}
          </button>
        </div>
      </header>

      {/* Controles temporales */}
      <div className="control-panel">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold font-tech w-20 text-right text-[var(--text-primary)]">{year}</div>
          <input
            type="range"
            min={YEAR_MIN}
            max={YEAR_MAX}
            value={year}
            onChange={(e) => { setPlaying(false); setYear(Number(e.target.value)); }}
            className="slider-timeline"
          />
        </div>
        {/* Etiquetas hito */}
        <div className="relative h-4 mt-1 hidden md:block">
          {milestones.map(([y, label]) => (
            <div key={y} className={`milestone-label ${year === y ? "active" : ""}`} style={{ left: `${((y - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100}%` }}>
              <span className="font-tech">{y}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-3 items-center">
          {Object.entries(CATS).map(([c, v]) => (
            <button
              key={c}
              onClick={() => toggleCat(c)}
              className={`btn-category ${activeCats.includes(c) ? "btn-category-active" : "btn-category-inactive"}`}
              style={activeCats.includes(c) ? { backgroundColor: v.color } : {}}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: activeCats.includes(c) ? "white" : v.color }} />
              {v.label}
            </button>
          ))}
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] ml-2 cursor-pointer transition-colors hover:text-[var(--text-primary)]">
            <input type="checkbox" checked={showGhost} onChange={(e) => setShowGhost(e.target.checked)} className="accent-amber-600" />
            Mostrar vías ya cerradas (fantasma)
          </label>
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer transition-colors hover:text-[var(--text-primary)]">
            <input type="checkbox" checked={showStations} onChange={(e) => setShowStationsState(e.target.checked)} className="accent-amber-600" />
            Mostrar estaciones
          </label>
          <div className="ml-auto text-sm text-[var(--text-secondary)] font-tech">
            <span className="font-semibold text-[var(--text-primary)]">{activeCount}</span> líneas ·{" "}
            <span className="font-semibold text-[var(--text-primary)]">{activeKm.toLocaleString("es-CL")}</span> km de red en {year}
          </div>
        </div>
      </div>

      {/* Gráfico de cambios anuales de km */}
      <div className="graph-container mx-4 lg:mx-6 mb-4">
        <h3 className="font-semibold text-[var(--text-primary)] mb-3">
          Cambios anuales en kilómetros de red ferroviaria
        </h3>
        <div className="flex gap-4 items-end h-40 relative">
          {/* Bar chart showing km added (green) and removed (red) */}
          {Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => {
            const y = YEAR_MIN + i;
            const change = yearlyKmChanges[y] || { added: 0, removed: 0 };
            const barHeight = maxKmChange > 0 ? (change.added / maxKmChange) * 100 : 0;
            const barHeightRemoved = maxKmChange > 0 ? (change.removed / maxKmChange) * 100 : 0;
            
            // Only show bars for years with changes or every 10 years
            if (change.added === 0 && change.removed === 0 && y % 10 !== 0) {
              return null;
            }
            
            return (
              <div key={y} className="flex-1 flex flex-col items-center gap-1" style={{ height: '100%' }}>
                {/* Removed km (red bar) */}
                {change.removed > 0 && (
                  <div 
                    className="graph-bar-negative w-full"
                    style={{ height: `${barHeightRemoved}%` }}
                    title={`-${change.removed} km en ${y}`}
                  />
                )}
                {/* Added km (green bar) */}
                {change.added > 0 && (
                  <div 
                    className="graph-bar-positive w-full"
                    style={{ height: `${barHeight}%` }}
                    title={`+${change.added} km en ${y}`}
                  />
                )}
                {/* Year label */}
                <span className="text-[10px] text-[var(--text-muted)] w-full text-center truncate">
                  {y}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span>km añadidos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span>km removidos</span>
          </div>
          <span className="ml-auto">Escala: {maxKmChange.toLocaleString('es-CL')} km máx.</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 p-4 lg:p-6 max-w-[1400px] mx-auto">
        {/* Mapa */}
        <div className="flex-1 card overflow-hidden">
          <div 
            ref={svgContainerRef}
            className="map-container"
          >
            <svg 
              ref={mapRef} 
              viewBox="-10 -10 420 1100" 
              className="w-full block" 
              style={{ minWidth: 320, cursor: isPanning ? 'grabbing' : 'grab' }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
                </filter>
              </defs>
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                <rect x={-10} y={-10} width={420} height={1100} fill="var(--map-bg)" />
              {/* Contorno de Chile - multiple polygons for mainland and all islands */}
              {CHILE_OUTLINE.map((polygon: Coordinate[], idx: number) => {
                const polygonPath = polygon.map(project).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
                return (
                  <polygon
                    key={`chile-polygon-${idx}`}
                    points={polygonPath}
                    fill="var(--map-chile-fill)"
                    stroke="var(--map-chile-stroke)"
                    strokeWidth={1.2 / zoom}
                  />
                );
              })}
              {/* Líneas cerradas (fantasmas) */}
              {showGhost && visible.filter((l) => lineState(l) === "closed").map((l) => (
                <polyline key={"g" + l.id} points={polyline(l.coords)} fill="none" stroke="var(--text-muted)"
                  strokeWidth={1.5 / zoom} strokeDasharray="4 4" opacity={0.6} />
              ))}
              {/* Líneas activas */}
              {visible.filter((l) => lineState(l) === "active").map((l) => (
                <g key={l.id}>
                  <polyline
                    points={polyline(l.coords)}
                    fill="none"
                    stroke={CATS[l.cat as keyof typeof CATS].color}
                    strokeWidth={(hovered === l.id || selected === l.id ? 6 : 3.5) / zoom}
                    strokeLinecap="round"
                    className="cursor-pointer transition-all"
                    opacity={0.95}
                    onMouseEnter={() => setHovered(l.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setSelected(l.id)}
                  />
                  {/* zona de clic amplia */}
                  <polyline
                    points={polyline(l.coords)}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={12 / zoom}
                    className="cursor-pointer"
                    onMouseEnter={() => setHovered(l.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setSelected(l.id)}
                  />
                </g>
              ))}
              
              {/* Estaciones de tren (solo visibles con zoom) */}
              {showStationsFinal && visible.map((l) => {
                const stations = STATIONS_DB[l.id as keyof typeof STATIONS_DB];
                if (!stations) return null;
                return stations.map(([lon, lat, name], idx) => {
                  const [x, y] = project([lon, lat]);
                  const isActive = lineState(l) === "active";
                  return (
                    <g key={`${l.id}-station-${idx}`}>
                      <circle 
                        cx={x} 
                        cy={y} 
                        r={isActive ? 3.5 / zoom : 2.5 / zoom}
                        fill={isActive ? CATS[l.cat as keyof typeof CATS].color : "var(--text-muted)"}
                        stroke="white" 
                        strokeWidth={0.5 / zoom}
                        filter={isActive ? "url(#shadow)" : "none"}
                      />
                      {zoom > 2 && (
                        <text 
                          x={x + 4} 
                          y={y - 2} 
                          fontSize={8 / zoom}
                          fill="var(--text-secondary)"
                          fontWeight="bold"
                        >{name}</text>
                      )}
                    </g>
                  );
                });
              })}
              
              {/* Ciudades (solo visibles con suficiente zoom) */}
              {showLabels && CITIES.map(([name, lon, lat]) => {
                const [x, y] = project([lon as number, lat as number]);
                return (
                  <g key={name}>
                    <circle cx={x} cy={y} r={2.6 / zoom} fill="var(--text-primary)" />
                    {zoom > 1.2 && (
                      <text x={x + 5} y={y + 2.5} fontSize={9 / zoom} fill="var(--text-secondary)">{name}</text>
                    )}
                  </g>
                );
              })}
              
              {/* Tooltip flotante */}
              {hovered && (() => {
                const l = RAIL_DB.find((r) => r.id === hovered);
                if (!l) return null;
                const [x, y] = project(l.coords[Math.floor(l.coords.length / 2)]);
                return (
                  <g>
                    <rect x={x + 8} y={y - 30} width={Math.min(230, 24 + l.name.length * 5.6)} height={34} rx={5} fill="var(--bg-secondary)" opacity={0.95} />
                    <text x={x + 16} y={y - 17} fontSize={10 / zoom} fill="var(--text-primary)" fontWeight="bold">{l.name}</text>
                    <text x={x + 16} y={y - 6} fontSize={9 / zoom} fill="var(--text-secondary)">{fmt(l.opened)} – {fmt(l.closed)} · {l.km} km</text>
                  </g>
                );
              })()}
              </g>
            </svg>
            {/* Reset zoom button */}
            {zoom !== 1 && (
              <button
                onClick={resetView}
                className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 shadow-lg rounded-full p-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-smooth z-10"
                style={{ transform: 'translate(-50%, -50%)' }}
              >
                <span className="text-lg text-slate-800 dark:text-slate-200">🔍</span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-[var(--text-muted)] px-4 py-2 border-t border-[var(--border-light)]">
            Mapa estilizado: trazados y contornos aproximados. Pulsa una línea para ver su ficha. 
            <strong>Rueda del mouse para hacer zoom, arrastrar para mover el mapa.</strong>
          </p>
        </div>

        {/* Panel lateral */}
        <aside className="w-full lg:w-96 space-y-4">
          {selected ? (() => {
            const l = RAIL_DB.find((r) => r.id === selected);
            const st = lineState(l);
            return (
              <div className="card border-t-4" style={{ borderTopColor: CATS[l.cat].color }}>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-serif font-bold text-slate-900 leading-snug">{l.name}</h2>
                  <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-lg leading-none transition-colors">✕</button>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="badge text-white" style={{ backgroundColor: CATS[l.cat].color }}>{CATS[l.cat].label}</span>
                  <span className={`badge ${st === "active" ? "badge-success" : "badge"}`}>
                    {st === "active" ? `En servicio en ${year}` : st === "future" ? `Aún no construida en ${year}` : `Cerrada en ${year}`}
                  </span>
                </div>
                <dl className="mt-4 text-sm divide-y divide-slate-100">
                  <div className="flex justify-between py-1.5"><dt className="text-slate-500">Inauguración</dt><dd className="font-medium font-tech">{l.opened}</dd></div>
                  <div className="flex justify-between py-1.5"><dt className="text-slate-500">Cierre</dt><dd className="font-medium font-tech">{l.closed === null ? "— (activa)" : l.closed}</dd></div>
                  <div className="flex justify-between py-1.5"><dt className="text-slate-500">Longitud</dt><dd className="font-medium font-tech">{l.km} km</dd></div>
                  <div className="flex justify-between py-1.5"><dt className="text-slate-500">Trocha</dt><dd className="font-medium text-right">{l.gauge}</dd></div>
                  <div className="flex justify-between py-1.5"><dt className="text-slate-500">Operador</dt><dd className="font-medium text-right">{l.op}</dd></div>
                </dl>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{l.desc}</p>
              </div>
            );
          })() : (
            <div className="card">
              <h2 className="font-serif font-bold text-slate-900 mb-2">Cómo usar el mapa</h2>
              <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Mueve el <b>slider de años</b> (1850–2026) o pulsa <b>Animar historia</b> para ver la red crecer y decaer.</li>
                <li>Las líneas <b>punteadas grises</b> son vías ya cerradas en el año mostrado.</li>
                <li>Filtra por tipo de vía con los botones de colores.</li>
                <li>Pasa el mouse o haz clic sobre una línea para ver su ficha histórica.</li>
                <li><b>Rueda del mouse</b> para hacer zoom, <b>arrastra</b> para mover el mapa.</li>
                <li>Al hacer zoom, verás <b>estaciones</b> y <b>ciudades</b> con más detalle.</li>
              </ul>
            </div>
          )}

          {/* Base de datos */}
          <div className="card">
            <h2 className="font-serif font-bold text-slate-900 mb-3 text-sm">Base de datos · {RAIL_DB.length} vías registradas</h2>
            <div className="max-h-64 overflow-auto pr-1">
              <table className="table-compact">
                <thead className="text-slate-500 sticky top-0 bg-white">
                  <tr className="text-left">
                    <th className="py-1">Vía</th><th>Apertura</th><th>Cierre</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RAIL_DB.map((l) => (
                    <tr key={l.id} className={`cursor-pointer hover:bg-slate-50 ${selected === l.id ? "bg-amber-50" : ""}`}
                      onClick={() => setSelected(l.id)}>
                      <td className="py-1.5 pr-2">
                        <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ backgroundColor: CATS[l.cat].color }} />
                        {l.name}
                      </td>
                      <td className="font-tech">{l.opened}</td>
                      <td className="font-tech">{l.closed ?? "activa"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contexto histórico */}
          <div className="bg-slate-900 text-slate-300 rounded-xl p-5 text-xs leading-relaxed card">
            <h2 className="font-serif font-bold text-white mb-2 text-sm">Contexto</h2>
            <p>La red chilena nació con el Caldera–Copiapó (1851) y creció primero en el norte minero. En 1913 quedó unida la red troncal de Iquique a Puerto Montt, superando los <b className="text-white">7.000 km</b> con sus ramales. La crisis del salitre, el terremoto de 1960, la pérdida de subsidios (1979) y la competencia caminera redujeron la red: el Longitudinal Norte cerró pasajeros en 1975 y más de veinte ramales fueron levantados. Hoy la red troncal sur y servicios metropolitanos (Metrotren, Biotrén, Terrasur) conviven con proyectos de reactivación.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}