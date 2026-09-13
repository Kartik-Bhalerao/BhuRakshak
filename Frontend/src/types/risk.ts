export type RiskLevel = 'SAFE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface RiskZoneProperties {
  zoneId: string;
  name: string;
  district: string;
  state: string;
  riskScore: number; // 0–100
  riskLevel: RiskLevel;
  confidence: number; // 0–100
  rainfall24h: number; // mm
  soilMoisture: number; // 0–100 index
  terrainSlope: number; // degrees
  historicalEvents: number;
  areaKm2: number;
  population: number;
  trend: number; // change from previous reading, +/-
}

export interface RiskZoneFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: RiskZoneProperties;
}

export interface RiskZoneCollection {
  type: 'FeatureCollection';
  features: RiskZoneFeature[];
}

export interface ForecastPoint {
  label: string; // "NOW", "+6h", etc.
  hourOffset: number;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  rainfallExpected: number; // mm
}

export interface RiskContributor {
  factor: string;
  weight: number; // 0–100 relative contribution
  value: string; // human-readable
  description: string;
}

export interface VillageFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    name: string;
    population: number;
    zoneId: string;
    connectivity: 'connected' | 'degraded' | 'isolated';
  };
}

export interface RoadFeature {
  type: 'Feature';
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  properties: {
    name: string;
    type: string;
    status: 'clear' | 'monitored' | 'at-risk' | 'blocked';
    zoneId: string;
  };
}

export interface InfrastructureFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    name: string;
    kind: 'hospital' | 'school' | 'bridge' | 'shelter';
    zoneId: string;
    status: string;
  };
}

export interface ExposureSummary {
  villagesAffected: number;
  populationExposed: number;
  roadsAffected: number;
  bridgesAffected: number;
  hospitals: number;
  schools: number;
  connectivityStatus: 'stable' | 'degraded' | 'critical';
}

export interface ResponsePriorityItem {
  zoneId: string;
  zoneName: string;
  priority: 'P1' | 'P2' | 'P3';
  riskLevel: RiskLevel;
  riskScore: number;
  populationExposed: number;
  connectivity: 'stable' | 'degraded' | 'critical';
  confidence: number;
  recommendedAction: string;
  estimatedResponseTime: string;
}

export interface KpiSummary {
  totalZones: number;
  criticalCount: number;
  highCount: number;
  moderateCount: number;
  lowCount: number;
  safeCount: number;
  populationExposed: number;
  activeAlerts: number;
  avgConfidence: number;
  districtsCovered: number;
}

export interface AlertItem {
  id: string;
  level: RiskLevel;
  zoneId: string;
  zoneName: string;
  district: string;
  timestamp: string; // ISO
  confidence: number;
  title: string;
  summary: string;
  recommendedAction: string;
  acknowledged: boolean;
}

export interface WeatherSnapshot {
  zoneId: string;
  temperatureC: number;
  humidity: number;
  rainfall24h: number;
  rainfall6h: number;
  windKph: number;
  conditions: string;
}
