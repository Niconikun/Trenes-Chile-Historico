# Trenes Chile Histórico

Mapa histórico interactivo de los ferrocarriles de Chile desde 1850 hasta la actualidad.

## Vista en vivo

Puedes ver el mapa en funcionamiento en:
https://niconikun.github.io/Trenes-Chile-Historico/

## Características

- Visualización interactiva de más de 100 líneas ferroviarias históricas
- Filtro por categoría (troncal, ramales, mineros, internacionales)
- Línea de tiempo animada (1850-2026)
- Información detallada de cada ferrocarril
- Mapa estilizado con contorno de Chile

## Desarrollo

### Requisitos

- Node.js 18+ 
- npm o yarn

### Instalación

```bash
npm install
```

### Ejecución en desarrollo

```bash
npm run dev
```

Abre http://localhost:5173 en tu navegador.

### Construcción para producción

```bash
npm run build
```

### Despliegue a GitHub Pages

```bash
npm run deploy
```

Esto construye la aplicación y la sube a la rama `gh-pages`.

## Estructura del proyecto

- `src/App.tsx` - Componente principal de la aplicación
- `src/main.tsx` - Punto de entrada de React
- `src/index.css` - Estilos con Tailwind CSS
- `public/chile_continental_completo.geojson` - Datos geoespaciales de Chile
- `vite.config.ts` - Configuración de Vite para GitHub Pages

## Tecnologías

- React 18
- TypeScript
- Vite
- Tailwind CSS
- GitHub Pages

## Licencia

MIT
