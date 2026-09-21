// mobile/src/services/db.js
// Handles local SQLite database storage for offline report queueing

import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

// Opens or creates the local SQLite database on the mobile device
export const getDBConnection = async () => {
  return SQLite.openDatabase({ name: 'bhurakshak_offline.db', location: 'default' });
};

// Creates the local reports table if it doesn't already exist
export const initDatabase = async () => {
  const db = await getDBConnection();
  const query = `
    CREATE TABLE IF NOT EXISTS local_reports (
      id TEXT PRIMARY KEY,
      reporter_role TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      observation_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      description TEXT,
      media_uri TEXT,
      sync_status TEXT DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db.executeSql(query);
};

// Saves a new report locally when offline
export const saveReportLocally = async (report) => {
  const db = await getDBConnection();
  const insertQuery = `
    INSERT INTO local_reports 
    (id, reporter_role, latitude, longitude, observation_type, severity, description, media_uri, sync_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING');
  `;
  const params = [
    report.id,
    report.reporter_role,
    report.latitude,
    report.longitude,
    report.observation_type,
    report.severity,
    report.description,
    report.media_uri,
  ];
  return db.executeSql(insertQuery, params);
};

// Fetches all pending reports that need to be uploaded to the server
export const getPendingReports = async () => {
  const db = await getDBConnection();
  const results = await db.executeSql("SELECT * FROM local_reports WHERE sync_status = 'PENDING';");
  const reports = [];
  results.forEach((result) => {
    for (let i = 0; i < result.rows.length; i++) {
      reports.push(result.rows.item(i));
    }
  });
  return reports;
};

// Marks reports as synced after successful server upload
export const markAsSynced = async (reportIds) => {
  const db = await getDBConnection();
  const placeholders = reportIds.map(() => '?').join(',');
  const query = `UPDATE local_reports SET sync_status = 'SYNCED' WHERE id IN (${placeholders});`;
  return db.executeSql(query, reportIds);
};