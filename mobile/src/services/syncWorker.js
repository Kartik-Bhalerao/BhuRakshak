// mobile/src/services/syncWorker.js
// Background sync engine for uploading offline reports to backend API

import NetInfo from '@react-native-community/netinfo';
import { getPendingReports, markAsSynced } from './db';

const BACKEND_API_URL = 'https://api.ner-shield.org/v1/reports/sync'; // Update with team server IP/URL

/**
 * Uploads pending reports from local SQLite to the central server.
 */
export const syncPendingReports = async () => {
  try {
    const pendingReports = await getPendingReports();
    if (pendingReports.length === 0) return;

    console.log(`[Sync Worker] Found ${pendingReports.length} pending report(s). Starting upload...`);

    const syncedIds = [];

    for (const report of pendingReports) {
      // Create FormData payload for multipart file & JSON transmission
      const formData = new FormData();
      formData.append('id', report.id);
      formData.append('reporter_role', report.reporter_role);
      formData.append('latitude', report.latitude.toString());
      formData.append('longitude', report.longitude.toString());
      formData.append('observation_type', report.observation_type);
      formData.append('severity', report.severity);
      formData.append('description', report.description || '');

      if (report.media_uri) {
        formData.append('media', {
          uri: report.media_uri,
          type: 'image/jpeg',
          name: `report_${report.id}.jpg`,
        });
      }

      // Execute POST request to backend API contract endpoint
      const response = await fetch(BACKEND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (response.ok || response.status === 201) {
        syncedIds.push(report.id);
      } else {
        console.warn(`[Sync Worker] Failed to upload report ${report.id}. HTTP ${response.status}`);
      }
    }

    // Mark successfully uploaded reports as SYNCED in local database
    if (syncedIds.length > 0) {
      await markAsSynced(syncedIds);
      console.log(`[Sync Worker] Successfully synced ${syncedIds.length} report(s).`);
    }
  } catch (error) {
    console.error('[Sync Worker] Network sync error:', error);
  }
};

/**
 * Initializes network listener to trigger synchronization automatically on reconnection.
 */
export const initNetworkSyncListener = () => {
  NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable) {
      console.log('[Network Listener] Internet connection restored. Triggering sync...');
      syncPendingReports();
    }
  });
};