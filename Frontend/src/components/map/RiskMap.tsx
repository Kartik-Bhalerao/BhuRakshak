import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { MAP_CONFIG } from '@/utils/mapConfig';
import { RISK_COLORS, RISK_FILL_COLORS } from '@/utils/riskColors';
import { riskZonesGeoJSON } from '@/data/riskZonesGeoJSON';
import { villagesGeoJSON, roadsGeoJSON, infrastructureGeoJSON } from '@/data/infrastructureGeoJSON';
import type { RiskZoneFeature } from '@/types/risk';
import { focusNER, focusZone } from '@/utils/mapCamera';
import { computeBounds } from '@/utils/geojson';
import { Layers, AlertTriangle } from 'lucide-react';
import LayerControls from './LayerControls';
import MapLegend from './MapLegend';
import MapToolBar from './MapToolBar';
import GeoJsonImport from './GeoJsonImport';

interface RiskMapProps {
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
}

interface LayerVisibility {
  zones: boolean;
  villages: boolean;
  roads: boolean;
  infrastructure: boolean;
}

const IMPORTED_SOURCE_ID = 'user-uploaded-geojson';
const IMPORTED_LAYER_ID = 'user-uploaded-geojson-layer';

export default function RiskMap({ selectedZoneId, onSelectZone }: RiskMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [tilesError, setTilesError] = useState(false);
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    zones: true,
    villages: true,
    roads: true,
    infrastructure: true,
  });
  const [showLayerControls, setShowLayerControls] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [globeMode, setGlobeMode] = useState(false);
  const [hasImportedData, setHasImportedData] = useState(false);
  const importedDataRef = useRef<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_CONFIG.style as maplibregl.StyleSpecification,
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom,
      maxBounds: MAP_CONFIG.maxBounds,
      attributionControl: { compact: true },
    });

    mapRef.current = map;

    map.on('error', () => {
      // Suppress tile loading errors — overlays still render
      setTilesError(true);
    });

    map.on('load', () => {
      // --- Risk zone fills ---
      map.addSource('risk-zones', {
        type: 'geojson',
        data: riskZonesGeoJSON as unknown as GeoJSON.GeoJSON,
      });

      map.addLayer({
        id: 'risk-zone-fill',
        type: 'fill',
        source: 'risk-zones',
        paint: {
          'fill-color': [
            'match',
            ['get', 'riskLevel'],
            'CRITICAL', RISK_FILL_COLORS.CRITICAL,
            'HIGH', RISK_FILL_COLORS.HIGH,
            'MODERATE', RISK_FILL_COLORS.MODERATE,
            'LOW', RISK_FILL_COLORS.LOW,
            'SAFE', RISK_FILL_COLORS.SAFE,
            RISK_FILL_COLORS.MODERATE,
          ],
          'fill-opacity': 0.8,
        },
      });

      map.addLayer({
        id: 'risk-zone-border',
        type: 'line',
        source: 'risk-zones',
        paint: {
          'line-color': [
            'match',
            ['get', 'riskLevel'],
            'CRITICAL', RISK_COLORS.CRITICAL,
            'HIGH', RISK_COLORS.HIGH,
            'MODERATE', RISK_COLORS.MODERATE,
            'LOW', RISK_COLORS.LOW,
            'SAFE', RISK_COLORS.SAFE,
            RISK_COLORS.MODERATE,
          ],
          'line-width': 2,
          'line-opacity': 0.9,
        },
      });

      // Selected zone highlight — glow halo + bright outline
      map.addLayer({
        id: 'risk-zone-selected-glow',
        type: 'line',
        source: 'risk-zones',
        filter: ['==', 'zoneId', selectedZoneId ?? ''],
        paint: {
          'line-color': '#22d3ee',
          'line-width': 8,
          'line-opacity': 0.25,
          'line-blur': 4,
        },
      });

      map.addLayer({
        id: 'risk-zone-selected',
        type: 'line',
        source: 'risk-zones',
        filter: ['==', 'zoneId', selectedZoneId ?? ''],
        paint: {
          'line-color': '#22d3ee',
          'line-width': 3,
          'line-opacity': 1,
        },
      });

      // --- Villages ---
      map.addSource('villages', {
        type: 'geojson',
        data: villagesGeoJSON as unknown as GeoJSON.GeoJSON,
      });

      map.addLayer({
        id: 'villages-circle',
        type: 'circle',
        source: 'villages',
        paint: {
          'circle-radius': 5,
          'circle-color': [
            'match',
            ['get', 'connectivity'],
            'isolated', '#ef4444',
            'degraded', '#f97316',
            'connected', '#22d3ee',
            '#22d3ee',
          ],
          'circle-stroke-color': '#0c111c',
          'circle-stroke-width': 1.5,
        },
      });

      // --- Roads ---
      map.addSource('roads', {
        type: 'geojson',
        data: roadsGeoJSON as unknown as GeoJSON.GeoJSON,
      });

      map.addLayer({
        id: 'roads-line',
        type: 'line',
        source: 'roads',
        paint: {
          'line-color': [
            'match',
            ['get', 'status'],
            'blocked', '#ef4444',
            'at-risk', '#f97316',
            'monitored', '#facc15',
            'clear', '#22c55e',
            '#64748b',
          ],
          'line-width': 2.5,
          'line-opacity': 0.85,
        },
      });

      // --- Infrastructure ---
      map.addSource('infrastructure', {
        type: 'geojson',
        data: infrastructureGeoJSON as unknown as GeoJSON.GeoJSON,
      });

      const infraColors: Record<string, string> = {
        hospital: '#f87171',
        school: '#60a5fa',
        bridge: '#fbbf24',
        shelter: '#34d399',
      };

      map.addLayer({
        id: 'infrastructure-circle',
        type: 'circle',
        source: 'infrastructure',
        paint: {
          'circle-radius': 6,
          'circle-color': [
            'match',
            ['get', 'kind'],
            'hospital', infraColors.hospital,
            'school', infraColors.school,
            'bridge', infraColors.bridge,
            'shelter', infraColors.shelter,
            '#a78bfa',
          ],
          'circle-stroke-color': '#0c111c',
          'circle-stroke-width': 2,
        },
      });

      // --- Click handler for risk zones ---
      map.on('click', 'risk-zone-fill', (e) => {
        const feature = e.features?.[0] as unknown as RiskZoneFeature | undefined;
        if (!feature) return;
        const props = feature.properties;
        onSelectZone(props.zoneId);

        const coords = e.lngLat;
        const popup = new maplibregl.Popup({ offset: 15, closeButton: false })
          .setLngLat(coords)
          .setHTML(
            `<div style="min-width:180px">
              <div style="font-weight:600;font-size:13px;color:#e2e8f0;margin-bottom:4px">${props.name}</div>
              <div style="font-size:11px;color:#64748b;margin-bottom:6px">${props.district}, ${props.state}</div>
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:20px;font-weight:700;color:${RISK_COLORS[props.riskLevel]}">${props.riskScore}</span>
                <span style="font-size:11px;color:#64748b">/ 100 — ${props.riskLevel}</span>
              </div>
            </div>`,
          )
          .addTo(map);

        popupRef.current = popup;
      });

      // Cursor
      map.on('mouseenter', 'risk-zone-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'risk-zone-fill', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update selected zone highlight + fly to zone
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    map.setFilter('risk-zone-selected', ['==', 'zoneId', selectedZoneId ?? '']);
    map.setFilter('risk-zone-selected-glow', ['==', 'zoneId', selectedZoneId ?? '']);

    if (selectedZoneId) {
      const feature = riskZonesGeoJSON.features.find(
        (f) => f.properties.zoneId === selectedZoneId,
      );
      if (feature) {
        focusZone(map, feature);
      }
    }
  }, [selectedZoneId]);

  // Toggle layer visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const layers: Record<keyof LayerVisibility, string[]> = {
      zones: ['risk-zone-fill', 'risk-zone-border', 'risk-zone-selected', 'risk-zone-selected-glow'],
      villages: ['villages-circle'],
      roads: ['roads-line'],
      infrastructure: ['infrastructure-circle'],
    };
    (Object.keys(layers) as (keyof LayerVisibility)[]).forEach((key) => {
      layers[key].forEach((layerId) => {
        const layer = map.getLayer(layerId);
        if (layer) {
          map.setLayoutProperty(
            layerId,
            'visibility',
            layerVisibility[key] ? 'visible' : 'none',
          );
        }
      });
    });
  }, [layerVisibility]);

  // Globe mode toggle
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (globeMode) {
      // Remove maxBounds so globe can show wider context
      map.setMaxBounds(null);
      map.setProjection({ type: 'globe' });
    } else {
      map.setProjection({ type: 'mercator' });
      map.setMaxBounds(MAP_CONFIG.maxBounds);
    }
  }, [globeMode]);

  const handleFocusNER = () => {
    const map = mapRef.current;
    if (!map) return;
    focusNER(map);
  };

  const handleResetView = () => {
    const map = mapRef.current;
    if (!map) return;
    focusNER(map);
  };

  const handleAddImportedData = (data: GeoJSON.FeatureCollection) => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Remove existing imported layer if present
    if (map.getLayer(IMPORTED_LAYER_ID)) map.removeLayer(IMPORTED_LAYER_ID);
    if (map.getSource(IMPORTED_SOURCE_ID)) map.removeSource(IMPORTED_SOURCE_ID);

    map.addSource(IMPORTED_SOURCE_ID, {
      type: 'geojson',
      data,
    });

    map.addLayer({
      id: IMPORTED_LAYER_ID,
      source: IMPORTED_SOURCE_ID,
      type: 'line',
      paint: {
        'line-color': '#22d3ee',
        'line-width': 2,
        'line-opacity': 0.7,
      },
    });

    // Also add a fill layer for polygon features
    if (!map.getLayer(IMPORTED_LAYER_ID + '-fill')) {
      map.addLayer({
        id: IMPORTED_LAYER_ID + '-fill',
        source: IMPORTED_SOURCE_ID,
        type: 'fill',
        paint: {
          'fill-color': '#22d3ee',
          'fill-opacity': 0.1,
        },
      });
    }

    setHasImportedData(true);
    importedDataRef.current = data;

    // Zoom to imported data
    const bounds = computeBounds(data);
    if (bounds) {
      map.fitBounds(bounds, { padding: 60, duration: 600 });
    }
  };

  const handleRemoveImportedData = () => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getLayer(IMPORTED_LAYER_ID + '-fill')) map.removeLayer(IMPORTED_LAYER_ID + '-fill');
    if (map.getLayer(IMPORTED_LAYER_ID)) map.removeLayer(IMPORTED_LAYER_ID);
    if (map.getSource(IMPORTED_SOURCE_ID)) map.removeSource(IMPORTED_SOURCE_ID);
    setHasImportedData(false);
    importedDataRef.current = null;
  };

  const handleZoomToImportedData = () => {
    const map = mapRef.current;
    if (!map) return;
    const data = importedDataRef.current;
    if (!data) return;
    const bounds = computeBounds(data);
    if (bounds) {
      map.fitBounds(bounds, { padding: 60, duration: 600 });
    }
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-ink-700 bg-ink-900 map-frame">
      <div ref={containerRef} className="absolute inset-0" />

      {tilesError && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-ink-900/90 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-400">
          <AlertTriangle size={14} />
          Base map tiles unavailable — overlays still active
        </div>
      )}

      {/* Top-right controls cluster */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 items-end">
        <button
          onClick={() => setShowLayerControls((s) => !s)}
          aria-label="Toggle map layers"
          className="flex items-center gap-1.5 bg-ink-900/90 border border-ink-600 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:border-accent-500/50 hover:text-accent-400 hover:shadow-[0_0_12px_rgba(34,211,238,0.1)] transition-all duration-200"
        >
          <Layers size={14} />
          Layers
        </button>
        {showLayerControls && (
          <LayerControls
            visibility={layerVisibility}
            onToggle={(key) =>
              setLayerVisibility((prev) => ({ ...prev, [key]: !prev[key] }))
            }
          />
        )}

        {/* Tools toggle */}
        <button
          onClick={() => setShowTools((s) => !s)}
          aria-label="Toggle map tools"
          className="flex items-center gap-1.5 bg-ink-900/90 border border-ink-600 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:border-accent-500/50 hover:text-accent-400 transition-all duration-200"
        >
          <AlertTriangle size={14} className="rotate-45" />
          Tools
        </button>
        {showTools && (
          <div className="bg-ink-900/95 border border-ink-600 rounded-lg p-2.5 w-44 animate-slide-up space-y-2.5">
            <MapToolBar
              onFocusNER={handleFocusNER}
              onResetView={handleResetView}
              globeMode={globeMode}
              onToggleGlobe={() => setGlobeMode((g) => !g)}
            />
            <div className="border-t border-ink-700 pt-2">
              <GeoJsonImport
                onAddLayer={handleAddImportedData}
                onRemoveLayer={handleRemoveImportedData}
                onZoomToLayer={handleZoomToImportedData}
                hasImportedData={hasImportedData}
              />
            </div>
          </div>
        )}
      </div>

      <MapLegend />
    </div>
  );
}
