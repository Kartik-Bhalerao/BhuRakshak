/**
 * Base API layer.
 * In the MVP, all methods return mock data with simulated latency.
 * When real backend endpoints are available, replace the mock
 * implementations here — the service signatures stay the same.
 */

const SIMULATED_DELAY_MS = 200;

export function simulateLatency<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), SIMULATED_DELAY_MS));
}

export const API_BASE_URL = '/api'; // future backend
