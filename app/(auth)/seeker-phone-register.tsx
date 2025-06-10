import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Session, User } from '@supabase/supabase-js';

export default function SeekerPhoneRegister() {
  // Get route params
  const params = useLocalSearchParams();
  const initialPhoneNumber = params.phoneNumber as string || '';
  const countryCode = params.countryCode as string || '';

  // State variables
  const [phoneNumber] = useState(initialPhoneNumber);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  
  const router = useRouter();
  const inputAccessoryViewID = 'uniqueInputAccessoryViewID';

  // Simple check for auth user - no timeout, no automatic actions
  useEffect(() => {
    let isMounted = true;

    // Just fetch the current user once
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (isMounted && user) {
        setAuthUser(user);
      }
    });

    // Simple listener for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setAuthUser(session?.user ?? null);
      }
    });

    // Cleanup listener on unmount
    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Add validation function for phone number
  const validatePhoneNumber = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    
    if (!cleanNumber) {
      return 'Please enter your phone number';
    }
    
    if (cleanNumber.length < 9) {
      return 'Please enter a valid phone number with at least 9 digits';
    }
    
    if (cleanNumber.length > 15) {
      return 'The phone number is too long. Please check and try again';
    }
    
    return null;
  };

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

    // Check if password meets all criteria
    if (hasUpperCase && hasLowerCase && hasNumbers && isLongEnough) {
      return { strength: 'strong', color: '#34C759', width: 100 };
    }

    // Check if password meets some criteria
    const criteriaCount = [hasUpperCase, hasLowerCase, hasNumbers].filter(Boolean).length;
    if (pass.length >= 6) {
      if (criteriaCount >= 2) {
        return { strength: 'medium', color: '#30D158', width: 66 };
      }
    }

    return { strength: 'weak', color: '#FF3B30', width: 33 };
  };

  const handleBackPress = () => {
    Alert.alert(
      'Warning',
      'If you go back, your data will be lost. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive', 
          onPress: () => {
            // Clear all form data
            setFullName('');
            setPassword('');
            setConfirmPassword('');
            // Navigate back to seeker home screen
            router.replace('/SeekerHomeScreen');
          }
        }
      ],
      { userInterfaceStyle: 'dark' }
    );
  };

  const handleCreateAccount = async () => {
    // Always validate all fields first
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your full name');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Required Field', 'Please enter your phone number');
      return;
    }

    const phoneValidationError = validatePhoneNumber(phoneNumber);
    if (phoneValidationError) {
      Alert.alert('Invalid Phone Number', phoneValidationError);
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
      // Try to get current user - but don't block if not available
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      
      if (user) {
        // If we have a user, update their profile
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
          data: {
            full_name: fullName.trim(),
            phone_number: `${countryCode}${phoneNumber.trim()}`,
          },
        });

        if (updateError) {
          console.error("Error updating user:", updateError.message);
          Alert.alert('Registration Error', `Could not save profile information: ${updateError.message}`);
          setIsLoading(false);
          return;
        }
      } else {
        // For testing, we'll continue even without a valid user
        console.log("No authenticated user found, but continuing for testing");
      }
      
      // Always proceed to success for testing purposes
      handleNavigateToResume();
    } catch (error) {
      console.error("Create account catch error:", error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Direct navigation without alert
  const handleNavigateToResume = () => {
    router.replace({
      pathname: '/(auth)/seeker-resume',
      params: {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber,
        countryCode: countryCode
      }
    });
  };

  // Keep the alert version for backward compatibility
  const handleVerificationSuccess = () => {
    Alert.alert(
      'Success',
      'Your account has been created successfully! You can now set up your resume profile.',
      [
        {
          text: 'Continue to Resume Setup',
          onPress: handleNavigateToResume
        }
      ],
      { userInterfaceStyle: 'dark' }
    );
  };

  const passwordStrength = getPasswordStrength(password);
  const ConfirmPasswordStrength = getPasswordStrength(confirmPassword);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
          <View style={styles.mainFlexContainer}>
            <View style={styles.contentArea}>
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Please fill in your details</Text>
              </View>

              <View style={styles.inputsOnlyContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={[styles.input, { color: '#fff' }]}
                    placeholder="Enter your full name"
                    placeholderTextColor="#666"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    returnKeyType="next"
                    inputAccessoryViewID={inputAccessoryViewID}
                    editable={true}
                    selectTextOnFocus={true}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
                  <View style={styles.phoneContainer}>
                    <View style={styles.countryCodeDisplay}>
                      <Text style={styles.phoneText}>{countryCode}</Text>
                    </View>
                    <TextInput
                      style={[styles.phoneInput, { color: '#fff' }]}
                      placeholder="Enter your phone number"
                      placeholderTextColor="#666"
                      value={phoneNumber}
                      editable={false}
                      selectTextOnFocus={false}
                      keyboardType="phone-pad"
                      returnKeyType="next"
                      inputAccessoryViewID={inputAccessoryViewID}
                    />
                  </View>
                </View>

                <View style={[styles.inputWrapper, { marginBottom: 10 }]}>
                  <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Enter password"
                      placeholderTextColor="#666"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      returnKeyType="next"
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
                  <Text style={styles.label}>Confirm Password <Text style={styles.required}>*</Text></Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Confirm password"
                      placeholderTextColor="#666"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      returnKeyType="done"
                      inputAccessoryViewID={inputAccessoryViewID}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
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
                          backgroundColor: ConfirmPasswordStrength.color,
                          width: `${ConfirmPasswordStrength.width}%`,
                        }
                      ]} />
                    </View>
                    <Text style={[
                      styles.strengthText,
                      { color: ConfirmPasswordStrength.color }
                    ]}>
                      {ConfirmPasswordStrength.strength.charAt(0).toUpperCase() + 
                       ConfirmPasswordStrength.strength.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.fixedBottomContainer}>
              <TouchableOpacity
                style={[
                  styles.createButton,
                  isLoading && styles.createButtonDisabled 
                ]}
                onPress={handleCreateAccount}
                disabled={isLoading} 
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/seeker-phone-login' as any)}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={styles.inputAccessory}>
            <TouchableOpacity onPress={dismissKeyboard}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
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
  keyboardAvoidingContainer: {
    flex: 1,
  },
  mainFlexContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contentArea: {
    paddingHorizontal: 20,
  },
  inputsOnlyContainer: {
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 20,
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
    paddingHorizontal: 20,
  },
  inputsContainer: {
  },
  inputWrapper: {
    marginBottom: 15,
  },
  fixedBottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 15,
    paddingTop: 10,
    backgroundColor: '#000',
    borderTopWidth: Platform.OS === 'android' ? 1 : 0,
    borderTopColor: '#1a1a1a',
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
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  countryCodeDisplay: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  phoneInput: {
    flex: 1,
    padding: 15,
    color: '#fff',
    fontSize: 16,
  },
  phoneText: {
    color: '#fff',
    fontSize: 16,
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
    backgroundColor: '#1a1a1a',
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
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonDisabled: {
    opacity: 0.5, 
    // Keep background the same when disabled for auth check, maybe change for loading?
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  helperText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 10,
  },
  resendText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
}); 