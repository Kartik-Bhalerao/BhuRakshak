import type {
  ForecastPoint,
  RiskContributor,
  ExposureSummary,
  ResponsePriorityItem,
  KpiSummary,
  AlertItem,
  WeatherSnapshot,
  RiskZoneProperties,
} from '@/types/risk';
import { riskZonesGeoJSON } from './riskZonesGeoJSON';
import { scoreToLevel, levelToPriority } from '@/utils/riskColors';

const zones: RiskZoneProperties[] = riskZonesGeoJSON.features.map(
  (f) => f.properties,
);

export const mockForecasts: Record<string, ForecastPoint[]> = {
  Z001: [
    { label: 'NOW', hourOffset: 0, riskScore: 87, riskLevel: 'CRITICAL', confidence: 84, rainfallExpected: 0 },
    { label: '+6h', hourOffset: 6, riskScore: 91, riskLevel: 'CRITICAL', confidence: 80, rainfallExpected: 28 },
    { label: '+12h', hourOffset: 12, riskScore: 85, riskLevel: 'CRITICAL', confidence: 73, rainfallExpected: 22 },
    { label: '+24h', hourOffset: 24, riskScore: 72, riskLevel: 'HIGH', confidence: 65, rainfallExpected: 14 },
  ],
  Z002: [
    { label: 'NOW', hourOffset: 0, riskScore: 72, riskLevel: 'HIGH', confidence: 79, rainfallExpected: 0 },
    { label: '+6h', hourOffset: 6, riskScore: 78, riskLevel: 'HIGH', confidence: 75, rainfallExpected: 19 },
    { label: '+12h', hourOffset: 12, riskScore: 81, riskLevel: 'CRITICAL', confidence: 68, rainfallExpected: 24 },
    { label: '+24h', hourOffset: 24, riskScore: 68, riskLevel: 'HIGH', confidence: 60, rainfallExpected: 11 },
  ],
  Z003: [
    { label: 'NOW', hourOffset: 0, riskScore: 65, riskLevel: 'HIGH', confidence: 71, rainfallExpected: 0 },
    { label: '+6h', hourOffset: 6, riskScore: 70, riskLevel: 'HIGH', confidence: 68, rainfallExpected: 15 },
    { label: '+12h', hourOffset: 12, riskScore: 74, riskLevel: 'HIGH', confidence: 62, rainfallExpected: 18 },
    { label: '+24h', hourOffset: 24, riskScore: 58, riskLevel: 'MODERATE', confidence: 55, rainfallExpected: 8 },
  ],
  Z007: [
    { label: 'NOW', hourOffset: 0, riskScore: 81, riskLevel: 'CRITICAL', confidence: 76, rainfallExpected: 0 },
    { label: '+6h', hourOffset: 6, riskScore: 86, riskLevel: 'CRITICAL', confidence: 72, rainfallExpected: 26 },
    { label: '+12h', hourOffset: 12, riskScore: 82, riskLevel: 'CRITICAL', confidence: 66, rainfallExpected: 20 },
    { label: '+24h', hourOffset: 24, riskScore: 69, riskLevel: 'HIGH', confidence: 58, rainfallExpected: 12 },
  ],
  Z009: [
    { label: 'NOW', hourOffset: 0, riskScore: 68, riskLevel: 'HIGH', confidence: 73, rainfallExpected: 0 },
    { label: '+6h', hourOffset: 6, riskScore: 73, riskLevel: 'HIGH', confidence: 69, rainfallExpected: 17 },
    { label: '+12h', hourOffset: 12, riskScore: 77, riskLevel: 'HIGH', confidence: 63, rainfallExpected: 21 },
    { label: '+24h', hourOffset: 24, riskScore: 61, riskLevel: 'HIGH', confidence: 56, rainfallExpected: 9 },
  ],
  Z012: [
    { label: 'NOW', hourOffset: 0, riskScore: 76, riskLevel: 'HIGH', confidence: 77, rainfallExpected: 0 },
    { label: '+6h', hourOffset: 6, riskScore: 80, riskLevel: 'HIGH', confidence: 73, rainfallExpected: 22 },
    { label: '+12h', hourOffset: 12, riskScore: 84, riskLevel: 'CRITICAL', confidence: 67, rainfallExpected: 18 },
    { label: '+24h', hourOffset: 24, riskScore: 70, riskLevel: 'HIGH', confidence: 59, rainfallExpected: 10 },
  ],
};

