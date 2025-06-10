import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  TextInput as TextInputType,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function SeekerEmailRegister() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('Weak');
  const [confirmPasswordStrength, setConfirmPasswordStrength] = useState('');
  const [hasUserInput, setHasUserInput] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const router = useRouter();
  
  const fullNameRef = useRef<TextInputType>(null);
  const emailRef = useRef<TextInputType>(null);
  const passwordRef = useRef<TextInputType>(null);
  const confirmPasswordRef = useRef<TextInputType>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const checkPasswordStrength = (pass: string) => {
    if (!pass) {
      setPasswordStrength('');
      return;
    }
    
    if (pass.length < 8) {
      setPasswordStrength('Weak');
      return;
    }

    const hasLowerCase = /[a-z]/.test(pass);
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    
    const strength = [hasLowerCase, hasUpperCase, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (strength === 4 && pass.length >= 10) {
      setPasswordStrength('Strong');
    } else if (strength >= 3 && pass.length >= 8) {
      setPasswordStrength('Medium');
    } else {
      setPasswordStrength('Weak');
    }
  };

  const checkConfirmPasswordStrength = (pass: string) => {
    if (!pass) {
      setConfirmPasswordStrength('');
      return;
    }
    
    if (pass === password) {
      setConfirmPasswordStrength('Match');
    } else {
      setConfirmPasswordStrength('Mismatch');
    }
  };
  
  const updateUserInput = () => {
    if (fullName || email || password || confirmPassword) {
      setHasUserInput(true);
    } else {
      setHasUserInput(false);
    }
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

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
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

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        console.error('Signup error:', error.message);
        Alert.alert('Registration Error', error.message || 'Unable to complete registration. Please try again later.');
      } else if (data.user) {
        Alert.alert(
          'Registration Successful', 
          'Your account has been created.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Navigate to resume screen with user data
                router.push({
                  pathname: '/(auth)/seeker-resume',
                  params: {
                    fullName: fullName.trim(),
                    email: email.trim(),
                  }
                });
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Registration error:', error.message);
      Alert.alert('Error', error.message || 'An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Strong':
        return '#4CAF50';
      case 'Medium':
        return '#FFC107';
      case 'Weak':
        return '#FF5252';
      case 'Match':
        return '#4CAF50';
      case 'Mismatch':
        return '#FF5252';
      default:
        return '#FF5252';
    }
  };

  const handleBackPress = () => {
    if (hasUserInput) {
      Alert.alert(
        'Warning',
        'If you go back, your data will be lost. Are you sure?',
        [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => {}, // Do nothing
            isPreferred: true 
          },
          { 
            text: 'Yes', 
            style: 'destructive',
            onPress: () => router.back() 
          }
        ],
        { cancelable: true }
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.wrapper}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.mainContent}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Please fill in your details</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputWithClear}>
                <TextInput
                  ref={fullNameRef}
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#888"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    updateUserInput();
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  blurOnSubmit={false}
                />
                {fullName.length > 0 && (
                  <TouchableOpacity 
                    style={styles.clearButton} 
                    onPress={() => {
                      setFullName('');
                      fullNameRef.current?.focus();
                      updateUserInput();
                    }}
                  >
                    <Ionicons name="close-circle" size={20} color="#888" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputWithClear}>
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    updateUserInput();
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                />
                {email.length > 0 && (
                  <TouchableOpacity 
                    style={styles.clearButton} 
                    onPress={() => {
                      setEmail('');
                      emailRef.current?.focus();
                      updateUserInput();
                    }}
                  >
                    <Ionicons name="close-circle" size={20} color="#888" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={passwordRef}
                  style={styles.passwordInput}
                  placeholder="Enter password"
                  placeholderTextColor="#888"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    checkPasswordStrength(text);
                    if (confirmPassword) {
                      checkConfirmPasswordStrength(confirmPassword);
                    }
                    updateUserInput();
                  }}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#888" />
                </TouchableOpacity>
              </View>
              <View style={[styles.strengthBar, { backgroundColor: getStrengthColor(passwordStrength) }]} />
              <Text style={[styles.strengthText, { color: getStrengthColor(passwordStrength) }]}>{passwordStrength}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password <Text style={styles.required}>*</Text></Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={confirmPasswordRef}
                  style={styles.passwordInput}
                  placeholder="Confirm password"
                  placeholderTextColor="#888"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    checkConfirmPasswordStrength(text);
                    updateUserInput();
                  }}
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                    if (fullName && email && password && confirmPassword) {
                      handleRegister();
                    }
                  }}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#888" />
                </TouchableOpacity>
              </View>
              <View style={[styles.strengthBar, { backgroundColor: getStrengthColor(confirmPasswordStrength) }]} />
              <Text style={[styles.strengthText, { color: getStrengthColor(confirmPasswordStrength) }]}>
                {confirmPasswordStrength === 'Match' ? 'Passwords Match' : 'Passwords Do Not Match'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? 
                <ActivityIndicator color="#fff" /> : 
                <Text style={styles.registerButtonText}>Create Account</Text>
              }
            </TouchableOpacity>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/seeker-email-login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        {keyboardVisible && Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.keyboardDoneButton}
            onPress={() => Keyboard.dismiss()}
          >
            <Text style={styles.keyboardDoneButtonText}>Done</Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  wrapper: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 15,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
  },
  headerSection: {
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 15,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 15,
    width: '100%',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  required: {
    color: 'red',
  },
  inputWithClear: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  strengthBar: {
    height: 3,
    width: '100%',
    backgroundColor: '#FF5252',
    marginTop: 4,
  },
  strengthText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    width: '100%',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  loginText: {
    color: '#888',
    fontSize: 16,
  },
  loginLink: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  keyboardDoneButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#212121',
    padding: 10,
    borderTopLeftRadius: 8,
    zIndex: 100,
  },
  keyboardDoneButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});