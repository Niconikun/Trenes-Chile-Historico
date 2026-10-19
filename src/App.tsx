/// <reference types="react" />
/// <reference types="react-dom" />

import React, { useState, useEffect, useMemo, useRef } from "react";
import { getChileOutlineWithFallback } from "./data";

// ============================================================
// BASE DE DATOS: vías férreas históricas de Chile
// Fechas y trazados aproximados (los años corresponden en general
// a la inauguración del tramo principal y al cese del servicio
// de pasajeros y/o carga). Coordenadas: [lon, lat] simplificadas.
// Categorías:
//  troncal-sur   = Red Sur (EFE, Valparaíso–Puerto Montt)
//  troncal-norte = Longitudinal Norte (La Calera–Iquique)
//  ramal         = ramales locales
//  minero        = ferrocarriles mineros / salitreros
//  internacional = conexiones trasandinas / binacionales
// ============================================================
const RAIL_DB = [
  // ---------- NORTE GRANDE Y NORTE CHICO ----------
  {
    id: "caldera-copiapo",
    name: "Ferrocarril Caldera–Copiapó",
    cat: "minero",
    op: "Ferrocarril de Copiapó (privado) / Estado",
    gauge: "1.676 mm (luego 1.000 mm)",
    km: 81,
    opened: 1851,
    closed: 1975,
    desc: "Primer ferrocarril de Chile y de Sudamérica (25 dic. 1851). Unió el puerto de Caldera con Copiapó para la minería de plata; luego integrado al Longitudinal Norte.",
    coords: [[-70.86, -27.07], [-70.6, -27.25], [-70.39, -27.37], [-69.9, -26.9], [-69.55, -26.4]],
  },
  {
    id: "taltal",
    name: "Ramal Taltal–Cerrillos",
    cat: "ramal",
    op: "Ferrocarril de Taltal / EFE",
    gauge: "1.000 mm",
    km: 68,
    opened: 1879,
    closed: 1976,
    desc: "Ramal minero que unía el puerto de Taltal con las minas de cobre de Cerrillos, en la pampa atacameña.",
    coords: [[-70.5, -25.4], [-70.3, -25.6], [-70.1, -25.9]],
  },
  {
    id: "potrerillos",
    name: "Ramal El Salado–Potrerillos",
    cat: "minero",
    op: "Ferrocarril El Salado (Andes Copper / Anaconda)",
    gauge: "1.000 mm",
    km: 155,
    opened: 1919,
    closed: 1977,
    desc: "Ferrocarril de la minería del cobre (El Salvador–Potrerillos) desde el muelle de El Salado, cerca de Chañaral.",
    coords: [[-70.62, -26.35], [-70.1, -26.45], [-69.75, -26.5]],
  },
  {
    id: "tocopilla-toco",
    name: "Ferrocarril de Tocopilla al Toco",
    cat: "minero",
    op: "The Tocopilla Railway Co. (privado)",
    gauge: "1.435 mm",
    km: 145,
    opened: 1890,
    closed: 1996,
    desc: "Ferrocarril minero de la pampa de Toco y María Elena; el último gran ramal salitrero/minero del norte en cerrar.",
    coords: [[-70.2, -22.09], [-69.8, -22.15], [-69.4, -22.2]],
  },
  {
    id: "fcab",
    name: "Ferrocarril de Antofagasta a Bolivia (FCAB)",
    cat: "internacional",
    op: "FCAB (privado)",
    gauge: "1.000 mm",
    km: 440,
    opened: 1873,
    closed: null,
    desc: "Línea minera de la Compañía Huanchaca; une Antofagasta con el altiplano (Ollagüe) y continúa hacia Bolivia. Hoy opera carga de minerales.",
    coords: [[-70.4, -23.65], [-69.8, -23.35], [-69.3, -22.4], [-68.5, -21.4], [-68.25, -21.2]],
  },
  {
    id: "fcst",
    name: "Ferrocarril Salitrero de Tarapacá (Pisagua–Iquique)",
    cat: "minero",
    op: "FC Salitrero de Tarapacá / Estado",
    gauge: "1.000 mm",
    km: 160,
    opened: 1871,
    closed: 1942,
    desc: "Red salitrera de la provincia de Tarapacá (construida bajo soberanía peruana): Pisagua–Pintados con ramal a Iquique.",
    coords: [[-70.2, -19.75], [-70.1, -20.35], [-70.15, -20.21]],
  },
  {
    id: "junin",
    name: "Ramal Junín (Iquique–Junín)",
    cat: "minero",
    op: "Ferrocarril de Junín / Estado",
    gauge: "1.000 mm",
    km: 58,
    opened: 1904,
    closed: 1937,
    desc: "Ramal de las oficinas salitreras al este de Iquique; decayó con el fin del salitre natural.",
    coords: [[-70.15, -20.21], [-69.85, -20.35], [-69.6, -20.5]],
  },
  {
    id: "long-norte",
    name: "Longitudinal Norte (La Calera–Pintados)",
    cat: "troncal-norte",
    op: "EFE (Red Norte) / Ferronor",
    gauge: "1.000 mm",
    km: 1160,
    opened: 1913,
    closed: 1975,
    desc: "Troncal del norte, trocha métrica, que unificó los ramales salitreros y mineros entre La Calera y Pintados. Cerró su servicio de pasajeros el 16 de junio de 1975; traspasada a Ferronor (1989) para carga, hoy activa solo en algunos tramos (p. ej. Socompa).",
    coords: [[-69.9, -20.4], [-70.4, -22.5], [-70.5, -24.3], [-70.7, -26.0], [-70.8, -28.6], [-71.25, -29.9], [-71.6, -31.2], [-71.2, -32.82]],
  },
  {
    id: "pintados-iquique",
    name: "Longitudinal Norte: Pintados–Iquique",
    cat: "troncal-norte",
    op: "EFE (Red Norte)",
    gauge: "1.000 mm",
    km: 72,
    opened: 1928,
    closed: 1975,
    desc: "Prolongación del Longitudinal Norte hasta Iquique por Alto Hospicio, reemplazando al antiguo FC Salitrero.",
    coords: [[-69.9, -20.4], [-70.1, -20.35], [-70.15, -20.21]],
  },
  {
    id: "arica-lapaz",
    name: "Ferrocarril Arica–La Paz",
    cat: "internacional",
    op: "EFE / FC Arica–La Paz (Chile–Bolivia)",
    gauge: "1.435 mm",
    km: 206,
    opened: 1913,
    closed: null,
    desc: "Ferrocarril internacional construido tras el tratado con Bolivia; une Arica con La Paz vía Visviri. Hoy opera carga (y un servicio turístico).",
    coords: [[-70.3, -18.48], [-69.95, -18.3], [-69.7, -18.0], [-69.4, -17.9]],
  },
  {
    id: "tacna-arica",
    name: "Ferrocarril Tacna–Arica",
    cat: "internacional",
    op: "Perú / Chile (compartido)",
    gauge: "1.435 mm",
    km: 62,
    opened: 1856,
    closed: null,
    desc: "Uno de los ferrocarriles más antiguos de Sudamérica (1856); une Arica con Tacna. Tras el Tratado de 1929 quedó en territorio peruano, con la estación Arica bajo administración conjunta.",
    coords: [[-70.3, -18.48], [-70.28, -18.2], [-70.25, -18.01]],
  },
  {
    id: "tongoy",
    name: "Ferrocarril Tongoy–Tamaya",
    cat: "minero",
    op: "Privado",
    gauge: "1.435 mm",
    km: 27,
    opened: 1867,
    closed: 1928,
    desc: "Pequeño ferrocarril minero de cobre entre el puerto de Tongoy y el mineral de Tamaya, cerca de La Serena.",
    coords: [[-71.56, -30.26], [-71.3, -30.3], [-71.05, -30.3]],
  },
  {
    id: "seccion-interior",
    name: "Sección interior: Puntilla–La Serena–Ovalle (y San Marcos)",
    cat: "troncal-norte",
    op: "FC de La Serena / Estado",
    gauge: "1.000 mm",
    km: 235,
    opened: 1873,
    closed: 1971,
    desc: "Vía interior del norte chico: de La Serena a Puntilla (Ovalle) por los valles del Elqui y Limarí (1873), unida desde 1910 con San Marcos y la costa.",
    coords: [[-71.25, -29.9], [-71.35, -30.3], [-71.2, -30.6], [-71.4, -31.6], [-71.45, -32.2]],
  },
  {
    id: "cabildo",
    name: "Ramal La Calera–Cabildo",
    cat: "troncal-norte",
    op: "EFE (Red Norte)",
    gauge: "1.000 mm",
    km: 71,
    opened: 1910,
    closed: 1981,
    desc: "Tramo del Longitudinal Norte por el valle del Aconcagua hacia Petorca y Cabildo; el último tramo construido en el norte.",
    coords: [[-71.2, -32.82], [-71.35, -32.6], [-71.4, -32.42]],
  },

  // ---------- ZONA CENTRO (RED SUR) ----------
  {
    id: "valpo-santiago",
    name: "Ferrocarril de Valparaíso a Santiago",
    cat: "troncal-sur",
    op: "FC de Valparaíso a Santiago / EFE",
    gauge: "1.676 mm",
    km: 180,
    opened: 1863,
    closed: 1986,
    desc: "Línea troncal entre el puerto principal y la capital (1863), con la cuesta de Las Vacas. El servicio de pasajeros terminó tras el accidente de Queronque (1986); hoy el tramo Valparaíso–Limache opera como Tren Limache–Puerto y el resto se mantiene para carga.",
    coords: [[-71.6, -33.05], [-71.3, -33.0], [-70.9, -32.8], [-70.65, -33.1], [-70.7, -33.45]],
  },
  {
    id: "llayllay-andes",
    name: "Ramal Llay-Llay–Los Andes",
    cat: "ramal",
    op: "EFE",
    gauge: "1.676 mm",
    km: 26,
    opened: 1871,
    closed: null,
    desc: "Ramal de la Red Sur hacia Los Andes; puerta al paso ferroviario internacional hacia Argentina. Su reactivación forma parte del corredor bioceánico.",
    coords: [[-70.9, -32.8], [-70.75, -32.83], [-70.6, -32.83]],
  },
  {
    id: "trasandino",
    name: "Ferrocarril Trasandino (Los Andes–Mendoza)",
    cat: "internacional",
    op: "FC Trasandino Chileno–Argentino",
    gauge: "1.000 mm (cremallera)",
    km: 74,
    opened: 1910,
    closed: 1979,
    desc: "Único ferrocarril que cruzó la cordillera de los Andes (con cremallera hasta Las Cuevas); unía Los Andes con Mendoza y Buenos Aires. El servicio chileno cesó definitivamente a fines de los años 70.",
    coords: [[-70.6, -32.83], [-70.35, -32.8], [-70.05, -32.82]],
  },
  {
    id: "long-sur-1",
    name: "Longitudinal Sur: Santiago–Rancagua–Curicó–Chillán",
    cat: "troncal-sur",
    op: "FC del Sur / EFE",
    gauge: "1.676 mm",
    km: 400,
    opened: 1873,
    closed: null,
    desc: "Tramo inicial del ferrocarril al sur: Santiago–San Bernardo (1857), Rancagua (1859), Curicó (1868), Talca (1871), Chillán (1873). Base de la futura EFE (1884). Hoy opera Metrotren y Terrasur.",
    coords: [[-70.7, -33.45], [-70.75, -34.17], [-71.24, -34.98], [-71.66, -35.43], [-71.8, -36.0], [-72.1, -36.6]],
  },
  {
    id: "long-sur-2",
    name: "Longitudinal Sur: Chillán–San Rosendo–Talcahuano",
    cat: "troncal-sur",
    op: "FC del Sur / EFE",
    gauge: "1.676 mm",
    km: 180,
    opened: 1873,
    closed: null,
    desc: "Enlace entre Chillán, San Rosendo y los puertos de Talcahuano y Concepción (1870s); corazón ferroviario del Biobío. Hoy base del servicio de carga y del Tren Talcahuano–Laja.",
    coords: [[-72.1, -36.6], [-72.6, -37.0], [-72.9, -37.28], [-73.0, -36.95], [-73.1, -36.72]],
  },
  {
    id: "long-sur-3",
    name: "Longitudinal Sur: San Rosendo–Victoria–Temuco",
    cat: "troncal-sur",
    op: "EFE",
    gauge: "1.676 mm",
    km: 250,
    opened: 1891,
    closed: null,
    desc: "Avance de la red hacia La Frontera: Renaico, Victoria y Temuco (1891), con la colonización de La Araucanía. Hoy el tramo Victoria–Temuco mantiene el Tren Regional.",
    coords: [[-72.9, -37.28], [-72.7, -37.7], [-72.35, -38.23], [-72.5, -38.5], [-72.6, -38.73]],
  },
  {
    id: "long-sur-4",
    name: "Longitudinal Sur: Temuco–Valdivia–Osorno",
    cat: "troncal-sur",
    op: "EFE",
    gauge: "1.676 mm",
    km: 330,
    opened: 1906,
    closed: null,
    desc: "Conexión del valle central sur: Loncoche, Antilhue, Valdivia y Osorno (1899), enlazada con Temuco en 1906.",
    coords: [[-72.6, -38.73], [-72.6, -39.35], [-72.95, -39.75], [-73.25, -39.81], [-73.1, -40.25], [-73.1, -40.55]],
  },
  {
    id: "long-sur-5",
    name: "Longitudinal Sur: Osorno–Puerto Montt",
    cat: "troncal-sur",
    op: "EFE",
    gauge: "1.676 mm",
    km: 115,
    opened: 1913,
    closed: null,
    desc: "Tramo final de la Red Sur: Osorno–Puerto Varas–Puerto Montt (1912–13), que en 1913 dejó unida la red troncal de Iquique a Puerto Montt.",
    coords: [[-73.1, -40.55], [-72.8, -41.0], [-72.7, -41.4], [-72.95, -41.45]],
  },
  {
    id: "melipilla",
    name: "Línea Santiago–Melipilla",
    cat: "ramal",
    op: "EFE",
    gauge: "1.676 mm",
    km: 61,
    opened: 1893,
    closed: 1994,
    desc: "Línea del surponiente de Santiago hacia Melipilla y el valle de Mallarauco. Cerrada en los 90; en proceso de reactivación como Tren Melipilla–Estación Central.",
    coords: [[-70.7, -33.45], [-70.85, -33.6], [-71.0, -33.8], [-71.2, -33.99]],
  },
  {
    id: "pichilemu",
    name: "Ramal San Fernando–Pichilemu",
    cat: "ramal",
    op: "EFE",
    gauge: "1.676 mm",
    km: 98,
    opened: 1924,
    closed: 1980,
    desc: "Ramal hacia la costa de Colchagua, terminado en los años 20; trasladó el comercio agrícola al puerto de Pichilemu.",
    coords: [[-71.0, -34.58], [-71.3, -34.5], [-71.7, -34.35], [-72.0, -34.4]],
  },
  {
    id: "hualane",
    name: "Ramal Curicó–Hualañé",
    cat: "ramal",
    op: "EFE",
    gauge: "1.676 mm",
    km: 90,
    opened: 1896,
    closed: 1977,
    desc: "Ramal agrícola del valle del Mataquito, de Curicó hacia Hualañé y la costa de Vichuquén.",
    coords: [[-71.24, -34.98], [-71.5, -34.95], [-71.8, -35.05]],
  },
  {
    id: "talca-constitucion",
    name: "Ramal Talca–Constitución",
    cat: "ramal",
    op: "EFE",
    gauge: "1.676 mm",
    km: 88,
    opened: 1928,
    closed: null,
    desc: "Último ramal de pasajeros de la Red Sur que sigue operativo; corría en busello por la costa del Maule. Uno de los ramales en pie más queridos de Chile.",
    coords: [[-71.66, -35.43], [-71.9, -35.3], [-72.1, -35.27], [-72.3, -35.33]],
  },

  // ---------- SUR ----------
  {
    id: "rucapequen",
    name: "Ramal Rucapequén–Concepción (línea de la costa)",
    cat: "ramal",
    op: "EFE",
    gauge: "1.676 mm",
    km: 65,
    opened: 1915,
    closed: 1997,
    desc: "Línea de carga por la costa del Biobío hacia Penco y Lirquén, para el embarque de cereales y madera del Itata.",
    coords: [[-72.44, -36.79], [-72.7, -36.75], [-73.0, -36.72], [-72.9, -36.83]],
  },
  {
    id: "coronel",
    name: "Ramal Concepción–Coronel–Lota–Curanilahue",
    cat: "ramal",
    op: "FC de Concepción a Curanilahue / EFE",
    gauge: "1.676 mm",
    km: 120,
    opened: 1890,
    closed: 1995,
    desc: "Línea del carbón: sirvió a los yacimientos de Lota y Coronel, y siguió hacia Curanilahue. Decaída con la crisis carbonífera; el tramo Concepción–Coronel resucitó como Biotrén.",
    coords: [[-72.9, -36.83], [-73.15, -37.03], [-73.15, -37.08], [-73.25, -37.3], [-73.35, -37.47]],
  },
  {
    id: "angol",
    name: "Ramal San Rosendo–Angol",
    cat: "ramal",
    op: "EFE",
    gauge: "1.676 mm",
    km: 65,
    opened: 1876,
    closed: 1985,
    desc: "Ramal del Biobío hacia Angol, en el marco de la ocupación de La Araucanía; su pista es hoy parte del debate de recuperación ferroviaria.",
    coords: [[-72.9, -37.28], [-72.85, -37.55], [-72.7, -37.8]],
  },
  {
    id: "lonquimay",
    name: "Ramal Victoria–Curacautín–Lonquimay",
    cat: "ramal",
    op: "EFE",
    gauge: "1.676 mm",
    km: 120,
    opened: 1913,
    closed: 1983,
    desc: "Ramal hacia la precordillera de La Araucanía y el alto Biobío (malón de altura hacia Lonquimay); cerrado en los 80.",
    coords: [[-72.35, -38.23], [-71.96, -38.43], [-71.6, -38.42], [-71.25, -38.39]],
  },
  {
    id: "antilhue",
    name: "Ramal Antilhue–Valdivia",
    cat: "ramal",
    op: "EFE",
    gauge: "1.676 mm",
    km: 40,
    opened: 1900,
    closed: 1980,
    desc: "Ramal del empalme de Antilhue a la ciudad de Valdivia; dañado por el terremoto de 1960, sobrevivió hasta los 80.",
    coords: [[-72.95, -39.75], [-73.1, -39.78], [-73.25, -39.81]],
  },
  {
    id: "chiloe",
    name: "Ferrocarril de Chiloé (Ancud–Castro)",
    cat: "ramal",
    op: "Ferrocarril de Chiloé / EFE",
    gauge: "1.000 mm",
    km: 77,
    opened: 1912,
    closed: 1957,
    desc: "Ferrocarril de trocha métrica que recorrió la isla grande entre Ancud y Castro (1912–1957); las trochas se levantaron y hoy quedan triciclos feriales sobre su banca.",
    coords: [[-73.87, -41.87], [-73.75, -42.1], [-73.65, -42.48]],
  },
];

