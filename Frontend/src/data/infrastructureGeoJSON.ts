import type {
  VillageFeature,
  RoadFeature,
  InfrastructureFeature,
} from '@/types/risk';

export const villagesGeoJSON: { type: 'FeatureCollection'; features: VillageFeature[] } = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [93.70, 26.82] }, properties: { name: 'Roing', population: 3200, zoneId: 'Z001', connectivity: 'isolated' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [93.72, 26.78] }, properties: { name: 'Bolung', population: 1100, zoneId: 'Z001', connectivity: 'degraded' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [94.08, 26.72] }, properties: { name: 'Tezu', population: 5800, zoneId: 'Z002', connectivity: 'degraded' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [94.11, 26.68] }, properties: { name: 'Sunpura', population: 2100, zoneId: 'Z002', connectivity: 'connected' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [94.58, 26.62] }, properties: { name: 'Digboi', population: 12000, zoneId: 'Z003', connectivity: 'connected' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [94.62, 26.58] }, properties: { name: 'Margherita', population: 8400, zoneId: 'Z003', connectivity: 'degraded' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [93.96, 26.32] }, properties: { name: 'Dibrugarh', population: 35000, zoneId: 'Z004', connectivity: 'connected' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [94.36, 26.22] }, properties: { name: 'Sivasagar', population: 22000, zoneId: 'Z005', connectivity: 'connected' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [93.78, 26.12] }, properties: { name: 'Golaghat', population: 18000, zoneId: 'Z006', connectivity: 'connected' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [94.68, 26.82] }, properties: { name: 'Khonsa', population: 4200, zoneId: 'Z007', connectivity: 'isolated' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [94.72, 26.78] }, properties: { name: 'Longding', population: 2800, zoneId: 'Z007', connectivity: 'degraded' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [93.58, 26.52] }, properties: { name: 'Diphu', population: 15000, zoneId: 'Z008', connectivity: 'connected' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [95.08, 26.42] }, properties: { name: 'Mon', population: 6200, zoneId: 'Z009', connectivity: 'degraded' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [94.88, 26.12] }, properties: { name: 'Tuensang', population: 5100, zoneId: 'Z010', connectivity: 'connected' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [93.28, 26.42] }, properties: { name: 'Haflong', population: 4200, zoneId: 'Z011', connectivity: 'connected' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [94.28, 26.82] }, properties: { name: 'Changlang', population: 3800, zoneId: 'Z012', connectivity: 'degraded' } },
  ],
};

export const roadsGeoJSON: { type: 'FeatureCollection'; features: RoadFeature[] } = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[93.70, 26.82], [93.72, 26.78], [93.75, 26.75]] }, properties: { name: 'NH-215 Extension', type: 'Highway', status: 'blocked', zoneId: 'Z001' } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[94.08, 26.72], [94.11, 26.68], [94.05, 26.65]] }, properties: { name: 'Tezu–Sunpura Road', type: 'District', status: 'monitored', zoneId: 'Z002' } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[94.58, 26.62], [94.62, 26.58]] }, properties: { name: 'Digboi–Margherita Road', type: 'Highway', status: 'at-risk', zoneId: 'Z003' } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[93.96, 26.32], [93.94, 26.28]] }, properties: { name: 'Dibrugarh Bypass', type: 'Highway', status: 'clear', zoneId: 'Z004' } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[94.36, 26.22], [94.33, 26.18]] }, properties: { name: 'Sivasagar–Golaghat NH', type: 'Highway', status: 'clear', zoneId: 'Z005' } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[94.68, 26.82], [94.72, 26.78]] }, properties: { name: 'Khonsa–Longding Road', type: 'District', status: 'blocked', zoneId: 'Z007' } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[95.08, 26.42], [95.05, 26.38]] }, properties: { name: 'Mon Ridge Road', type: 'District', status: 'at-risk', zoneId: 'Z009' } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[94.28, 26.82], [94.31, 26.78]] }, properties: { name: 'Changlang Valley Road', type: 'District', status: 'monitored', zoneId: 'Z012' } },
  ],
};

export const infrastructureGeoJSON: { type: 'FeatureCollection'; features: InfrastructureFeature[] } = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [93.71, 26.81] }, properties: { name: 'Roing PHC', kind: 'hospital', zoneId: 'Z001', status: 'operational' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [93.73, 26.76] }, properties: { name: 'Bolung Primary School', kind: 'school', zoneId: 'Z001', status: 'closed' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [93.68, 26.79] }, properties: { name: 'Dibang Bridge', kind: 'bridge', zoneId: 'Z001', status: 'at-risk' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [94.09, 26.71] }, properties: { name: 'Tezu District Hospital', kind: 'hospital', zoneId: 'Z002', status: 'operational' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [94.06, 26.69] }, properties: { name: 'Lohit Bridge', kind: 'bridge', zoneId: 'Z002', status: 'monitored' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [94.59, 26.61] }, properties: { name: 'Digboi Civil Hospital', kind: 'hospital', zoneId: 'Z003', status: 'operational' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [94.61, 26.59] }, properties: { name: 'Margherita High School', kind: 'school', zoneId: 'Z003', status: 'shelter-active' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [94.60, 26.60] }, properties: { name: 'Tinsukia Relief Shelter', kind: 'shelter', zoneId: 'Z003', status: 'open' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [93.97, 26.31] }, properties: { name: 'Dibrugarh Civil Hospital', kind: 'hospital', zoneId: 'Z004', status: 'operational' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [94.37, 26.21] }, properties: { name: 'Sivasagar Hospital', kind: 'hospital', zoneId: 'Z005', status: 'operational' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [94.69, 26.81] }, properties: { name: 'Khonsa PHC', kind: 'hospital', zoneId: 'Z007', status: 'overwhelmed' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [95.09, 26.41] }, properties: { name: 'Mon District Hospital', kind: 'hospital', zoneId: 'Z009', status: 'operational' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [94.29, 26.81] }, properties: { name: 'Changlang PHC', kind: 'hospital', zoneId: 'Z012', status: 'operational' } },
  ],
};
