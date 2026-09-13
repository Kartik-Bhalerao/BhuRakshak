const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FEATURES = 5000;

const SUPPORTED_GEOMETRY_TYPES = [
  'Point',
  'MultiPoint',
  'LineString',
  'MultiLineString',
  'Polygon',
  'MultiPolygon',
];

export interface GeoJsonValidationResult {
  valid: boolean;
  error?: string;
  data?: GeoJSON.FeatureCollection;
}

/**
 * Validate that a text string is parseable, well-formed GeoJSON
 * with a supported geometry type and reasonable size.
 */
export function validateGeoJSON(text: string): GeoJsonValidationResult {
  if (text.length > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large (max 10 MB)' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { valid: false, error: 'Invalid JSON' };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { valid: false, error: 'Invalid GeoJSON structure' };
  }

  const obj = parsed as Record<string, unknown>;
  const type = obj.type;

  // Normalize to FeatureCollection
  let fc: GeoJSON.FeatureCollection;

  if (type === 'FeatureCollection') {
    fc = parsed as GeoJSON.FeatureCollection;
  } else if (type === 'Feature') {
    fc = {
      type: 'FeatureCollection',
      features: [parsed as GeoJSON.Feature],
    };
  } else if (type && SUPPORTED_GEOMETRY_TYPES.includes(type as string)) {
    fc = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: parsed as GeoJSON.Geometry,
          properties: {},
        },
      ],
    };
  } else {
    return {
      valid: false,
      error: 'Invalid GeoJSON — expected FeatureCollection, Feature, or geometry',
    };
  }

  if (!Array.isArray(fc.features)) {
    return { valid: false, error: 'Invalid GeoJSON — missing features array' };
  }

  if (fc.features.length === 0) {
    return { valid: false, error: 'GeoJSON contains no features' };
  }

  if (fc.features.length > MAX_FEATURES) {
    return { valid: false, error: `Too many features (max ${MAX_FEATURES})` };
  }

  for (const feature of fc.features) {
    if (!feature.geometry) continue;
    if (!SUPPORTED_GEOMETRY_TYPES.includes(feature.geometry.type)) {
      return {
        valid: false,
        error: `Unsupported geometry type: ${feature.geometry.type}`,
      };
    }
  }

  return { valid: true, data: fc };
}

/** Compute a bounding box from a FeatureCollection. Returns null if no valid coordinates. */
export function computeBounds(
  fc: GeoJSON.FeatureCollection,
): [[number, number], [number, number]] | null {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const visitCoord = (coord: number[]) => {
    const [lng, lat] = coord;
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  };

  const visitGeometry = (geom: GeoJSON.Geometry) => {
    if (geom.type === 'Point') {
      visitCoord(geom.coordinates);
    } else if (geom.type === 'LineString' || geom.type === 'MultiPoint') {
      geom.coordinates.forEach(visitCoord);
    } else if (geom.type === 'Polygon' || geom.type === 'MultiLineString') {
      geom.coordinates.forEach((ring) => ring.forEach(visitCoord));
    } else if (geom.type === 'MultiPolygon') {
      geom.coordinates.forEach((poly) =>
        poly.forEach((ring) => ring.forEach(visitCoord)),
      );
    }
  };

  for (const f of fc.features) {
    if (f.geometry) visitGeometry(f.geometry);
  }

  if (minLng === Infinity) return null;
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}
