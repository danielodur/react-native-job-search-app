import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { phoneAuthService } from '../../services/phoneAuth';

export default function PhoneVerificationTest() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!phone) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = `+${phone}`; // Add + prefix for actual API call
      const { error, success } = await phoneAuthService.signUpWithPhone(formattedPhone);
      
      if (error) {
        Alert.alert('Error', error.message);
      } else if (success) {
        setIsCodeSent(true);
        Alert.alert('Success', 'Verification code sent!');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = `+${phone}`;
      const { error, success } = await phoneAuthService.verifyOTP(formattedPhone, otp);
      
      if (error) {
        Alert.alert('Error', error.message);
      } else if (success) {
        Alert.alert('Success', 'Phone number verified!');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Phone number (without + prefix)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={!isCodeSent}
        placeholderTextColor="#666"
      />
      
      {!isCodeSent && (
        <TouchableOpacity 
          style={styles.button}
          onPress={handleSendCode}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Sending...' : 'Send Verification Code'}
          </Text>
        </TouchableOpacity>
      )}

      {isCodeSent && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter verification code"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            placeholderTextColor="#666"
          />
          <TouchableOpacity 
            style={styles.button}
            onPress={handleVerifyCode}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#fff',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});