// mobile/syncManager.js
// Listens to network connectivity and handles background sync of queued reports

import { getOfflineReports, clearSyncedReports } from './offlineStorage.js';

// Configuration endpoint for sync API
const API_BASE_URL = 'https://api.bhurakshak.gov.in/v1'; // Adjust to backend host URL

/**
 * Triggers background upload of all offline reports queued on the device.
 */
export const syncPendingReports = async () => {
  const pendingReports = await getOfflineReports();

  if (!pendingReports || pendingReports.length === 0) {
    console.log('No pending reports to sync.');
    return { syncedCount: 0 };
  }

  console.log(`Attempting to sync ${pendingReports.length} pending report(s)...`);

  try {
    const response = await fetch(`${API_BASE_URL}/reports/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reports: pendingReports }),
    });

    if (response.ok) {
      const result = await response.json();
      const syncedIds = pendingReports.map((report) => report.id);

      // Clear successfully uploaded items from local device storage
      await clearSyncedReports(syncedIds);

      console.log('Sync completed successfully!');
      return { success: true, syncedCount: syncedIds.length, serverResponse: result };
    } else {
      console.warn('Backend rejected sync payload with status:', response.status);
      return { success: false, error: `Server error ${response.status}` };
    }
  } catch (error) {
    console.error('Network error during auto-sync:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Event listener setup for browser/mobile online network triggers.
 */
export const initSyncListener = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('Network connectivity restored! Triggering auto-sync...');
      syncPendingReports();
    });
  }
};