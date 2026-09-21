// mobile/App.js
// Entry point for BhuRakshak Mobile App

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Import Services & Components
import { initDatabase } from './src/services/db';
import { triggerSync } from './src/services/syncManager';
import {
  requestNotificationPermission,
  initForegroundNotificationListener,
  initBackgroundNotificationHandler,
} from './src/services/notificationService';
import CFRForm from './src/components/CFRForm';

export default function App() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // 1. Initialize Local SQLite Database
    initDatabase()
      .then(() => console.log('[App] SQLite database ready.'))
      .catch((err) => console.error('[App] Database init error:', err));

    // 2. Setup Push Notification Permissions & Listeners
    const setupNotifications = async () => {
      const hasPermission = await requestNotificationPermission();
      if (hasPermission) {
        initForegroundNotificationListener();
        initBackgroundNotificationHandler();
      } else {
        console.warn('[App] Push notification permission denied.');
      }
    };
    setupNotifications();

    // 3. Setup Network Connection Listener for Offline-to-Online Sync
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      const online = state.isConnected && state.isInternetReachable;
      setIsConnected(online);

      if (online) {
        console.log('[App] Internet connection active. Triggering background sync...');
        triggerSync().catch((err) =>
          console.error('[App] Auto-sync failed:', err)
        );
      }
    });

    return () => {
      unsubscribeNetInfo();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F8" />
      
      {/* Header Bar */}
      <View style={styles.header}>
        <Text style={styles.title}>BhuRakshak</Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: isConnected ? '#2E7D32' : '#C62828' },
          ]}
        >
          <Text style={styles.badgeText}>
            {isConnected ? 'ONLINE' : 'OFFLINE MODE'}
          </Text>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Field Hazard & Incident Reporting</Text>
        
        {/* Citizen & Field Reporting Form */}
        <CFRForm isConnected={isConnected} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A237E',
  },
  subtitle: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
});