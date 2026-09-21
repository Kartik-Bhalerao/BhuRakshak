// mobile/src/components/CFRForm.js
// Offline-first Citizen & Field Reporting form UI component

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { launchCamera } from 'react-native-image-picker';
import { saveReportLocally } from '../services/db';

const CFRForm = ({ reporterRole = 'CITIZEN' }) => {
  const [observationType, setObservationType] = useState('GROUND_CRACK');
  const [severity, setSeverity] = useState('MODERATE');
  const [description, setDescription] = useState('');
  const [mediaUri, setMediaUri] = useState(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically fetch device GPS coordinates on component mount
  useEffect(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => console.log('Error fetching GPS location:', error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  // Launch device camera to capture image evidence
  const handleTakePhoto = () => {
    const options = { mediaType: 'photo', quality: 0.8, saveToPhotos: false };
    launchCamera(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Camera Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setMediaUri(response.assets[0].uri);
      }
    });
  };

  // Generate UUID v4 for client-side transaction identification
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // Save report payload into offline SQLite database
  const handleSubmit = async () => {
    if (!location.latitude || !location.longitude) {
      Alert.alert('Location Missing', 'Waiting for GPS hardware coordinates...');
      return;
    }

    setIsSubmitting(true);
    const reportPayload = {
      id: generateUUID(),
      reporter_role: reporterRole,
      latitude: location.latitude,
      longitude: location.longitude,
      observation_type: observationType,
      severity: severity,
      description: description,
      media_uri: mediaUri || '',
    };

    try {
      await saveReportLocally(reportPayload);
      Alert.alert(
        'Report Saved Offline',
        'Your report has been stored locally and will sync automatically when network returns.'
      );
      // Reset input fields
      setDescription('');
      setMediaUri(null);
    } catch (error) {
      Alert.alert('Storage Error', 'Could not save report locally.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Field Observation Report</Text>

      {/* GPS Location Status Indicator */}
      <View style={styles.card}>
        <Text style={styles.label}>GPS Coordinates:</Text>
        <Text style={styles.value}>
          {location.latitude && location.longitude
            ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
            : 'Acquiring GPS fix...'}
        </Text>
      </View>

      {/* Hazard Category Selection */}
      <Text style={styles.label}>Observation Type:</Text>
      <View style={styles.buttonRow}>
        {['GROUND_CRACK', 'ROAD_BLOCK', 'DEBRIS_FLOW', 'WATER_SEEPAGE'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeButton, observationType === type && styles.selectedButton]}
            onPress={() => setObservationType(type)}
          >
            <Text style={styles.buttonText}>{type.replace('_', ' ')}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Severity Selector */}
      <Text style={styles.label}>Perceived Severity:</Text>
      <View style={styles.buttonRow}>
        {['LOW', 'MODERATE', 'HIGH', 'CRITICAL'].map((lvl) => (
          <TouchableOpacity
            key={lvl}
            style={[styles.typeButton, severity === lvl && styles.selectedButton]}
            onPress={() => setSeverity(lvl)}
          >
            <Text style={styles.buttonText}>{lvl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Camera Capture Action */}
      <TouchableOpacity style={styles.cameraButton} onPress={handleTakePhoto}>
        <Text style={styles.cameraButtonText}>
          {mediaUri ? 'Photo Attached ✓' : 'Capture Evidence Photo'}
        </Text>
      </TouchableOpacity>

      {/* Optional Description Input */}
      <TextInput
        style={styles.input}
        placeholder="Add details (e.g., crack width, slope movement)..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Saving...' : 'Save Report Offline'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#1a1a1a' },
  card: { padding: 12, backgroundColor: '#fff', borderRadius: 8, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginVertical: 8, color: '#333' },
  value: { fontSize: 14, color: '#007AFF' },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeButton: { padding: 8, backgroundColor: '#e0e0e0', borderRadius: 6 },
  selectedButton: { backgroundColor: '#007AFF' },
  buttonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  cameraButton: { padding: 12, backgroundColor: '#34C759', borderRadius: 8, alignItems: 'center', marginVertical: 12 },
  cameraButtonText: { color: '#fff', fontWeight: 'bold' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  submitButton: { padding: 16, backgroundColor: '#FF3B30', borderRadius: 8, alignItems: 'center' },
  disabledButton: { backgroundColor: '#ccc' },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default CFRForm;