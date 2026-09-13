import type { RiskLevel } from '@/types/risk';

export const RISK_LEVELS: RiskLevel[] = ['SAFE', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'];

export const RISK_COLORS: Record<RiskLevel, string> = {
  SAFE: '#22c55e',
  LOW: '#84cc16',
  MODERATE: '#facc15',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

export const RISK_FILL_COLORS: Record<RiskLevel, string> = {
  SAFE: 'rgba(34,197,94,0.25)',
  LOW: 'rgba(132,204,22,0.30)',
  MODERATE: 'rgba(250,204,21,0.35)',
  HIGH: 'rgba(249,115,22,0.40)',
  CRITICAL: 'rgba(239,68,68,0.45)',
};

export const RISK_TEXT_CLASSES: Record<RiskLevel, string> = {
  SAFE: 'text-sev-safe',
  LOW: 'text-sev-low',
  MODERATE: 'text-sev-moderate',
  HIGH: 'text-sev-high',
  CRITICAL: 'text-sev-critical',
};

export const RISK_BG_CLASSES: Record<RiskLevel, string> = {
  SAFE: 'bg-sev-safe/15 border-sev-safe/30',
  LOW: 'bg-sev-low/15 border-sev-low/30',
  MODERATE: 'bg-sev-moderate/15 border-sev-moderate/30',
  HIGH: 'bg-sev-high/15 border-sev-high/30',
  CRITICAL: 'bg-sev-critical/15 border-sev-critical/30',
};

export function scoreToLevel(score: number): RiskLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MODERATE';
  if (score >= 20) return 'LOW';
  return 'SAFE';
}

export function levelToPriority(
  level: RiskLevel,
): 'P1' | 'P2' | 'P3' {
  if (level === 'CRITICAL' || level === 'HIGH') return 'P1';
  if (level === 'MODERATE') return 'P2';
  return 'P3';
}
