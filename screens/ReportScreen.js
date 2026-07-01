// ReportScreen.js - FIXED VERSION
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as Location from 'expo-location';

export default function ReportScreen() {
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [needs, setNeeds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = getAuth();

  const handleSubmit = async () => {
    if (!incidentType) {
      Alert.alert('Error', 'Please select an incident type');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get current location
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required', 
          'We need location permissions to submit your report. You can still submit without location.',
          [
            { 
              text: 'Submit Without Location', 
              onPress: () => submitReportWithoutLocation() 
            },
            { 
              text: 'Cancel', 
              style: 'cancel' 
            }
          ]
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000
      });
      
      await submitReport({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Could not get your location. Would you like to submit without location?',
        [
          { 
            text: 'Submit Without Location', 
            onPress: () => submitReportWithoutLocation() 
          },
          { 
            text: 'Cancel', 
            style: 'cancel' 
          }
        ]
      );
    }
  };

  const submitReport = async (locationData = null) => {
    try {
      const user = auth.currentUser;
      
      const reportData = {
        incidentType,
        description: description.trim(),
        needs,
        status: 'submitted',
        isAnonymous: !user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Add user ID if logged in
      if (user) {
        reportData.userId = user.uid;
      }

      // Add location if available
      if (locationData) {
        reportData.location = locationData;
      }

      await addDoc(collection(db, 'reports'), reportData);

      Alert.alert(
        'Success', 
        'Your report has been submitted. Support services will review it and provide assistance if needed.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              setIncidentType('');
              setDescription('');
              setNeeds([]);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'There was a problem submitting your report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitReportWithoutLocation = () => {
    submitReport();
  };

  const toggleNeed = (need) => {
    if (needs.includes(need)) {
      setNeeds(needs.filter(n => n !== need));
    } else {
      setNeeds([...needs, need]);
    }
  };

  const getNeedDisplayName = (need) => {
    const needNames = {
      legal: 'Legal Assistance',
      medical: 'Medical Help',
      counseling: 'Counseling',
      shelter: 'Safe Shelter'
    };
    return needNames[need] || need;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Report an Incident</Text>
      <Text style={styles.subtitle}>All information is anonymous and confidential</Text>

      <View style={styles.formSection}>
        <Text style={styles.label}>Type of Incident *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={incidentType}
            onValueChange={(itemValue) => setIncidentType(itemValue)}
            style={styles.picker}
            enabled={!isSubmitting}
          >
            <Picker.Item label="Select incident type" value="" />
            <Picker.Item label="Physical violence" value="physical" />
            <Picker.Item label="Sexual violence" value="sexual" />
            <Picker.Item label="Emotional abuse" value="emotional" />
            <Picker.Item label="Economic abuse" value="economic" />
            <Picker.Item label="Psychological abuse" value="psychological" />
            <Picker.Item label="Stalking or harassment" value="stalking" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={6}
          placeholder="Describe what happened... (You don't need to include identifying details)"
          value={description}
          onChangeText={setDescription}
          editable={!isSubmitting}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>What support do you need? (optional)</Text>
        <View style={styles.needsContainer}>
          {['legal', 'medical', 'counseling', 'shelter'].map(need => (
            <TouchableOpacity
              key={need}
              style={[
                styles.needButton,
                needs.includes(need) && styles.needButtonSelected
              ]}
              onPress={() => toggleNeed(need)}
              disabled={isSubmitting}
            >
              <Text style={[
                styles.needButtonText,
                needs.includes(need) && styles.needButtonTextSelected
              ]}>
                {getNeedDisplayName(need)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[
            styles.submitButton, 
            isSubmitting && styles.submitButtonDisabled,
            !incidentType && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || !incidentType}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>
              Submit Report {auth.currentUser ? '' : 'Anonymously'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>Your Privacy & Safety</Text>
          <Text style={styles.disclaimerText}>
            • Your report is completely confidential{!auth.currentUser ? ' and anonymous' : ''}
            {'\n'}• We don't share your personal information without your consent
            {'\n'}• You can choose what information to share
            {'\n'}• Professional support services will review your report
          </Text>
        </View>

        <View style={styles.emergencyNotice}>
          <Text style={styles.emergencyNoticeText}>
            If you are in immediate danger, please call emergency services at 10111 or use the Emergency tab for immediate help.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A0DAD',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  picker: {
    height: 50,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  needsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 25,
  },
  needButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6A0DAD',
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  needButtonSelected: {
    backgroundColor: '#6A0DAD',
  },
  needButtonText: {
    color: '#6A0DAD',
    fontWeight: '500',
    fontSize: 14,
  },
  needButtonTextSelected: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#6A0DAD',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#6A0DAD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disclaimerBox: {
    backgroundColor: '#f0f7ff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6A0DAD',
    marginBottom: 15,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6A0DAD',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  emergencyNotice: {
    backgroundColor: '#FFF4F4',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  emergencyNoticeText: {
    fontSize: 12,
    color: '#FF3B30',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
});