import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SocialMediaProfile {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  provider: string;
}

interface Props {
  onClose: () => void;
  onPermit: () => void;
  onReject: () => void;
  socialType: 'google' | 'facebook' | 'whatsapp';
  userProfile: SocialMediaProfile;
}

export default function SocialMediaConfirmScreen({
  onClose,
  onPermit,
  onReject,
  socialType,
  userProfile
}: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Confirm Social Login</Text>
        <Text style={styles.subtitle}>
          Do you want to continue with {socialType}?
        </Text>
        
        <View style={styles.profileInfo}>
          <Text style={styles.infoText}>Name: {userProfile.name}</Text>
          <Text style={styles.infoText}>Email: {userProfile.email}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.rejectButton]} 
            onPress={onReject}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.permitButton]} 
            onPress={onPermit}
          >
            <Text style={[styles.buttonText, styles.permitButtonText]}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  profileInfo: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  rejectButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  permitButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  permitButtonText: {
    color: '#fff',
  },
}); 