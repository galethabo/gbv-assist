// RegisterScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState('email');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [anonymousLoading, setAnonymousLoading] = useState(false);
  const { signup, signInWithGoogle, signInAnonymously } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateEmailForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleEmailSignup = async () => {
    if (!validateEmailForm()) return;

    setLoading(true);
    try {
      await signup(formData.email, formData.password, formData.name);
      
      Alert.alert(
        'Success!', 
        'Account created successfully!',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Email registration error:', error);
      
      let errorMessage = 'Failed to create account. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please use a different email or login.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use a stronger password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = `Registration failed: ${error.message}`;
      }
      
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      Alert.alert('Success!', 'Signed in with Google successfully!');
    } catch (error) {
      console.error('Google signup error:', error);
      Alert.alert('Google Sign In Failed', 'Unable to sign in with Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAnonymousSignup = async () => {
    setAnonymousLoading(true);
    try {
      await signInAnonymously();
      Alert.alert(
        'Welcome!', 
        'You are now using the app as a guest. Some features may be limited.',
        [{ text: 'Continue' }]
      );
    } catch (error) {
      console.error('Anonymous signup error:', error);
      Alert.alert('Guest Access Failed', 'Unable to continue as guest. Please try another method.');
    } finally {
      setAnonymousLoading(false);
    }
  };

  const handlePhoneSignup = () => {
    Alert.alert(
      'Phone Sign Up',
      'Phone authentication will be available soon. Please use another method for now.',
      [{ text: 'OK' }]
    );
  };

  const renderEmailForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputGroup}>
        <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={formData.name}
          onChangeText={(text) => handleInputChange('name', text)}
          autoCapitalize="words"
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email address"
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password (min. 6 characters)"
          value={formData.password}
          onChangeText={(text) => handleInputChange('password', text)}
          secureTextEntry
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(text) => handleInputChange('confirmPassword', text)}
          secureTextEntry
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <TouchableOpacity 
        style={[
          styles.signupButton, 
          loading && styles.signupButtonDisabled
        ]}
        onPress={handleEmailSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.signupButtonText}>Create Account</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderSignupOptions = () => (
    <View style={styles.optionsContainer}>
      <TouchableOpacity 
        style={[styles.socialButton, styles.googleButton]}
        onPress={handleGoogleSignup}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <ActivityIndicator color="#666" size="small" />
        ) : (
          <>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
              style={styles.socialIcon}
            />
            <Text style={[styles.socialButtonText, styles.googleButtonText]}>
              Continue with Google
            </Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.socialButton, styles.anonymousButton]}
        onPress={handleAnonymousSignup}
        disabled={anonymousLoading}
      >
        {anonymousLoading ? (
          <ActivityIndicator color="#666" size="small" />
        ) : (
          <>
            <Ionicons name="person-outline" size={20} color="#666" />
            <Text style={[styles.socialButtonText, styles.anonymousButtonText]}>
              Continue as Guest
            </Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.socialButton, styles.phoneButton]}
        onPress={handlePhoneSignup}
      >
        <Ionicons name="call-outline" size={20} color="#666" />
        <Text style={[styles.socialButtonText, styles.phoneButtonText]}>
          Sign up with Phone
        </Text>
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Soon</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color="#6A0DAD" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'email' && styles.activeTab
            ]}
            onPress={() => setActiveTab('email')}
          >
            <Ionicons 
              name="mail" 
              size={20} 
              color={activeTab === 'email' ? '#6A0DAD' : '#666'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === 'email' && styles.activeTabText
            ]}>
              Email
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'social' && styles.activeTab
            ]}
            onPress={() => setActiveTab('social')}
          >
            <Ionicons 
              name="phone-portrait" 
              size={20} 
              color={activeTab === 'social' ? '#6A0DAD' : '#666'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === 'social' && styles.activeTabText
            ]}>
              Quick Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'email' ? renderEmailForm() : renderSignupOptions()}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>

        <View style={styles.privacyNotice}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#666" />
          <Text style={styles.privacyText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    marginTop: 20,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A0DAD',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#6A0DAD',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  signupButton: {
    backgroundColor: '#6A0DAD',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#6A0DAD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  signupButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  signupButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  optionsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  googleButton: {
    borderColor: '#e0e0e0',
  },
  anonymousButton: {
    borderColor: '#e0e0e0',
  },
  phoneButton: {
    borderColor: '#e0e0e0',
    opacity: 0.7,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  socialButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  googleButtonText: {
    color: '#333',
  },
  anonymousButtonText: {
    color: '#333',
  },
  phoneButtonText: {
    color: '#666',
  },
  comingSoonBadge: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6A0DAD',
    backgroundColor: 'white',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#6A0DAD',
    fontWeight: '600',
    fontSize: 16,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  privacyText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
    textAlign: 'center',
  },
});