function defaultForecast(zoneId: string, score: number): ForecastPoint[] {
  return [
    { label: 'NOW', hourOffset: 0, riskScore: score, riskLevel: scoreToLevel(score), confidence: 60, rainfallExpected: 0 },
    { label: '+6h', hourOffset: 6, riskScore: Math.min(100, score + 5), riskLevel: scoreToLevel(Math.min(100, score + 5)), confidence: 55, rainfallExpected: 10 },
    { label: '+12h', hourOffset: 12, riskScore: Math.min(100, score + 8), riskLevel: scoreToLevel(Math.min(100, score + 8)), confidence: 48, rainfallExpected: 12 },
    { label: '+24h', hourOffset: 24, riskScore: Math.max(0, score - 8), riskLevel: scoreToLevel(Math.max(0, score - 8)), confidence: 40, rainfallExpected: 5 },
  ];
}

export function getForecastForZone(zoneId: string): ForecastPoint[] {
  return mockForecasts[zoneId] ?? defaultForecast(zoneId, 45);
}

export const mockRiskExplanations: Record<string, RiskContributor[]> = {
  Z001: [
    { factor: 'Rainfall intensity (24h)', weight: 32, value: '142 mm', description: 'Extreme rainfall exceeds terrain threshold of 80 mm/24h' },
    { factor: 'Soil moisture saturation', weight: 26, value: '78% index', description: 'Near-saturated soil reduces infiltration capacity' },
    { factor: 'Terrain slope', weight: 22, value: '38° avg', description: 'Steep gradient increases failure probability' },
    { factor: 'Historical activity', weight: 12, value: '6 events', description: 'Repeated landslide events in monsoon seasons' },
    { factor: 'Antecedent rainfall (7d)', weight: 8, value: '210 mm', description: 'Extended wet period pre-conditioned slopes' },
  ],
  Z002: [
    { factor: 'Rainfall intensity (24h)', weight: 30, value: '98 mm', description: 'Heavy rainfall approaching terrain threshold' },
    { factor: 'Soil moisture saturation', weight: 24, value: '65% index', description: 'Moderate saturation, rising trend' },
    { factor: 'Terrain slope', weight: 20, value: '28° avg', description: 'Moderate gradient with unstable strata' },
    { factor: 'Historical activity', weight: 16, value: '4 events', description: 'Recurring events near river bank' },
    { factor: 'Antecedent rainfall (7d)', weight: 10, value: '145 mm', description: 'Moderate antecedent moisture' },
  ],
  Z007: [
    { factor: 'Rainfall intensity (24h)', weight: 34, value: '115 mm', description: 'Very heavy rainfall, near-critical' },
    { factor: 'Terrain slope', weight: 24, value: '34° avg', description: 'Steep terrain with fracture-prone rock' },
    { factor: 'Soil moisture saturation', weight: 22, value: '72% index', description: 'High saturation with poor drainage' },
    { factor: 'Historical activity', weight: 14, value: '5 events', description: 'Frequent events in recent monsoons' },
    { factor: 'Antecedent rainfall (7d)', weight: 6, value: '180 mm', description: 'Sustained rainfall over past week' },
  ],
};

function defaultExplanation(score: number, rainfall: number, slope: number, moisture: number, events: number): RiskContributor[] {
  return [
    { factor: 'Rainfall intensity (24h)', weight: 30, value: `${rainfall} mm`, description: 'Current rainfall accumulation over 24 hours' },
    { factor: 'Soil moisture saturation', weight: 24, value: `${moisture}% index`, description: 'Soil moisture saturation level' },
    { factor: 'Terrain slope', weight: 20, value: `${slope}° avg`, description: 'Average slope angle across zone' },
    { factor: 'Historical activity', weight: 16, value: `${events} events`, description: 'Historical landslide events recorded' },
    { factor: 'Antecedent rainfall (7d)', weight: 10, value: '120 mm', description: 'Cumulative rainfall over preceding 7 days' },
  ];
}

export function getExplanationForZone(zoneId: string): RiskContributor[] {
  const zone = zones.find((z) => z.zoneId === zoneId);
  if (!zone) return [];
  return (
    mockRiskExplanations[zoneId] ??
    defaultExplanation(zone.riskScore, zone.rainfall24h, zone.terrainSlope, zone.soilMoisture, zone.historicalEvents)
  );
}

