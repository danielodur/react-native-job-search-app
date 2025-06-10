import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  InputAccessoryView,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { sendVerificationEmail } from '../../services/emailService';

export default function SeekerEmailLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const router = useRouter();
  const inputAccessoryViewID = 'emailLoginInputAccessoryViewID';

  const getPasswordStrength = (pass: string): {
    strength: 'weak' | 'medium' | 'strong';
    color: string;
    width: number;
  } => {
    if (!pass) return { strength: 'weak', color: '#FF3B30', width: 0 };

    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const isLongEnough = pass.length >= 10;

    if (hasUpperCase && hasLowerCase && hasNumbers && isLongEnough) {
      return { strength: 'strong', color: '#34C759', width: 100 };
    }

    const criteriaCount = [hasUpperCase, hasLowerCase, hasNumbers].filter(Boolean).length;
    if (pass.length >= 6) {
      if (criteriaCount >= 2) {
        return { strength: 'medium', color: '#30D158', width: 66 };
      }
    }

    return { strength: 'weak', color: '#FF3B30', width: 33 };
  };

  const handleBackPress = () => {
    if (email || password) {
      Alert.alert(
        'Warning',
        'If you go back, your information will be lost. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Yes', 
            style: 'destructive', 
            onPress: () => router.back()
          }
        ],
        { userInterfaceStyle: 'dark' }
      );
    } else {
      router.back();
    }
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Required Field', 'Please enter your email');
      return;
    }

    if (!password) {
      Alert.alert('Required Field', 'Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error('Login error:', error);
        if (error.message.includes('Invalid login credentials')) {
          Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          Alert.alert('Email Not Verified', 'Please verify your email before logging in');
        } else {
          Alert.alert('Login Error', 'Unable to sign in. Please try again later.');
        }
      } else {
        // Check if user is verified
        if (!data.user?.email_confirmed_at) {
          Alert.alert('Email Not Verified', 'Please verify your email before logging in');
        } else {
          // Navigate to dashboard after successful login
          router.replace('/seeker-dashboard');
          await sendVerificationEmail(email, 'User Name');
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password' as any);
  };

  const passwordStrength = getPasswordStrength(password);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleVerificationSuccess = () => {
    setShowVerificationModal(false);
    router.replace('/(seeker)/seeker-dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBackPress}
      >
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>

      <View style={styles.mainContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in with your email</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputsContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                inputAccessoryViewID={inputAccessoryViewID}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  inputAccessoryViewID={inputAccessoryViewID}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View style={[
                    styles.strengthBarProgress,
                    {
                      backgroundColor: passwordStrength.color,
                      width: `${passwordStrength.width}%`,
                    }
                  ]} />
                </View>
                <Text style={[
                  styles.strengthText,
                  { color: passwordStrength.color }
                ]}>
                  {passwordStrength.strength.charAt(0).toUpperCase() + 
                   passwordStrength.strength.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Verification Code <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Enter verification code"
                placeholderTextColor="#666"
                value={verificationCode}
                onChangeText={setVerificationCode}
                autoCapitalize="none"
                keyboardType="number-pad"
                returnKeyType="done"
                inputAccessoryViewID={inputAccessoryViewID}
              />
            </View>

            <TouchableOpacity 
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.loginButton,
            isLoading && styles.loginButtonDisabled
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/seeker-email-register' as any)}>
            <Text style={styles.registerLink}>Register with Email</Text>
          </TouchableOpacity>
        </View>
      </View>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={styles.inputAccessory}>
            <TouchableOpacity onPress={dismissKeyboard}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}

      <Modal
        visible={showVerificationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVerificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.verificationModal]}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowVerificationModal(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.verificationTitle}>Verification Email Sent</Text>
            <Text style={styles.verificationText}>
              A verification email has been sent to:
            </Text>
            <Text style={styles.emailText}>{email}</Text>
            <Text style={styles.verificationText}>Please check your inbox to verify.</Text>
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleVerificationSuccess}
            >
              <Text style={styles.verifyButtonText}>I've Verified My Email</Text>
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
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 10,
    zIndex: 999,
    padding: 10,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 30,
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
  },
  formContainer: {
    flex: 1,
  },
  inputsContainer: {
    flex: 1,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: '#000',
    marginTop: -40,
  },
  required: {
    color: '#FF3B30',
    fontSize: 16,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    color: '#fff',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 15,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF3B30',
    marginBottom: 4,
    width: '100%',
  },
  strengthBarProgress: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  strengthText: {
    fontSize: 12,
    textAlign: 'right',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  inputAccessory: {
    backgroundColor: '#f1f1f1',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  doneButton: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxWidth: 400,
  },
  verificationModal: {
    alignItems: 'center',
  },
  cancelButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  verificationText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 10,
  },
  emailText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 