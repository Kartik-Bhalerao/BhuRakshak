import type { ForecastPoint } from '@/types/risk';
import { scoreToLevel } from '@/utils/riskColors';
import { simulateLatency } from './api';

export interface SimulationInput {
  zoneId: string;
  rainfallMm: number;
  durationHours: number;
}

export interface SimulationResult {
  zoneId: string;
  adjustedRiskScore: number;
  adjustedRiskLevel: ReturnType<typeof scoreToLevel>;
  forecast: ForecastPoint[];
  summary: string;
}

export async function runSimulation(input: SimulationInput): Promise<SimulationResult> {
  const baseScore = 50;
  const rainfallFactor = Math.min(40, input.rainfallMm / 5);
  const adjustedScore = Math.min(100, Math.round(baseScore + rainfallFactor));

  const forecast: ForecastPoint[] = [
    { label: 'NOW', hourOffset: 0, riskScore: adjustedScore, riskLevel: scoreToLevel(adjustedScore), confidence: 55, rainfallExpected: 0 },
    { label: '+6h', hourOffset: 6, riskScore: Math.min(100, adjustedScore + 5), riskLevel: scoreToLevel(Math.min(100, adjustedScore + 5)), confidence: 50, rainfallExpected: Math.round(input.rainfallMm * 0.4) },
    { label: '+12h', hourOffset: 12, riskScore: Math.min(100, adjustedScore + 8), riskLevel: scoreToLevel(Math.min(100, adjustedScore + 8)), confidence: 45, rainfallExpected: Math.round(input.rainfallMm * 0.6) },
    { label: '+24h', hourOffset: 24, riskScore: Math.max(0, adjustedScore - 10), riskLevel: scoreToLevel(Math.max(0, adjustedScore - 10)), confidence: 38, rainfallExpected: Math.round(input.rainfallMm * 0.3) },
  ];

  const summary = `Simulated ${input.rainfallMm}mm rainfall over ${input.durationHours}h produces adjusted risk score of ${adjustedScore}/100 (${scoreToLevel(adjustedScore)}). This is a simulated projection, not a real forecast.`;

  return simulateLatency({
    zoneId: input.zoneId,
    adjustedRiskScore: adjustedScore,
    adjustedRiskLevel: scoreToLevel(adjustedScore),
    forecast,
    summary,
  });
}
