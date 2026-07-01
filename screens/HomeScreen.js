// screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GBV Support</Text>
        <Text style={styles.subtitle}>Support for Gender-Based Violence Survivors</Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.emergencyButton]}
          onPress={() => navigation.navigate('Emergency')}
        >
          <Text style={styles.emergencyButtonText}>EMERGENCY</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Report')}
        >
          <Text style={styles.buttonText}>Report Incident</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Resources')}
        >
          <Text style={styles.buttonText}>Find Resources</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Chat')}
        >
          <Text style={styles.buttonText}>Chat for Support</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Need Immediate Help?</Text>
        <Text style={styles.infoText}>Call 10111 for South African Police Service</Text>
        <Text style={styles.infoText}>GBV Command Centre: 0800 428 428</Text>
        <Text style={styles.infoText}>SMS 'help' to 31531</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#6A0DAD',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  quickActions: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#6A0DAD',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  emergencyButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emergencyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  infoSection: {
    padding: 20,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6A0DAD',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
});