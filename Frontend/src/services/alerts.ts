import type { AlertItem } from '@/types/risk';
import { mockAlerts } from '@/data/mockData';
import { simulateLatency } from './api';

export async function getAlerts(): Promise<AlertItem[]> {
  return simulateLatency(mockAlerts);
}

export async function acknowledgeAlert(_alertId: string): Promise<{ success: boolean }> {
  return simulateLatency({ success: true });
}
