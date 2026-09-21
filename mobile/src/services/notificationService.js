// mobile/src/services/notificationService.js
// Push Notification Manager for receiving and displaying live BhuRakshak alerts

import messaging from '@react-native-firebase/messaging';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

/**
 * Requests push notification permissions from the OS (Android/iOS).
 */
export const requestNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
};

/**
 * Listens for incoming FCM alerts while the app is in the foreground.
 */
export const initForegroundNotificationListener = () => {
  return messaging().onMessage(async (remoteMessage) => {
    console.log('[Notification Service] Foreground alert received:', remoteMessage);

    const { title, body } = remoteMessage.notification || {};
    if (title && body) {
      Alert.alert(title, body, [{ text: 'Acknowledge / OK' }]);
    }
  });
};

/**
 * Handles background & quit state notification taps.
 */
export const initBackgroundNotificationHandler = () => {
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('[Notification Service] App opened from background alert:', remoteMessage);
    // Routing logic to open specific map coordinates or report ID can be added here
  });

  messaging().getInitialNotification().then((remoteMessage) => {
    if (remoteMessage) {
      console.log('[Notification Service] App opened from quit state alert:', remoteMessage);
    }
  });
};