export const mockExposure: Record<string, ExposureSummary> = {
  Z001: { villagesAffected: 4, populationExposed: 4300, roadsAffected: 1, bridgesAffected: 1, hospitals: 1, schools: 1, connectivityStatus: 'critical' },
  Z002: { villagesAffected: 3, populationExposed: 7900, roadsAffected: 1, bridgesAffected: 1, hospitals: 1, schools: 0, connectivityStatus: 'degraded' },
  Z003: { villagesAffected: 2, populationExposed: 20400, roadsAffected: 1, bridgesAffected: 0, hospitals: 1, schools: 1, connectivityStatus: 'degraded' },
  Z007: { villagesAffected: 3, populationExposed: 7000, roadsAffected: 1, bridgesAffected: 0, hospitals: 1, schools: 0, connectivityStatus: 'critical' },
  Z009: { villagesAffected: 2, populationExposed: 6200, roadsAffected: 1, bridgesAffected: 0, hospitals: 1, schools: 0, connectivityStatus: 'degraded' },
  Z012: { villagesAffected: 2, populationExposed: 3800, roadsAffected: 1, bridgesAffected: 0, hospitals: 1, schools: 0, connectivityStatus: 'degraded' },
};

function defaultExposure(zone: RiskZoneProperties): ExposureSummary {
  const popExp = Math.floor(zone.population * (zone.riskScore / 100));
  return {
    villagesAffected: Math.max(1, Math.floor(zone.riskScore / 25)),
    populationExposed: popExp,
    roadsAffected: zone.riskScore > 50 ? 1 : 0,
    bridgesAffected: zone.riskScore > 70 ? 1 : 0,
    hospitals: 1,
    schools: zone.riskScore > 60 ? 1 : 0,
    connectivityStatus: zone.riskScore > 75 ? 'critical' : zone.riskScore > 50 ? 'degraded' : 'stable',
  };
}

export function getExposureForZone(zoneId: string): ExposureSummary {
  const zone = zones.find((z) => z.zoneId === zoneId);
  if (!zone) return { villagesAffected: 0, populationExposed: 0, roadsAffected: 0, bridgesAffected: 0, hospitals: 0, schools: 0, connectivityStatus: 'stable' };
  return mockExposure[zoneId] ?? defaultExposure(zone);
}

const priorityActions: Record<string, string> = {
  CRITICAL: 'Immediate evacuation of at-risk villages. Deploy NDRF team. Block roads at risk.',
  HIGH: 'Pre-position response teams. Issue advisory to village councils. Monitor road status.',
  MODERATE: 'Issue watch notice. Verify communication channels. Standby response teams.',
  LOW: 'Routine monitoring. No action required unless conditions change.',
  SAFE: 'No action required. Continue routine surveillance.',
};

