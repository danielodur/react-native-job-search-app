import React, { useState, useRef, useEffect } from 'react';
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
  InputAccessoryView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import SeekerPhoneRegister from '../(auth)/seeker-phone-register';

interface SeekerVerificationScreenProps {
  phoneNumber: string;
  countryCode: string;
  onBack: () => void;
  onVerificationSuccess: () => void;
}

export default function SeekerVerificationScreen({
  phoneNumber,
  countryCode,
  onBack,
  onVerificationSuccess,
}: SeekerVerificationScreenProps) {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [focusedInput, setFocusedInput] = useState<number | null>(null);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const inputAccessoryViewID = 'verificationCodeInput';
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendTimer]);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[text.length - 1];
    }

    const newCode = [...verificationCode];
    newCode[index] = text;
    setVerificationCode(newCode);

    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (text.length === 1 && index === 5) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleDone = () => {
    Keyboard.dismiss();
    setFocusedInput(null);
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      Alert.alert(
        'Invalid Code',
        'Please enter a valid 6-digit verification code',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'dark' }
      );
      return;
    }

    // For testing purposes, only allow specific code
    if (code !== '123456') {
      Alert.alert(
        'For testing purposes, please use:\n\nVerification Code: 123456',
        '',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'dark' }
      );
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowRegistration(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResendTimer(60);
      Alert.alert(
        'Code Sent',
        'A new verification code has been sent to your phone',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'dark' }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showRegistration) {
    return (
      <SeekerPhoneRegister
        phoneNumber={phoneNumber}
        countryCode={countryCode}
        onBack={() => setShowRegistration(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <TouchableOpacity 
        style={styles.backButton}
        onPress={onBack}
      >
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Enter Verification Code</Text>
              <Text style={styles.subtitle}>
                Please enter the 6-digit code sent to{'\n'}
                {countryCode} {phoneNumber}
              </Text>
            </View>

            <View style={styles.codeContainer}>
              {verificationCode.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => inputRefs.current[index] = ref}
                  style={[
                    styles.codeInput,
                    focusedInput === index && styles.codeInputFocused
                  ]}
                  value={digit}
                  onChangeText={text => handleCodeChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  selectionColor="#007AFF"
                  onFocus={() => setFocusedInput(index)}
                  onBlur={() => setFocusedInput(null)}
                  inputAccessoryViewID={inputAccessoryViewID}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.verifyButton,
                isLoading && styles.verifyButtonDisabled
              ]}
              onPress={handleVerifyCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify</Text>
              )}
            </TouchableOpacity>

            <View style={styles.helpContainer}>
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendCode}
                disabled={resendTimer > 0 || isLoading}
              >
                <Text style={[
                  styles.resendText,
                  (resendTimer > 0 || isLoading) && styles.resendTextDisabled
                ]}>
                  {resendTimer > 0
                    ? `Resend code in ${resendTimer}s`
                    : 'Resend code'
                  }
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.helpButton}
                onPress={() => setShowHelpModal(true)}
              >
                <Text style={styles.helpText}>Can't receive code?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={styles.inputAccessory}>
            <TouchableOpacity onPress={handleDone}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}

      <Modal
        visible={showHelpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowHelpModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Having trouble?</Text>
                <Text style={styles.modalText}>
                  If you haven't received the verification code:
                  {'\n\n'}
                  1. Check if your phone number is correct
                  {'\n'}
                  2. Check your network connection
                  {'\n'}
                  3. Wait a few minutes and try again
                  {'\n'}
                  4. Contact support if the issue persists
                </Text>
                <View style={styles.modalDivider} />
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowHelpModal(false)}
                >
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  codeInput: {
    width: 45,
    height: 56,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
  },
  codeInputFocused: {
    borderColor: '#007AFF',
    backgroundColor: '#1a1a1a',
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpContainer: {
    alignItems: 'center',
  },
  resendButton: {
    marginBottom: 16,
  },
  resendText: {
    color: '#007AFF',
    fontSize: 16,
  },
  resendTextDisabled: {
    color: '#666',
  },
  helpButton: {
    padding: 8,
  },
  helpText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    width: '80%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  modalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#333',
    marginVertical: 16,
  },
  modalButton: {
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputAccessory: {
    height: 44,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingHorizontal: 16,
  },
  doneButton: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
}); 