const CATS = {
  "troncal-sur": { label: "Troncal Red Sur (EFE)", color: "#1d4ed8" },
  "troncal-norte": { label: "Longitudinal Norte", color: "#d97706" },
  ramal: { label: "Ramales", color: "#0d9488" },
  minero: { label: "Mineros / salitreros", color: "#b91c1c" },
  internacional: { label: "Internacionales", color: "#7c3aed" },
};

// Contorno de Chile desde GeoJSON (preciso)
const CHILE_OUTLINE = getChileOutlineWithFallback();

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
  const mapRef = useRef<SVGSVGElement | null>(null);

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

  // años hito bajo el slider
  const milestones = [
    [1851, "Caldera–Copiapó"], [1863, "Valparaíso–Santiago"], [1884, "Nace EFE"],
    [1910, "Trasandino"], [1913, "Iquique–P.Montt unidos"], [1942, "Declive salitre"],
    [1975, "Cierra Long. Norte"], [1986, "Queronque"], [2026, "Red actual"],
  ];

  const polyline = (coords) => coords.map(project).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const outlinePath = CHILE_OUTLINE.map(project).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* Encabezado */}
      <header className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center gap-4 sticky top-0 z-20 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚆</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">Mapa Ferroviario Histórico de Chile</h1>
            <p className="text-xs text-slate-400">Vías férreas construidas entre 1851 y hoy · fechas aproximadas</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => { if (year >= YEAR_MAX) setYear(YEAR_MIN); setPlaying((p) => !p); }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-4 py-2 rounded-lg text-sm transition"
          >
            {playing ? "⏸ Pausar" : "▶ Animar historia"}
          </button>
        </div>
      </header>

      {/* Controles temporales */}
      <div className="bg-white border-b shadow-sm px-6 py-4 sticky top-[64px] z-10">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold tabular-nums w-20 text-right text-slate-900">{year}</div>
          <input
            type="range"
            min={YEAR_MIN}
            max={YEAR_MAX}
            value={year}
            onChange={(e) => { setPlaying(false); setYear(Number(e.target.value)); }}
            className="w-full accent-amber-600 cursor-pointer"
            style={{ height: 6 }}
          />
        </div>
        {/* Etiquetas hito */}
        <div className="relative h-4 mt-1 hidden md:block">
          {milestones.map(([y, label]) => (
            <div key={y} className="absolute -translate-x-1/2 text-[10px] text-slate-500" style={{ left: `${((y - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100}%` }}>
              <span className={year === y ? "font-bold text-amber-700" : ""}>{y}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-3 items-center">
          {Object.entries(CATS).map(([c, v]) => (
            <button
              key={c}
              onClick={() => toggleCat(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${activeCats.includes(c) ? "text-white border-transparent" : "bg-white text-slate-500 border-slate-300"}`}
              style={activeCats.includes(c) ? { backgroundColor: v.color } : {}}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: activeCats.includes(c) ? "white" : v.color }} />
              {v.label}
            </button>
          ))}
          <label className="flex items-center gap-1.5 text-xs text-slate-600 ml-2 cursor-pointer">
            <input type="checkbox" checked={showGhost} onChange={(e) => setShowGhost(e.target.checked)} className="accent-slate-500" />
            Mostrar vías ya cerradas (fantasma)
          </label>
          <div className="ml-auto text-sm text-slate-700">
            <span className="font-semibold tabular-nums">{activeCount}</span> líneas ·{" "}
            <span className="font-semibold tabular-nums">{activeKm.toLocaleString("es-CL")}</span> km de red en {year}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 p-4 lg:p-6 max-w-[1400px] mx-auto">
        {/* Mapa */}
        <div className="flex-1 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="max-h-[75vh] overflow-auto">
            <svg ref={mapRef} viewBox="-10 -10 420 1100" className="w-full block" style={{ minWidth: 320 }}>
              <rect x={-10} y={-10} width={420} height={1100} fill="#eef6fb" />
              {/* Contorno de Chile */}
              <polygon points={outlinePath} fill="#f5f0e6" stroke="#9ca3af" strokeWidth={1.2} />
              {/* Líneas cerradas (fantasmas) */}
              {showGhost && visible.filter((l) => lineState(l) === "closed").map((l) => (
                <polyline key={"g" + l.id} points={polyline(l.coords)} fill="none" stroke="#94a3b8"
                  strokeWidth={1.5} strokeDasharray="4 4" opacity={0.6} />
              ))}
              {/* Líneas activas */}
              {visible.filter((l) => lineState(l) === "active").map((l) => (
                <g key={l.id}>
                  <polyline
                    points={polyline(l.coords)}
                    fill="none"
                    stroke={CATS[l.cat].color}
                    strokeWidth={hovered === l.id || selected === l.id ? 6 : 3.5}
                    strokeLinecap="round"
                    className="cursor-pointer transition-all"
                    opacity={0.95}
                    onMouseEnter={() => setHovered(l.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setSelected(l)}
                  />
                  {/* zona de clic amplia */}
                  <polyline
                    points={polyline(l.coords)}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={12}
                    className="cursor-pointer"
                    onMouseEnter={() => setHovered(l.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setSelected(l)}
                  />
                </g>
              ))}
              {/* Ciudades */}
              {CITIES.map(([name, lon, lat]) => {
                const [x, y] = project([lon, lat]);
                return (
                  <g key={name}>
                    <circle cx={x} cy={y} r={2.6} fill="#334155" />
                    <text x={x + 5} y={y + 2.5} fontSize={9} fill="#475569">{name}</text>
                  </g>
                );
              })}
              {/* Tooltip flotante */}
              {hovered && (() => {
                const l = RAIL_DB.find((r) => r.id === hovered);
                const [x, y] = project(l.coords[Math.floor(l.coords.length / 2)]);
                return (
                  <g>
                    <rect x={x + 8} y={y - 30} width={Math.min(230, 24 + l.name.length * 5.6)} height={34} rx={5} fill="#0f172a" opacity={0.92} />
                    <text x={x + 16} y={y - 17} fontSize={10} fill="#fff" fontWeight="bold">{l.name}</text>
                    <text x={x + 16} y={y - 6} fontSize={9} fill="#cbd5e1">{fmt(l.opened)} – {fmt(l.closed)} · {l.km} km</text>
                  </g>
                );
              })()}
            </svg>
          </div>
          <p className="text-[11px] text-slate-400 px-4 py-2 border-t">
            Mapa estilizado: trazados y contornos aproximados. Pulsa una línea para ver su ficha.
          </p>
        </div>

        {/* Panel lateral */}
        <aside className="w-full lg:w-96 space-y-4">
          {selected ? (() => {
            const l = RAIL_DB.find((r) => r.id === selected);
            const st = lineState(l);
            return (
              <div className="bg-white rounded-xl shadow-md p-5 border-t-4" style={{ borderTopColor: CATS[l.cat].color }}>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-bold text-slate-900 leading-snug">{l.name}</h2>
                  <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-lg leading-none">✕</button>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: CATS[l.cat].color }}>{CATS[l.cat].label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${st === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                    {st === "active" ? `En servicio en ${year}` : st === "future" ? `Aún no construida en ${year}` : `Cerrada en ${year}`}
                  </span>
                </div>
                <dl className="mt-4 text-sm divide-y divide-slate-100">
                  <div className="flex justify-between py-1.5"><dt className="text-slate-500">Inauguración</dt><dd className="font-medium">{l.opened}</dd></div>
                  <div className="flex justify-between py-1.5"><dt className="text-slate-500">Cierre</dt><dd className="font-medium">{l.closed === null ? "— (activa)" : l.closed}</dd></div>
                  <div className="flex justify-between py-1.5"><dt className="text-slate-500">Longitud</dt><dd className="font-medium">{l.km} km</dd></div>
                  <div className="flex justify-between py-1.5"><dt className="text-slate-500">Trocha</dt><dd className="font-medium text-right">{l.gauge}</dd></div>
                  <div className="flex justify-between py-1.5"><dt className="text-slate-500">Operador</dt><dd className="font-medium text-right">{l.op}</dd></div>
                </dl>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{l.desc}</p>
              </div>
            );
          })() : (
            <div className="bg-white rounded-xl shadow-md p-5">
              <h2 className="font-bold text-slate-900 mb-2">Cómo usar el mapa</h2>
              <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Mueve el <b>slider de años</b> (1850–2026) o pulsa <b>Animar historia</b> para ver la red crecer y decaer.</li>
                <li>Las líneas <b>punteadas grises</b> son vías ya cerradas en el año mostrado.</li>
                <li>Filtra por tipo de vía con los botones de colores.</li>
                <li>Pasa el mouse o haz clic sobre una línea para ver su ficha histórica.</li>
              </ul>
            </div>
          )}

          {/* Base de datos */}
          <div className="bg-white rounded-xl shadow-md p-5">
            <h2 className="font-bold text-slate-900 mb-3 text-sm">Base de datos · {RAIL_DB.length} vías registradas</h2>
            <div className="max-h-64 overflow-auto pr-1">
              <table className="w-full text-xs">
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
                      <td className="tabular-nums">{l.opened}</td>
                      <td className="tabular-nums">{l.closed ?? "activa"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contexto histórico */}
          <div className="bg-slate-900 text-slate-300 rounded-xl p-5 text-xs leading-relaxed">
            <h2 className="font-bold text-white mb-2 text-sm">Contexto</h2>
            <p>La red chilena nació con el Caldera–Copiapó (1851) y creció primero en el norte minero. En 1913 quedó unida la red troncal de Iquique a Puerto Montt, superando los <b className="text-white">7.000 km</b> con sus ramales. La crisis del salitre, el terremoto de 1960, la pérdida de subsidios (1979) y la competencia caminera redujeron la red: el Longitudinal Norte cerró pasajeros en 1975 y más de veinte ramales fueron levantados. Hoy la red troncal sur y servicios metropolitanos (Metrotren, Biotrén, Terrasur) conviven con proyectos de reactivación.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}