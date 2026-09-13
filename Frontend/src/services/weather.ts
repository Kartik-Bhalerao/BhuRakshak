import type { WeatherSnapshot } from '@/types/risk';
import { getWeatherForZone } from '@/data/mockData';
import { simulateLatency } from './api';

export async function getWeather(zoneId: string): Promise<WeatherSnapshot | null> {
  return simulateLatency(getWeatherForZone(zoneId));
}
