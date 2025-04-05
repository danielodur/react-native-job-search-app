import React, { useState, useEffect } from 'react';
import { storeToken, getToken } from '../utils/tokenStorage';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { sendVerificationEmail } from '../../services/emailService';

interface SeekerEmailRegisterProps {
  onBack: () => void;
}

// Define the type for the session
interface Session {
  access_token: string;
}

export default function SeekerEmailRegister({ onBack }: SeekerEmailRegisterProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showCantReceiveModal, setShowCantReceiveModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isVerified, setIsVerified] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const router = useRouter();

  useEffect(() => {
    calculatePasswordStrength(password);
  }, [password]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showVerificationModal && timeLeft > 0 && !isVerified) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showVerificationModal, timeLeft, isVerified]);

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) {
      setPasswordStrength(0);
      return;
    }

    // Strong password: 10 or more characters
    if (pass.length >= 10) {
      setPasswordStrength(3);
      return;
    }

    // Medium password: 6-9 characters
    if (pass.length >= 6) {
      setPasswordStrength(2);
      return;
    }

    // Weak password: less than 6 characters
    setPasswordStrength(1);
  };

  const getStrengthColor = (index: number) => {
    if (!password) return '#333';
    
    if (passwordStrength === 1) return index === 0 ? '#FF3B30' : '#333';
    if (passwordStrength === 2) return index <= 1 ? '#FF3B30' : '#333';
    if (passwordStrength === 3) return '#34C759';
    return '#333';
  };

  const getStrengthText = () => {
    if (!password) return '';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Weak';
    return 'Strong';
  };

  const getStrengthTextColor = () => {
    if (!password) return '#666';
    if (passwordStrength === 1 || passwordStrength === 2) return '#FF3B30';
    return '#34C759';
  };

  const handleBack = () => {
    if (fullName || email || password || confirmPassword) {
      Alert.alert(
        'Warning',
        'If you go back, your data will be lost. Are you sure?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {},
          },
          {
            text: 'Yes',
            style: 'destructive',
            onPress: () => onBack(),
          },
        ],
        { userInterfaceStyle: 'dark' }
      );
    } else {
      onBack();
    }
  };

  const validateEmail = (email: string) => {
    // More comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  };

  const generateToken = () => {
    return Math.random().toString(36).substr(2);
  };

  const handleRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your full name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Required Field', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address.\nExample: user@domain.com'
      );
      return;
    }

    if (!password) {
      Alert.alert('Required Field', 'Please enter a password');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            email: email.trim()
          },
          emailRedirectTo: 'yourapp://auth/callback'
        },
      });

      if (error) {
        console.error('Signup error:', error);
        Alert.alert('Registration Error', 'Unable to complete registration. Please try again later.');
      } else if (data.user) {
        const token = generateToken();
        await sendVerificationEmail(email.trim(), token);
        setShowVerificationModal(true);
        setTimeLeft(60);
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLink = async () => {
    if (!email) {
      Alert.alert('Email Required', 'Please provide your email address to resend the verification link.');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: 'yourapp://auth/callback' // Ensure this is correct
        }
      });

      if (error) {
        console.error('Resend error:', error);
        Alert.alert('Resend Error', 'Unable to resend verification email. Please try again.');
      } else {
        setTimeLeft(60);
        Alert.alert('Verification Email Sent', 'A new verification email has been sent. Please check your inbox.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      Alert.alert('Error', 'Unable to resend verification email. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        Alert.alert(
          'Verification Check Failed',
          'Unable to verify your account status. Please try again.',
          [{ text: 'OK', style: 'default' }],
          { userInterfaceStyle: 'dark' }
        );
        return;
      }

      if (!user?.email_confirmed_at) {
        Alert.alert(
          'Email Not Verified',
          'Please click the verification link in your email before continuing.',
          [{ text: 'OK', style: 'default' }],
          { userInterfaceStyle: 'dark' }
        );
        return;
      }

      setIsVerified(true);
      setShowVerificationModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Verification check error:', error);
      Alert.alert(
        'Verification Error',
        'Unable to verify your account status. Please try again later.',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'dark' }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    setIsNavigating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    router.replace({
      pathname: '/seeker-resume',
      params: { 
        fullName,
        email,
        isVerified: 'true'
      }
    } as any);
  };

  const handleChangeEmail = () => {
    setShowCantReceiveModal(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleRegisterWithPhone = () => {
    setShowCantReceiveModal(false);
    router.push('/');
  };

  const checkUserSession = async () => {
    const token = await getToken();
    if (token) {
      console.log('User is logged in with token:', token);
      // You can use this token to refresh the session if needed
    } else {
      console.log('No user session found');
    }
  };

  useEffect(() => {
    checkUserSession();
  }, []);

  const handleBackPress = () => {
    Alert.alert(
      'Warning',
      'All the information will be lost. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: () => router.replace('/SeekerHomeScreen') }
      ],
      { userInterfaceStyle: 'dark' }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBack}
      >
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Email Registration</Text>
              <Text style={styles.subtitle}>
                Please enter your details to create an account
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.visibilityButton}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <Ionicons
                    name={isPasswordVisible ? 'eye-off' : 'eye'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              {/* Password Strength Indicator */}
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[0, 1, 2].map((index) => (
                    <View
                      key={index}
                      style={[
                        styles.strengthBar,
                        { backgroundColor: getStrengthColor(index) }
                      ]}
                    />
                  ))}
                </View>
                {password && (
                  <Text style={[styles.strengthText, { color: getStrengthTextColor() }]}>
                    {getStrengthText()}
                  </Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!isConfirmPasswordVisible}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.visibilityButton}
                  onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                >
                  <Ionicons
                    name={isConfirmPasswordVisible ? 'eye-off' : 'eye'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Verification Code"
                  placeholderTextColor="#999"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Register</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowCantReceiveModal(true)}
              style={styles.cantReceiveLink}
            >
              <Text style={styles.cantReceiveLinkText}>Can't receive verification link?</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/seeker-email-login' as any)}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Can't Receive Code Modal */}
      <Modal
        visible={showCantReceiveModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCantReceiveModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCantReceiveModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Can't receive verification link?</Text>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.actionButton]}
                onPress={handleChangeEmail}
              >
                <Text style={styles.actionButtonText}>Change Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.actionButton]}
                onPress={handleRegisterWithPhone}
              >
                <Text style={styles.actionButtonText}>Register with phone number</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCantReceiveModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Verification Modal */}
      <Modal
        visible={showVerificationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVerificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.verificationModal]}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: 'transparent' }]}
              onPress={() => setShowVerificationModal(false)}
            >
              <Ionicons name="close" size={24} color="#888" />
            </TouchableOpacity>
            <Text style={styles.verificationTitle}>Verification Email Sent</Text>
            <Text style={styles.verificationText}>
              A verification email has been sent to:
            </Text>
            <Text style={styles.emailText}>{email}</Text>
            <Text style={styles.verificationText}>Please check your inbox to verify.</Text>
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>Resend link in: {timeLeft}s</Text>
              {timeLeft === 0 && (
                <TouchableOpacity onPress={handleResendLink}>
                  <Text style={styles.resendLink}>Resend Link</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleVerificationSuccess}
            >
              <Text style={styles.verifyButtonText}>I've Verified My Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.verificationModal]}>
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#34C759" />
            </View>
            <Text style={styles.welcomeTitle}>Welcome, {fullName}!</Text>
            <Text style={styles.successText}>Congratulations, you are verified!</Text>

            <TouchableOpacity
              style={[styles.continueButton, isNavigating && styles.registerButtonDisabled]}
              onPress={handleContinue}
              disabled={isNavigating}
            >
              {isNavigating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 999,
    padding: 10,
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    padding: 15,
  },
  visibilityButton: {
    padding: 15,
  },
  strengthContainer: {
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  strengthBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2,
    backgroundColor: '#333',
  },
  strengthText: {
    fontSize: 12,
    textAlign: 'right',
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cantReceiveLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  cantReceiveLinkText: {
    color: '#666',
    fontSize: 14,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#333',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  verificationModal: {
    backgroundColor: '#333',
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  verificationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  verificationText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  resendLink: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  checkmarkContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 