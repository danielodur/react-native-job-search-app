import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';

interface SeekerPhoneRegisterProps {
  phoneNumber: string;
  countryCode: string;
  onBack: () => void;
}

export default function SeekerPhoneRegister({
  phoneNumber,
  countryCode,
  onBack,
}: SeekerPhoneRegisterProps) {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputAccessoryViewID = 'uniqueInputAccessoryViewID';

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
    // Validate required fields
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your full name');
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
      const { error } = await supabase.auth.signUp({
        phone: `${countryCode}${phoneNumber}`,
        password: password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        Alert.alert('Registration Error', error.message);
      } else {
        Alert.alert(
          'Success',
          'Account created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace({
                  pathname: '/(seeker)/seeker-resume',
                  params: { 
                    phone: `${countryCode}${phoneNumber}`,
                    fullName: fullName
                  }
                });
              }
            }
          ],
          { userInterfaceStyle: 'dark' }
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

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

      <View style={styles.mainContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Please fill in your details</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputsContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#666"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                returnKeyType="next"
                inputAccessoryViewID={inputAccessoryViewID}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
              <View style={styles.phoneInput}>
                <Text style={styles.phoneText}>{countryCode} {phoneNumber}</Text>
              </View>
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
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomContainer}>
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
  phoneInputContainer: {
    marginBottom: 20,
  },
  phoneInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
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
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonDisabled: {
    opacity: 0.7,
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
}); 