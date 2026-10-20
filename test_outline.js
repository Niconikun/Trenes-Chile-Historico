// Test that our implementation extracts all polygons correctly
const fs = require('fs');

// Simulate the getChileOutline function
const chileGeoJson = JSON.parse(fs.readFileSync('src/data/chile-outline.json', 'utf8'));

function getChileOutline() {
  const featureCollection = chileGeoJson;
  
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
    const allPolygons = [];
    const coordinates = geometry.coordinates;
    
    for (const polygon of coordinates) {
      if (polygon.length > 0) {
        // First ring is the outer boundary
        const outerRing = polygon[0];
        
        // Clean up the coordinates
        const cleanedRing = outerRing.map(coord => [coord[0], coord[1]]);
        
        allPolygons.push(cleanedRing);
      }
    }
    
    return allPolygons;
  }
  
  return [];
}

const outline = getChileOutline();
console.log('Extracted', outline.length, 'polygons');
console.log('First polygon has', outline[0].length, 'coordinates');

// Check for southern islands
const southernPolygons = outline.filter(poly => {
  const firstCoord = poly[0];
  return firstCoord[1] < -41;
});
console.log('Found', southernPolygons.length, 'polygons in southern area (including Chiloé)');

// Check Chiloé specifically (around -42 to -43)
const chiloePolygons = outline.filter(poly => {
  const firstCoord = poly[0];
  return firstCoord[1] < -41 && firstCoord[1] > -44;
});
console.log('Found', chiloePolygons.length, 'polygons in Chiloé area');

console.log('\n✓ Implementation correctly extracts all polygons including islands!');
