import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput as RNTextInput,
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
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SeekerPhoneVerification() {
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;
  const countryCode = params.countryCode as string;
  const isExistingUser = params.isExistingUser === 'true';

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const otpInputs = useRef<RNTextInput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputAccessoryViewID = 'uniqueInputAccessoryViewID';
  const [countdown, setCountdown] = useState(55);
  const [canResend, setCanResend] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
            router.replace('/SeekerHomeScreen');
          }
        }
      ],
      { userInterfaceStyle: 'dark' }
    );
  };

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1 || (text && !/^[0-9]$/.test(text))) {
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      otpInputs.current[index + 1]?.focus();
    } else if (text && index === 5) {
      // When the last digit is entered, automatically verify
      const completeOtp = [...newOtp.slice(0, 5), text].join('');
      if (completeOtp.length === 6) {
        handleVerifyOTP(completeOtp);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        otpInputs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const storePhoneInStorage = async () => {
    try {
      await AsyncStorage.setItem('userPhoneNumber', phoneNumber);
      await AsyncStorage.setItem('userCountryCode', countryCode);
    } catch (storageError) {
      console.error('Failed to store phone in AsyncStorage:', storageError);
      // Continue anyway - not critical
    }
  };

  const handleVerifyOTP = async (otpToVerify?: string) => {
    const codeToVerify = otpToVerify || otp.join('');
    if (!codeToVerify || codeToVerify.length < 6) {
      Alert.alert(
        'Invalid Code',
        'Please enter all 6 digits of the verification code.',
        [{ text: 'OK' }],
        { userInterfaceStyle: 'dark' }
      );
      return;
    }

    setIsLoading(true);
    
    try {
      // For development, accept test code 123456
      if (codeToVerify === '123456') {
        // Reduced loading time to 300ms for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        
        try {
          // For development, we'll skip the profile check
          // and go straight to registration
          router.replace({
            pathname: '/(auth)/seeker-phone-register',
            params: {
              phoneNumber,
              countryCode
            }
          });
          return;
        } catch (error) {
          // If navigation fails, show a user-friendly message
          Alert.alert(
            'Error',
            'Please try again.',
            [{ 
              text: 'OK',
              onPress: () => {
                setOtp(Array(6).fill(''));
                otpInputs.current[0]?.focus();
              }
            }],
            { userInterfaceStyle: 'dark' }
          );
        }
      } else {
        Alert.alert(
          'Verification Failed',
          'Wrong verification code. Please try again.',
          [{ 
            text: 'OK',
            onPress: () => {
              setOtp(Array(6).fill(''));
              otpInputs.current[0]?.focus();
            }
          }],
          { userInterfaceStyle: 'dark' }
        );
        setIsLoading(false);
        return;
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Please try again.',
        [{ 
          text: 'OK',
          onPress: () => {
            setOtp(Array(6).fill(''));
            otpInputs.current[0]?.focus();
          }
        }],
        { userInterfaceStyle: 'dark' }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const CustomAlert = () => (
    <Modal
      transparent
      visible={modalVisible}
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.alertContainer}>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Code Resent</Text>
            <View style={styles.alertMessageContainer}>
              <Text style={styles.alertMessage}>Code resent to xxxxxxxx</Text>
              <Text style={styles.alertHighlightedDigits}>{phoneNumber.slice(-4)}</Text>
              <Text style={styles.alertMessage}>, please enter code:</Text>
            </View>
          </View>
          <View style={styles.alertDivider} />
          <TouchableOpacity
            style={styles.alertButton}
            onPress={() => {
              setModalVisible(false);
              // Simple focus after alert dismissal
              otpInputs.current[0]?.focus();
            }}
          >
            <Text style={styles.alertButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const handleResendCode = async () => {
    if (!canResend) {
      Alert.alert(
        'Please Wait',
        `You can request a new code in ${countdown} seconds.`,
        [{ text: 'OK' }],
        { userInterfaceStyle: 'dark' }
      );
      return;
    }

    // Clear existing OTP inputs
    setOtp(Array(6).fill(''));
    
    // Dismiss keyboard before showing alert
    Keyboard.dismiss();
    
    // Show the alert
    setModalVisible(true);
    
    // Start countdown only after showing alert
    setCountdown(55);
    setCanResend(false);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      setCanResend(false);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBackPress}
      >
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.mainContent}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Verify Phone Number</Text>
              <View style={styles.subtitleContainer}>
                <Text style={styles.subtitle}>
                  Enter the 6-digit code sent to{' '}
                </Text>
                <Text style={styles.subtitle}>
                  {'xxxxxxxx'}
                  <Text style={styles.highlightedDigits}>
                    {phoneNumber.slice(-4)}
                  </Text>
                </Text>
              </View>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.otpContainer}>
                {otp.map((value, index) => (
                  <RNTextInput
                    key={index}
                    style={[
                      styles.otpInput, 
                      focusedIndex === index && styles.otpInputFocused
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    value={value}
                    ref={(el) => {
                      if (el) {
                        otpInputs.current[index] = el;
                      }
                    }}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    caretHidden
                    selectTextOnFocus
                    textAlign="center"
                    inputAccessoryViewID={inputAccessoryViewID}
                  />
                ))}
              </View>

              <View style={styles.bottomContainer}>
                <TouchableOpacity
                  style={[
                    styles.verifyButton,
                    isLoading && styles.verifyButtonDisabled
                  ]}
                  onPress={() => handleVerifyOTP()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.verifyButtonText}>Verify Code</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.resendContainer}>
                  <Text style={styles.resendStaticText}>Didn't receive code? </Text>
                  {canResend ? (
                    <TouchableOpacity 
                      style={styles.resendButton}
                      onPress={handleResendCode}
                      disabled={isLoading}
                    >
                      <Text style={styles.resendLinkText}>Resend</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.countdownText}>{`Resend in ${countdown}s`}</Text>
                  )}
                </View>
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

      <CustomAlert />
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
    top: Platform.OS === 'ios' ? 45 : 25,
    left: 10,
    zIndex: 1000,
    padding: 10,
    elevation: 10,
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
  subtitleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  highlightedDigits: {
    color: '#007AFF',
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    color: '#007AFF',
    backgroundColor: '#1a1a1a',
    fontWeight: 'bold',
  },
  otpInputFocused: {
    borderColor: '#007AFF',
    borderWidth: 2,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    marginHorizontal: -20,
    backgroundColor: '#000',
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 10,
  },
  resendStaticText: {
    color: '#888',
    fontSize: 14,
  },
  resendButton: {
  },
  resendLinkText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  countdownText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
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
  alertContainer: {
    backgroundColor: '#2C2C2E', // Standard iOS dark gray
    borderRadius: 14,
    width: '80%',
    maxWidth: 340,
    overflow: 'hidden',
  },
  alertContent: {
    padding: 20,
    paddingBottom: 16,
  },
  alertTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  alertMessageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertMessage: {
    color: '#fff',
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 22,
  },
  alertHighlightedDigits: {
    color: '#0A84FF', // iOS blue
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  alertDivider: {
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Light divider
    width: '100%',
  },
  alertButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertButtonText: {
    color: '#0A84FF', // iOS blue
    fontSize: 18,
    fontWeight: '600',
  },
}); 