import type { Map as MapLibreMap } from 'maplibre-gl';
import { MAP_CONFIG } from './mapConfig';
import type { RiskZoneFeature } from '@/types/risk';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Fly the camera to the NER regional overview position. */
export function focusNER(map: MapLibreMap): void {
  const reduced = prefersReducedMotion();
  map.flyTo({
    center: MAP_CONFIG.center,
    zoom: MAP_CONFIG.zoom,
    pitch: 0,
    bearing: 0,
    duration: reduced ? 0 : 1000,
    essential: true,
  });
}

/** Reset to the default NER overview (same as focusNER but explicit name). */
export function resetOverview(map: MapLibreMap): void {
  focusNER(map);
}

/** Fly the camera to centre on a specific risk zone polygon. */
export function focusZone(map: MapLibreMap, feature: RiskZoneFeature): void {
  const reduced = prefersReducedMotion();
  const coords = feature.geometry.coordinates[0];
  const lng = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
  map.flyTo({
    center: [lng, lat],
    zoom: Math.max(map.getZoom(), 8.5),
    duration: reduced ? 0 : 800,
    essential: true,
  });
}

/** Fit the camera to a bounding box with padding. */
export function focusBounds(
  map: MapLibreMap,
  bounds: [[number, number], [number, number]],
): void {
  const reduced = prefersReducedMotion();
  map.fitBounds(bounds, {
    padding: 60,
    duration: reduced ? 0 : 800,
    essential: true,
  });
}