export function getResponsePriorities(): ResponsePriorityItem[] {
  return zones
    .map((z) => {
      const exposure = getExposureForZone(z.zoneId);
      return {
        zoneId: z.zoneId,
        zoneName: z.name,
        priority: levelToPriority(z.riskLevel),
        riskLevel: z.riskLevel,
        riskScore: z.riskScore,
        populationExposed: exposure.populationExposed,
        connectivity: exposure.connectivityStatus,
        confidence: z.confidence,
        recommendedAction: priorityActions[z.riskLevel] ?? priorityActions.MODERATE,
        estimatedResponseTime:
          z.riskLevel === 'CRITICAL' ? '< 30 min' :
          z.riskLevel === 'HIGH' ? '< 2 hours' :
          z.riskLevel === 'MODERATE' ? '< 6 hours' : '< 24 hours',
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
}

export function getKpiSummary(): KpiSummary {
  const critical = zones.filter((z) => z.riskLevel === 'CRITICAL').length;
  const high = zones.filter((z) => z.riskLevel === 'HIGH').length;
  const moderate = zones.filter((z) => z.riskLevel === 'MODERATE').length;
  const low = zones.filter((z) => z.riskLevel === 'LOW').length;
  const safe = zones.filter((z) => z.riskLevel === 'SAFE').length;
  const popExposed = zones
    .filter((z) => z.riskScore >= 60)
    .reduce((sum, z) => sum + z.population, 0);
  const avgConf = Math.round(zones.reduce((s, z) => s + z.confidence, 0) / zones.length);
  const districts = new Set(zones.map((z) => z.district)).size;
  return {
    totalZones: zones.length,
    criticalCount: critical,
    highCount: high,
    moderateCount: moderate,
    lowCount: low,
    safeCount: safe,
    populationExposed: popExposed,
    activeAlerts: critical + high,
    avgConfidence: avgConf,
    districtsCovered: districts,
  };
}

const now = new Date();
function hoursAgo(h: number): string {
  return new Date(now.getTime() - h * 3600000).toISOString();
}

export const mockAlerts: AlertItem[] = [
  { id: 'A001', level: 'CRITICAL', zoneId: 'Z001', zoneName: 'Dibang Valley Sector A', district: 'Dibang Valley', timestamp: hoursAgo(0.5), confidence: 84, title: 'Critical landslide risk detected', summary: 'Rainfall 142 mm/24h with saturated soil on 38° slopes. Active failure likely within 6 hours.', recommendedAction: 'Immediate evacuation of Bolung and Roing. Deploy NDRF to Dibang Bridge. Block NH-215 extension.', acknowledged: false },
  { id: 'A002', level: 'CRITICAL', zoneId: 'Z007', zoneName: 'Tirap Frontier', district: 'Tirap', timestamp: hoursAgo(1), confidence: 76, title: 'Critical risk — isolated villages', summary: '115 mm rainfall with steep terrain. Khonsa–Longding road blocked. Connectivity critical.', recommendedAction: 'Dispatch response teams via alternate route. Establish satellite communication with Khonsa.', acknowledged: false },
  { id: 'A003', level: 'HIGH', zoneId: 'Z002', zoneName: 'Lohit River Basin', district: 'Lohit', timestamp: hoursAgo(2), confidence: 79, title: 'High risk escalating', summary: 'Rainfall 98 mm, soil moisture rising. Forecast shows escalation to critical within 12 hours.', recommendedAction: 'Pre-position NDRF at Tezu. Issue advisory to village councils. Monitor Lohit Bridge.', acknowledged: false },
  { id: 'A004', level: 'HIGH', zoneId: 'Z012', zoneName: 'Changlang East', district: 'Changlang', timestamp: hoursAgo(3), confidence: 77, title: 'High risk zone identified', summary: '103 mm rainfall on steep slopes. Risk forecast escalating toward critical in next 12 hours.', recommendedAction: 'Alert village councils. Prepare evacuation routes. Monitor Changlang Valley Road.', acknowledged: true },
  { id: 'A005', level: 'HIGH', zoneId: 'Z003', zoneName: 'Tinsukia Hills East', district: 'Tinsukia', timestamp: hoursAgo(4), confidence: 71, title: 'High risk — dense population', summary: '76 mm rainfall in populated area. Digboi–Margherita road at risk. 20,400 population exposed.', recommendedAction: 'Issue advisory to Digboi and Margherita. Monitor road status. Prepare shelter capacity.', acknowledged: true },
  { id: 'A006', level: 'HIGH', zoneId: 'Z009', zoneName: 'Mon District Ridge', district: 'Mon', timestamp: hoursAgo(5), confidence: 73, title: 'High risk — ridge terrain', summary: '87 mm rainfall on 30° slopes. Mon Ridge Road at risk. 6,200 population exposed.', recommendedAction: 'Alert Mon village councils. Pre-position supplies. Monitor road status.', acknowledged: false },
];

export const mockWeather: Record<string, WeatherSnapshot> = {
  Z001: { zoneId: 'Z001', temperatureC: 22, humidity: 94, rainfall24h: 142, rainfall6h: 48, windKph: 28, conditions: 'Heavy rain' },
  Z002: { zoneId: 'Z002', temperatureC: 24, humidity: 88, rainfall24h: 98, rainfall6h: 32, windKph: 22, conditions: 'Rain' },
  Z003: { zoneId: 'Z003', temperatureC: 26, humidity: 85, rainfall24h: 76, rainfall6h: 22, windKph: 18, conditions: 'Light rain' },
  Z007: { zoneId: 'Z007', temperatureC: 23, humidity: 91, rainfall24h: 115, rainfall6h: 38, windKph: 25, conditions: 'Heavy rain' },
  Z009: { zoneId: 'Z009', temperatureC: 25, humidity: 87, rainfall24h: 87, rainfall6h: 26, windKph: 20, conditions: 'Rain' },
  Z012: { zoneId: 'Z012', temperatureC: 24, humidity: 89, rainfall24h: 103, rainfall6h: 34, windKph: 23, conditions: 'Rain' },
};

export function getWeatherForZone(zoneId: string): WeatherSnapshot | null {
  const zone = zones.find((z) => z.zoneId === zoneId);
  if (!zone) return null;
  return (
    mockWeather[zoneId] ?? {
      zoneId,
      temperatureC: 27,
      humidity: 80,
      rainfall24h: zone.rainfall24h,
      rainfall6h: Math.floor(zone.rainfall24h / 4),
      windKph: 15,
      conditions: zone.rainfall24h > 50 ? 'Rain' : 'Cloudy',
    }
  );
}
