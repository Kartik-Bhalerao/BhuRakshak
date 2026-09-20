// mobile/offlineStorage.js
// Handles local SQLite/AsyncStorage queuing for CFR reports when offline

const LOCAL_QUEUE_KEY = 'bhurakshak_pending_reports';

/**
 * Saves a report payload to local storage when network is offline.
 * @param {Object} reportData - The report payload from the form.
 */
export const saveReportOffline = async (reportData) => {
  try {
    const existingQueue = await getOfflineReports();
    
    // Add client-side timestamp and pending status
    const pendingReport = {
      ...reportData,
      id: reportData.id || `local_${Date.now()}`,
      syncStatus: 'PENDING',
      createdAt: new Date().toISOString()
    };

    existingQueue.push(pendingReport);
    
    // Store back in local device storage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_QUEUE_KEY, JSON.stringify(existingQueue));
    }
    
    console.log('Report saved locally for offline sync:', pendingReport.id);
    return { success: true, report: pendingReport };
  } catch (error) {
    console.error('Failed to save report locally:', error);
    return { success: false, error };
  }
};

/**
 * Retrieves all pending offline reports queued on the device.
 */
export const getOfflineReports = async () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(LOCAL_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    }
    return [];
  } catch (error) {
    console.error('Failed to retrieve offline reports:', error);
    return [];
  }
};

/**
 * Clears synced reports from the offline queue.
 * @param {Array<string>} syncedIds - List of report IDs successfully sent to backend.
 */
export const clearSyncedReports = async (syncedIds) => {
  try {
    const existingQueue = await getOfflineReports();
    const updatedQueue = existingQueue.filter(item => !syncedIds.includes(item.id));
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_QUEUE_KEY, JSON.stringify(updatedQueue));
    }
    
    console.log(`Cleared ${syncedIds.length} synced reports from local queue.`);
  } catch (error) {
    console.error('Failed to clear synced reports:', error);
  }
};