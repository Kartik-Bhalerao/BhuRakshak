/**
 * Map provider configuration — isolated in one location.
 * Uses OpenStreetMap raster tiles (free, no API key required).
 * To switch providers, change only this file.
 */
export const MAP_CONFIG = {
  style: {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: [
          'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxzoom: 19,
      },
    },
    layers: [
      {
        id: 'osm-tiles',
        type: 'raster',
        source: 'osm',
        minzoom: 0,
        maxzoom: 19,
        paint: {
          'raster-opacity': 0.9,
        },
      },
    ],
  },
  center: [94.0, 26.6] as [number, number], // Northeast India
  zoom: 7.2,
  maxBounds: [[91.5, 24.0], [96.5, 28.5]] as [[number, number], [number, number]],
  pitch: 0,
  bearing: 0,
};
