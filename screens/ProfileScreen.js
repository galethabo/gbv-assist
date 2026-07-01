// ProfileScreen.js - UPDATED WITH SUPPORT FUNCTIONS (Dark Mode Removed)
import React, { useState, useEffect } from 'react';
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
  Linking,
  Modal  
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../firebase';
import { 
  updateProfile, 
  updatePassword, 
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyContact: '',
    location: ''
  });
  const [settings, setSettings] = useState({
    notifications: true,
    locationEnabled: true
  });
  const [donationHistory, setDonationHistory] = useState([]);
  const [totalDonated, setTotalDonated] = useState(0);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');

  useEffect(() => {
    loadUserData();
    loadDonationHistory();
  }, []);

  const loadUserData = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setUserData({
        name: currentUser.displayName || '',
        email: currentUser.email || '',
        phone: '',
        emergencyContact: '',
        location: ''
      });

      // Load additional user data from Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(prev => ({
            ...prev,
            phone: data.phone || '',
            emergencyContact: data.emergencyContact || '',
            location: data.location || ''
          }));
          setSettings({
            notifications: data.notifications !== false,
            locationEnabled: data.locationEnabled !== false
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
  };

  const loadDonationHistory = async () => {
    if (!auth.currentUser) return;
    
    try {
      // This would typically query your donations collection
      // For now, we'll simulate some donation data
      const donations = [
        { id: 1, amount: 100, date: '2024-01-15', anonymous: false },
        { id: 2, amount: 50, date: '2024-02-01', anonymous: true },
        { id: 3, amount: 200, date: '2024-02-15', anonymous: false }
      ];
      
      setDonationHistory(donations);
      const total = donations.reduce((sum, donation) => sum + donation.amount, 0);
      setTotalDonated(total);
    } catch (error) {
      console.error('Error loading donation history:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera roll permissions to change your profile picture.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      // Here you would typically upload the image to your storage service
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: userData.name
      });

      // Update Firestore user document
      await setDoc(doc(db, 'users', user.uid), {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        emergencyContact: userData.emergencyContact,
        location: userData.location,
        notifications: settings.notifications,
        locationEnabled: settings.locationEnabled,
        updatedAt: new Date()
      }, { merge: true });

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleChangePassword = async () => {
    Alert.prompt(
      'Change Password',
      'Enter your new password (min 6 characters):',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Change', 
          onPress: async (newPassword) => {
            if (newPassword && newPassword.length >= 6) {
              try {
                await updatePassword(user, newPassword);
                Alert.alert('Success', 'Password updated successfully!');
              } catch (error) {
                console.error('Error updating password:', error);
                Alert.alert('Error', 'Failed to update password. Please try again.');
              }
            } else {
              Alert.alert('Error', 'Password must be at least 6 characters long.');
            }
          }
        }
      ],
      'secure-text'
    );
  };

  const handleSupportSubmit = async () => {
    if (!supportMessage.trim()) {
      Alert.alert('Error', 'Please enter your message.');
      return;
    }

    try {
      // Save support message to Firestore
      await setDoc(doc(db, 'supportMessages', Date.now().toString()), {
        userId: user.uid,
        userName: userData.name,
        message: supportMessage,
        timestamp: new Date(),
        status: 'new'
      });

      setSupportMessage('');
      setShowSupportModal(false);
      Alert.alert(
        'Thank You', 
        'Your message has been sent to our support team. We\'ll get back to you soon.'
      );
    } catch (error) {
      console.error('Error sending support message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              // Navigation will be handled by AuthContext
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const openEmergencyResources = () => {
    Linking.openURL('tel:0800012345'); // Replace with actual helpline
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={40} color="#6A0DAD" />
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.userName}>{userData.name}</Text>
        <Text style={styles.userEmail}>{userData.email}</Text>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons 
            name={isEditing ? "close" : "create-outline"} 
            size={20} 
            color="#6A0DAD" 
          />
          <Text style={styles.editButtonText}>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={userData.name}
              onChangeText={(text) => setUserData({...userData, name: text})}
              placeholder="Enter your full name"
            />
          ) : (
            <Text style={styles.value}>{userData.name || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={userData.email}
              onChangeText={(text) => setUserData({...userData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter your email"
            />
          ) : (
            <Text style={styles.value}>{userData.email}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={userData.phone}
              onChangeText={(text) => setUserData({...userData, phone: text})}
              keyboardType="phone-pad"
              placeholder="Enter your phone number"
            />
          ) : (
            <Text style={styles.value}>{userData.phone || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Emergency Contact</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={userData.emergencyContact}
              onChangeText={(text) => setUserData({...userData, emergencyContact: text})}
              placeholder="Emergency contact number"
            />
          ) : (
            <Text style={styles.value}>{userData.emergencyContact || 'Not set'}</Text>
          )}
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Donation History Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Donation History</Text>
          <TouchableOpacity 
            style={styles.donateButton}
            onPress={() => navigation.navigate('Login')} // Navigate to donation section
          >
            <Ionicons name="heart" size={16} color="white" />
            <Text style={styles.donateButtonText}>Donate Again</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.totalDonatedCard}>
          <Text style={styles.totalDonatedLabel}>Total Donated</Text>
          <Text style={styles.totalDonatedAmount}>R {totalDonated}</Text>
        </View>

        {donationHistory.length > 0 ? (
          donationHistory.map((donation) => (
            <View key={donation.id} style={styles.donationItem}>
              <View style={styles.donationInfo}>
                <Text style={styles.donationAmount}>R {donation.amount}</Text>
                <Text style={styles.donationDate}>{donation.date}</Text>
              </View>
              <View style={[
                styles.anonymousBadge,
                donation.anonymous && styles.anonymousBadgeActive
              ]}>
                <Text style={styles.anonymousBadgeText}>
                  {donation.anonymous ? 'Anonymous' : 'Public'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDonationsText}>No donations yet</Text>
        )}
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={20} color="#666" />
            <Text style={styles.settingLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => setSettings({...settings, notifications: value})}
            trackColor={{ false: '#f0f0f0', true: '#6A0DAD' }}
            thumbColor={settings.notifications ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.settingLabel}>Location Services</Text>
          </View>
          <Switch
            value={settings.locationEnabled}
            onValueChange={(value) => setSettings({...settings, locationEnabled: value})}
            trackColor={{ false: '#f0f0f0', true: '#6A0DAD' }}
            thumbColor={settings.locationEnabled ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={styles.settingButton} onPress={handleChangePassword}>
          <Ionicons name="key-outline" size={20} color="#6A0DAD" />
          <Text style={styles.settingButtonText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Support & Emergency Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support & Emergency</Text>
        
        <TouchableOpacity 
          style={[styles.supportButton, styles.primaryButton]}
          onPress={() => setShowSupportModal(true)}
        >
          <Ionicons name="chatbubble-ellipses" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Contact Support</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.supportButton, styles.emergencyButton]}
          onPress={openEmergencyResources}
        >
          <Ionicons name="warning" size={20} color="white" />
          <Text style={styles.emergencyButtonText}>Emergency Resources</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Support Modal */}
      <Modal
        visible={showSupportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSupportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contact Support</Text>
              <TouchableOpacity onPress={() => setShowSupportModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              How can we help you? Please describe your issue or question.
            </Text>
            
            <TextInput
              style={styles.supportInput}
              multiline
              numberOfLines={6}
              placeholder="Type your message here..."
              value={supportMessage}
              onChangeText={setSupportMessage}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowSupportModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSupportSubmit}
              >
                <Text style={styles.submitButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#6A0DAD',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6A0DAD',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 13, 173, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6A0DAD',
  },
  editButtonText: {
    color: '#6A0DAD',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  saveButton: {
    backgroundColor: '#6A0DAD',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalDonatedCard: {
    backgroundColor: 'rgba(106, 13, 173, 0.1)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  totalDonatedLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  totalDonatedAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6A0DAD',
  },
  donationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  donationInfo: {
    flex: 1,
  },
  donationAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  donationDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  anonymousBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  anonymousBadgeActive: {
    backgroundColor: 'rgba(106, 13, 173, 0.1)',
  },
  anonymousBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  noDonationsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  donateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  donateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 6,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#6A0DAD',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emergencyButton: {
    backgroundColor: '#FF3B30',
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  supportInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    minHeight: 120,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#6A0DAD',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});