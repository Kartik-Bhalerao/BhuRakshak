import type {
  RiskZoneCollection,
  RiskZoneFeature,
  ForecastPoint,
  RiskContributor,
  ExposureSummary,
  ResponsePriorityItem,
  KpiSummary,
} from '@/types/risk';
import { riskZonesGeoJSON } from '@/data/riskZonesGeoJSON';
import {
  getForecastForZone,
  getExplanationForZone,
  getExposureForZone,
  getResponsePriorities,
  getKpiSummary,
} from '@/data/mockData';
import { simulateLatency } from './api';

export async function getRiskZones(): Promise<RiskZoneCollection> {
  return simulateLatency(riskZonesGeoJSON);
}

export async function getZoneById(zoneId: string): Promise<RiskZoneFeature | null> {
  const zone = riskZonesGeoJSON.features.find((f) => f.properties.zoneId === zoneId);
  return simulateLatency(zone ?? null);
}

export async function getForecast(zoneId: string): Promise<ForecastPoint[]> {
  return simulateLatency(getForecastForZone(zoneId));
}

export async function getRiskExplanation(zoneId: string): Promise<RiskContributor[]> {
  return simulateLatency(getExplanationForZone(zoneId));
}

export async function getExposure(zoneId: string): Promise<ExposureSummary> {
  return simulateLatency(getExposureForZone(zoneId));
}

export async function getResponsePriorityQueue(): Promise<ResponsePriorityItem[]> {
  return simulateLatency(getResponsePriorities());
}

export async function getKpis(): Promise<KpiSummary> {
  return simulateLatency(getKpiSummary());
}
