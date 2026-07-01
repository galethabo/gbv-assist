// LoginScreen.js - Enhanced Modern Layout with Baby Pink Donation Button
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  Vibration,
  Linking,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, updateProfile } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

const triggerHaptic = async (type = 'medium') => {
  try {
    if (!Haptics || !Haptics.impactAsync) {
      Vibration.vibrate(50);
      return;
    }

    const hapticMap = {
      light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
      medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
      heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
      success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
      error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
      warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    };

    const handler = hapticMap[type] || hapticMap.medium;
    await handler();
  } catch (error) {
    console.log("Haptic feedback failed:", error);
    Vibration.vibrate(50);
  }
};

export default function LoginScreen({ navigation }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [showDonationSection, setShowDonationSection] = useState(false);
  const [showCardPayment, setShowCardPayment] = useState(false);
  const [donateAnonymously, setDonateAnonymously] = useState(false);
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  const [loginCredentials, setLoginCredentials] = useState({
    email: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const handleEmergencyPress = () => {
    triggerHaptic('heavy');
    Alert.alert(
      'Emergency Resources',
      'You will be redirected to emergency resources. This section provides immediate help and support contacts.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Continue',
          onPress: () => navigation.navigate('Emergency')
        }
      ]
    );
  };

  const openTermsModal = () => {
    setShowTermsModal(true);
    triggerHaptic('light');
  };

  const openPrivacyModal = () => {
    setShowPrivacyModal(true);
    triggerHaptic('light');
  };

  const handleLogin = async () => {
    if (!loginCredentials.email || !loginCredentials.password) {
      Alert.alert('Error', 'Please enter both email and password');
      await triggerHaptic('error');
      return;
    }

    setIsLoading(true);
    await triggerHaptic('medium');
    
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginCredentials.email,
        loginCredentials.password
      );
      
      console.log('Login successful:', userCredential.user.uid);
      await triggerHaptic('success');
      
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to login. Please try again.';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      Alert.alert('Login Error', errorMessage);
      await triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerData.name || !registerData.email || !registerData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      await triggerHaptic('error');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      await triggerHaptic('error');
      return;
    }

    if (registerData.password.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters');
      await triggerHaptic('error');
      return;
    }

    if (!acceptedTerms || !acceptedPrivacy) {
      Alert.alert('Accept Terms', 'Please accept both Terms & Conditions and Privacy Policy to continue.');
      await triggerHaptic('error');
      return;
    }

    setIsLoading(true);
    await triggerHaptic('medium');

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerData.email,
        registerData.password
      );

      await updateProfile(userCredential.user, {
        displayName: registerData.name
      });

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: registerData.name,
        email: registerData.email.toLowerCase(),
        authMethod: 'email',
        createdAt: new Date(),
        notifications: true,
        locationEnabled: true,
        lastLogin: new Date(),
        termsAccepted: true,
        privacyAccepted: true,
        termsAcceptedAt: new Date()
      });

      console.log('Registration successful:', userCredential.user.uid);
      await triggerHaptic('success');
      
      Alert.alert(
        'Success!', 
        'Account created successfully!',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email or login.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password registration is not enabled. Please contact support.';
      }
      
      Alert.alert('Registration Error', errorMessage);
      await triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = isRegistering ? registerData.email : loginCredentials.email;
    
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      await triggerHaptic('error');
      return;
    }

    setIsLoading(true);
    await triggerHaptic('medium');

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email for instructions to reset your password.'
      );
      await triggerHaptic('success');
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      }
      
      Alert.alert('Error', errorMessage);
      await triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  };

  const simulateCardPayment = async () => {
    if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      Alert.alert('Invalid Card', 'Please enter a valid 16-digit card number');
      await triggerHaptic('error');
      return;
    }

    if (!cardDetails.expiryDate || !cardDetails.expiryDate.includes('/')) {
      Alert.alert('Invalid Expiry', 'Please enter expiry date in MM/YY format');
      await triggerHaptic('error');
      return;
    }

    if (!cardDetails.cvv || cardDetails.cvv.length !== 3) {
      Alert.alert('Invalid CVV', 'Please enter a valid 3-digit CVV');
      await triggerHaptic('error');
      return;
    }

    if (!cardDetails.cardholderName) {
      Alert.alert('Invalid Name', 'Please enter cardholder name');
      await triggerHaptic('error');
      return;
    }

    return true;
  };

  const handleDonation = async () => {
    if (!donationAmount || isNaN(donationAmount) || parseFloat(donationAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid donation amount in Rands');
      await triggerHaptic('error');
      return;
    }

    const amount = parseFloat(donationAmount);
    
    if (!showCardPayment) {
      setShowCardPayment(true);
      return;
    }

    setIsLoading(true);
    await triggerHaptic('medium');

    try {
      const paymentValid = await simulateCardPayment();
      if (!paymentValid) {
        setIsLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (auth.currentUser) {
        await setDoc(doc(db, 'donations', Date.now().toString()), {
          userId: donateAnonymously ? 'anonymous' : auth.currentUser.uid,
          userName: donateAnonymously ? 'Anonymous Donor' : auth.currentUser.displayName,
          amount: amount,
          currency: 'ZAR',
          timestamp: new Date(),
          status: 'completed',
          anonymous: donateAnonymously
        }, { merge: true });
      } else {
        await setDoc(doc(db, 'donations', Date.now().toString()), {
          userId: 'anonymous',
          userName: 'Anonymous Donor',
          amount: amount,
          currency: 'ZAR',
          timestamp: new Date(),
          status: 'completed',
          anonymous: true
        }, { merge: true });
      }

      Alert.alert(
        'Thank You for Your Donation!',
        `Your donation of R ${amount.toFixed(2)} has been received. Your support helps us continue our mission to combat GBV.`,
        [{ 
          text: 'OK', 
          onPress: () => {
            setDonationAmount('');
            setShowCardPayment(false);
            setShowDonationSection(false);
            setCardDetails({
              cardNumber: '',
              expiryDate: '',
              cvv: '',
              cardholderName: ''
            });
          }
        }]
      );
      await triggerHaptic('success');
    } catch (error) {
      console.error('Donation error:', error);
      Alert.alert('Donation Error', 'There was an issue processing your donation. Please try again.');
      await triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const quickDonationAmounts = [50, 100, 200, 500];

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    if (!isRegistering) {
      setAcceptedTerms(false);
      setAcceptedPrivacy(false);
    }
    triggerHaptic('light');
  };

  const TermsModal = () => (
    <Modal
      visible={showTermsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowTermsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms & Conditions</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowTermsModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalText}>
              Welcome to GBV Assist. By using our app, you agree to the following terms:{'\n\n'}
              
              <Text style={styles.modalSubtitle}>1. Service Purpose</Text>{'\n'}
              GBV Assist provides support resources, emergency contacts, and community features for individuals affected by gender-based violence.{'\n\n'}
              
              <Text style={styles.modalSubtitle}>2. User Responsibilities</Text>{'\n'}
              • Provide accurate information{'\n'}
              • Use the app for its intended purpose{'\n'}
              • Respect other users' privacy and safety{'\n'}
              • Report any misuse or safety concerns{'\n\n'}
              
              <Text style={styles.modalSubtitle}>3. Emergency Services</Text>{'\n'}
              This app provides emergency contacts but is not a replacement for emergency services. In life-threatening situations, contact local emergency services immediately.{'\n\n'}
              
              <Text style={styles.modalSubtitle}>4. Privacy & Confidentiality</Text>{'\n'}
              We prioritize your privacy and safety. All personal information is protected and used only to provide support services.{'\n\n'}
              
              <Text style={styles.modalSubtitle}>5. Limitation of Liability</Text>{'\n'}
              GBV Assist provides resources and support but cannot guarantee specific outcomes. Users are responsible for their own safety decisions.{'\n\n'}
              
              By accepting these terms, you acknowledge understanding and agreement with these conditions.
            </Text>
          </ScrollView>
          <TouchableOpacity 
            style={styles.modalAcceptButton}
            onPress={() => {
              setAcceptedTerms(true);
              setShowTermsModal(false);
            }}
          >
            <Text style={styles.modalAcceptButtonText}>Accept Terms</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const PrivacyModal = () => (
    <Modal
      visible={showPrivacyModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPrivacyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowPrivacyModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalText}>
              Your privacy and safety are our top priority.{'\n\n'}
              
              <Text style={styles.modalSubtitle}>Information We Collect</Text>{'\n'}
              • Account information (name, email){'\n'}
              • Support preferences and usage data{'\n'}
              • Emergency contact information (optional){'\n'}
              • Anonymous usage statistics{'\n\n'}
              
              <Text style={styles.modalSubtitle}>How We Use Your Information</Text>{'\n'}
              • Provide personalized support resources{'\n'}
              • Connect you with appropriate services{'\n'}
              • Improve app functionality and safety features{'\n'}
              • Ensure secure and confidential communication{'\n\n'}
              
              <Text style={styles.modalSubtitle}>Data Protection</Text>{'\n'}
              • All data is encrypted and securely stored{'\n'}
              • We never share personal information without consent{'\n'}
              • You can request data deletion at any time{'\n'}
              • Regular security audits protect your information{'\n\n'}
              
              <Text style={styles.modalSubtitle}>Safety Features</Text>{'\n'}
              • Quick exit button for emergency situations{'\n'}
              • No location tracking without permission{'\n'}
              • Confidential chat and support services{'\n'}
              • Secure authentication and data transmission{'\n\n'}
              
              Your trust is important to us. We're committed to protecting your privacy while providing essential support services.
            </Text>
          </ScrollView>
          <TouchableOpacity 
            style={styles.modalAcceptButton}
            onPress={() => {
              setAcceptedPrivacy(true);
              setShowPrivacyModal(false);
            }}
          >
            <Text style={styles.modalAcceptButtonText}>Accept Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ImageBackground
      source={require('../assets/images/gbv-background.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={['rgba(106, 13, 173, 0.85)', 'rgba(74, 0, 128, 0.75)']}
        style={styles.gradientOverlay}
      >
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Enhanced Header Section */}
            <Animatable.View 
              animation="fadeInDown" 
              duration={1000}
              style={styles.header}
            >
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#8B5FBF', '#6A0DAD']}
                  style={styles.logoGradient}
                >
                  <Ionicons name="shield-checkmark" size={42} color="white" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>GBV Assist</Text>
              <Text style={styles.subtitle}>Support for Survivors</Text>
              <View style={styles.headerDivider} />
            </Animatable.View>

            {/* Enhanced Form Section */}
            <Animatable.View 
              animation="fadeInUp" 
              duration={1000}
              delay={300}
              style={styles.formContainer}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8F9FF']}
                style={styles.formCard}
              >
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>
                    {isRegistering ? 'Create Account' : 'Welcome Back'}
                  </Text>
                  <Text style={styles.formSubtitle}>
                    {isRegistering ? 'Join our support community' : 'Sign in to your account'}
                  </Text>
                </View>

                {isRegistering && (
                  <Animatable.View animation="fadeInRight" duration={500}>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIconContainer}>
                        <Ionicons name="person-outline" size={20} color="#6A0DAD" />
                      </View>
                      <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor="#999"
                        value={registerData.name}
                        onChangeText={(text) => setRegisterData({...registerData, name: text})}
                        autoCapitalize="words"
                        editable={!isLoading}
                      />
                    </View>
                  </Animatable.View>
                )}

                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <Ionicons name="mail-outline" size={20} color="#6A0DAD" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#999"
                    value={isRegistering ? registerData.email : loginCredentials.email}
                    onChangeText={(text) => {
                      if (isRegistering) {
                        setRegisterData({...registerData, email: text});
                      } else {
                        setLoginCredentials({...loginCredentials, email: text});
                      }
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#6A0DAD" />
                  </View>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder={isRegistering ? "Password (min 6 characters)" : "Password"}
                    placeholderTextColor="#999"
                    value={isRegistering ? registerData.password : loginCredentials.password}
                    onChangeText={(text) => {
                      if (isRegistering) {
                        setRegisterData({...registerData, password: text});
                      } else {
                        setLoginCredentials({...loginCredentials, password: text});
                      }
                    }}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    disabled={isLoading}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#6A0DAD" 
                    />
                  </TouchableOpacity>
                </View>

                {isRegistering && (
                  <Animatable.View animation="fadeInRight" duration={500} delay={200}>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIconContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#6A0DAD" />
                      </View>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Confirm Password"
                        placeholderTextColor="#999"
                        value={registerData.confirmPassword}
                        onChangeText={(text) => setRegisterData({...registerData, confirmPassword: text})}
                        secureTextEntry={!showConfirmPassword}
                        editable={!isLoading}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeIcon}
                        disabled={isLoading}
                      >
                        <Ionicons 
                          name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                          size={20} 
                          color="#6A0DAD" 
                        />
                      </TouchableOpacity>
                    </View>
                  </Animatable.View>
                )}

                {/* Enhanced Terms Section */}
                {isRegistering && (
                  <Animatable.View animation="fadeInUp" duration={500} delay={300} style={styles.termsContainer}>
                    <Text style={styles.termsTitle}>Terms & Conditions</Text>
                    
                    <TouchableOpacity 
                      style={styles.checkboxContainer}
                      onPress={() => setAcceptedTerms(!acceptedTerms)}
                      disabled={isLoading}
                    >
                      <LinearGradient
                        colors={acceptedTerms ? ['#6A0DAD', '#8B5FBF'] : ['#FFFFFF', '#F8F9FF']}
                        style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}
                      >
                        {acceptedTerms && <Ionicons name="checkmark" size={14} color="white" />}
                      </LinearGradient>
                      <Text style={styles.checkboxText}>
                        I agree to the{' '}
                        <Text style={styles.linkText} onPress={openTermsModal}>
                          Terms & Conditions
                        </Text>
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.checkboxContainer}
                      onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
                      disabled={isLoading}
                    >
                      <LinearGradient
                        colors={acceptedPrivacy ? ['#6A0DAD', '#8B5FBF'] : ['#FFFFFF', '#F8F9FF']}
                        style={[styles.checkbox, acceptedPrivacy && styles.checkboxChecked]}
                      >
                        {acceptedPrivacy && <Ionicons name="checkmark" size={14} color="white" />}
                      </LinearGradient>
                      <Text style={styles.checkboxText}>
                        I agree to the{' '}
                        <Text style={styles.linkText} onPress={openPrivacyModal}>
                          Privacy Policy
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  </Animatable.View>
                )}

                {!isRegistering && (
                  <TouchableOpacity
                    onPress={handleForgotPassword}
                    disabled={isLoading}
                    style={styles.forgotPasswordButton}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.submitButton, isLoading && styles.disabledButton]}
                  onPress={isRegistering ? handleRegister : handleLogin}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#6A0DAD', '#8B5FBF']}
                    style={styles.submitButtonGradient}
                  >
                    {isLoading ? (
                      <Text style={styles.submitButtonText}>Please wait...</Text>
                    ) : (
                      <Text style={styles.submitButtonText}>
                        {isRegistering ? 'Create Account' : 'Sign In'}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Enhanced Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                  {/* Baby Pink Support Our Cause Button */}
                  <TouchableOpacity
                    style={styles.donationButton}
                    onPress={() => setShowDonationSection(!showDonationSection)}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={['#F8C8DC', '#FFD1DC']} // Soft baby pink gradient
                      style={styles.actionButtonGradient}
                    >
                      <Ionicons name="heart-outline" size={20} color="#D63384" />
                      <Text style={styles.donationButtonText}>
                        {showDonationSection ? 'Hide Donation' : 'Support Our Cause'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Emergency Button remains red */}
                  <TouchableOpacity
                    style={styles.emergencyButton}
                    onPress={handleEmergencyPress}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={['#FF3B30', '#FF6B6B']}
                      style={styles.actionButtonGradient}
                    >
                      <Ionicons name="warning" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Emergency Resources</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {showDonationSection && (
                  <Animatable.View 
                    animation="fadeInUp" 
                    duration={500}
                    style={styles.donationSection}
                  >
                    <Text style={styles.donationTitle}>Make a Donation</Text>
                    <Text style={styles.donationSubtitle}>
                      Your support helps us provide essential services to GBV survivors
                    </Text>

                    <View style={styles.quickAmountsContainer}>
                      {quickDonationAmounts.map((amount) => (
                        <TouchableOpacity
                          key={amount}
                          style={styles.quickAmountButton}
                          onPress={() => setDonationAmount(amount.toString())}
                          disabled={isLoading}
                        >
                          <Text style={styles.quickAmountText}>R {amount}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.donationInputContainer}>
                      <Text style={styles.currencySymbol}>R</Text>
                      <TextInput
                        style={styles.donationInput}
                        placeholder="Enter amount"
                        placeholderTextColor="#999"
                        value={donationAmount}
                        onChangeText={setDonationAmount}
                        keyboardType="numeric"
                        editable={!isLoading}
                      />
                    </View>

                    {showCardPayment ? (
                      <Animatable.View animation="fadeInUp" duration={500}>
                        <Text style={styles.paymentTitle}>Card Details</Text>
                        
                        <View style={styles.cardInputContainer}>
                          <Ionicons name="card-outline" size={20} color="#666" style={styles.inputIcon} />
                          <TextInput
                            style={styles.cardInput}
                            placeholder="Card Number"
                            placeholderTextColor="#999"
                            value={cardDetails.cardNumber}
                            onChangeText={(text) => setCardDetails({
                              ...cardDetails,
                              cardNumber: formatCardNumber(text)
                            })}
                            keyboardType="numeric"
                            maxLength={19}
                            editable={!isLoading}
                          />
                        </View>

                        <View style={styles.cardRow}>
                          <View style={[styles.cardInputContainer, { flex: 1, marginRight: 10 }]}>
                            <TextInput
                              style={styles.cardInput}
                              placeholder="MM/YY"
                              placeholderTextColor="#999"
                              value={cardDetails.expiryDate}
                              onChangeText={(text) => setCardDetails({
                                ...cardDetails,
                                expiryDate: formatExpiryDate(text)
                              })}
                              keyboardType="numeric"
                              maxLength={5}
                              editable={!isLoading}
                            />
                          </View>
                          
                          <View style={[styles.cardInputContainer, { flex: 1 }]}>
                            <TextInput
                              style={styles.cardInput}
                              placeholder="CVV"
                              placeholderTextColor="#999"
                              value={cardDetails.cvv}
                              onChangeText={(text) => setCardDetails({
                                ...cardDetails,
                                cvv: text.replace(/\D/g, '').slice(0, 3)
                              })}
                              keyboardType="numeric"
                              maxLength={3}
                              secureTextEntry
                              editable={!isLoading}
                            />
                          </View>
                        </View>

                        <View style={styles.cardInputContainer}>
                          <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                          <TextInput
                            style={styles.cardInput}
                            placeholder="Cardholder Name"
                            placeholderTextColor="#999"
                            value={cardDetails.cardholderName}
                            onChangeText={(text) => setCardDetails({
                              ...cardDetails,
                              cardholderName: text
                            })}
                            autoCapitalize="words"
                            editable={!isLoading}
                          />
                        </View>

                        <TouchableOpacity
                          style={styles.anonymousToggle}
                          onPress={() => setDonateAnonymously(!donateAnonymously)}
                          disabled={isLoading}
                        >
                          <View style={[
                            styles.checkbox,
                            donateAnonymously && styles.checkboxChecked
                          ]}>
                            {donateAnonymously && (
                              <Ionicons name="checkmark" size={14} color="white" />
                            )}
                          </View>
                          <Text style={styles.anonymousText}>
                            Donate anonymously
                          </Text>
                        </TouchableOpacity>

                        <View style={styles.paymentButtons}>
                          <TouchableOpacity
                            style={[styles.button, styles.backButton]}
                            onPress={() => setShowCardPayment(false)}
                            disabled={isLoading}
                          >
                            <Text style={styles.backButtonText}>Back</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[styles.donateButton, isLoading && styles.disabledButton]}
                            onPress={handleDonation}
                            disabled={isLoading}
                          >
                            <LinearGradient
                              colors={['#F8C8DC', '#FFD1DC']} // Baby pink for donation buttons too
                              style={styles.donateButtonGradient}
                            >
                              <Ionicons name="lock-closed" size={16} color="#D63384" />
                              <Text style={styles.donateButtonText}>
                                {isLoading ? 'Processing...' : `Pay R ${donationAmount || '0'}`}
                              </Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>
                      </Animatable.View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.donateButton, isLoading && styles.disabledButton]}
                        onPress={handleDonation}
                        disabled={isLoading || !donationAmount}
                      >
                        <LinearGradient
                          colors={['#F8C8DC', '#FFD1DC']} // Baby pink for donation buttons too
                          style={styles.donateButtonGradient}
                        >
                          <Ionicons name="heart" size={20} color="#D63384" />
                          <Text style={styles.donateButtonText}>
                            {isLoading ? 'Processing...' : `Donate R ${donationAmount || '0'}`}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </Animatable.View>
                )}

                {/* Enhanced Switch Button */}
                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={toggleForm}
                  disabled={isLoading}
                >
                  <Text style={styles.switchButtonText}>
                    {isRegistering 
                      ? 'Already have an account? ' 
                      : "Don't have an account? "
                    }
                    <Text style={styles.switchButtonHighlight}>
                      {isRegistering ? 'Sign In' : 'Sign Up'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      {/* Modals */}
      <TermsModal />
      <PrivacyModal />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6A0DAD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  headerDivider: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 2,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  formCard: {
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 15,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  eyeIcon: {
    padding: 5,
  },
  termsContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: '#6A0DAD',
  },
  checkboxText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  linkText: {
    color: '#6A0DAD',
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#6A0DAD',
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#6A0DAD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  donationButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#F8C8DC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emergencyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  donationButtonText: {
    color: '#D63384',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  donationSection: {
    backgroundColor: '#FFF5F8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE4EC',
  },
  donationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D63384',
    marginBottom: 8,
    textAlign: 'center',
  },
  donationSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickAmountButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD1DC',
    alignItems: 'center',
  },
  quickAmountText: {
    color: '#D63384',
    fontSize: 14,
    fontWeight: '500',
  },
  donationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FFD1DC',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 15,
    height: 50,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D63384',
    marginRight: 8,
  },
  donationInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  cardInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  cardInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  cardRow: {
    flexDirection: 'row',
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  anonymousText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  paymentButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#F8F9FF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  donateButton: {
    flex: 2,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#F8C8DC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  donateButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  donateButtonText: {
    color: '#D63384',
    fontSize: 14,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  switchButtonText: {
    fontSize: 14,
    color: '#666',
  },
  switchButtonHighlight: {
    color: '#6A0DAD',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  modalAcceptButton: {
    backgroundColor: '#6A0DAD',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalAcceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});