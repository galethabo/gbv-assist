// EmergencyScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Alert,
  Image,
  TextInput,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EmergencyScreen() {
  const emergencyContacts = [
    { name: 'South African Police', number: '10111', icon: 'shield' },
    { name: 'Ambulance', number: '10177', icon: 'ambulance' },
    { name: 'GBV Command Centre', number: '0800428428', icon: 'call' },
    { name: 'Lifeline', number: '0861322322', icon: 'heart' },
  ];

  const handleCall = (number) => {
    Linking.openURL(`tel:${number}`)
      .catch(err => {
        Alert.alert('Error', 'Could not make the call. Please check your device.');
        console.error('Error making call:', err);
      });
  };

  const handleSMS = () => {
    Linking.openURL('sms:31531?body=HELP')
      .catch(err => {
        Alert.alert('Error', 'Could not send SMS. Please check your device.');
        console.error('Error sending SMS:', err);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>
      <Text style={styles.subtitle}>Immediate help is available</Text>

      <View style={styles.contactsContainer}>
        {emergencyContacts.map((contact, index) => (
          <TouchableOpacity
            key={index}
            style={styles.contactButton}
            onPress={() => handleCall(contact.number)}
          >
            <Ionicons name={contact.icon} size={24} color="#FF3B30" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactNumber}>{contact.number}</Text>
            </View>
            <Ionicons name="call" size={24} color="#6A0DAD" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.contactButton, styles.smsButton]}
        onPress={handleSMS}
      >
        <Ionicons name="chatbubble" size={24} color="#6A0DAD" />
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>SMS for Help</Text>
          <Text style={styles.contactNumber}>Text "HELP" to 31531</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.safetyTips}>
        <Text style={styles.tipsTitle}>Safety Tips</Text>
        <Text style={styles.tip}>• Find a safe place if possible</Text>
        <Text style={styles.tip}>• If in immediate danger, try to call 10111</Text>
        <Text style={styles.tip}>• Reach out to someone you trust</Text>
        <Text style={styles.tip}>• You're not alone - help is available</Text>
      </View>
    </View>
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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  contactsContainer: {
    marginBottom: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 15,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactNumber: {
    fontSize: 14,
    color: '#666',
  },
  smsButton: {
    marginBottom: 30,
  },
  safetyTips: {
    backgroundColor: '#FFF4F4',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
  },
  tip: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
});