import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';

export default function AvatarUploadTest() {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Auth error:', error);
      Alert.alert('Auth Error', 'Please sign in to upload avatars');
      setIsAuthenticated(false);
      return;
    }
    setIsAuthenticated(!!user);
    console.log('Auth status:', user ? 'Authenticated' : 'Not authenticated');
  };

  const handleImagePick = async () => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please sign in to upload avatars');
      return;
    }

    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission result:', permissionResult);
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      // Pick the image
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Picker result:', pickerResult);

      if (!pickerResult.canceled) {
        setUploading(true);
        console.log('Starting upload process...');

        try {
          const uri = pickerResult.assets[0].uri;
          const fileName = `avatar-${Date.now()}.jpg`;
          const filePath = fileName; // Remove public/ prefix
          
          console.log('Uploading to path:', filePath);
          console.log('File URI:', uri);

          // Fetch the image data
          const response = await fetch(uri);
          const blob = await response.blob();
          console.log('Blob size:', blob.size);

          // Upload image
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, blob, {
              contentType: 'image/jpeg',
              upsert: true
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw uploadError;
          }

          console.log('Upload successful:', uploadData);

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          console.log('Public URL:', urlData.publicUrl);
          setAvatarUrl(urlData.publicUrl);
          Alert.alert('Success', 'Avatar uploaded successfully!');
        } catch (error: any) {
          console.error('Detailed upload error:', error);
          Alert.alert(
            'Upload Error',
            `Failed to upload avatar: ${error.message || 'Unknown error'}`
          );
        }
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      Alert.alert(
        'Error',
        `An error occurred while picking the image: ${error.message || 'Unknown error'}`
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avatar Upload Test</Text>
      
      <Text style={styles.status}>
        Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </Text>
      
      {avatarUrl && (
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
          />
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => {
              setAvatarUrl(`${avatarUrl}?t=${Date.now()}`);
            }}
          >
            <Text style={styles.refreshButtonText}>Refresh Image</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.button, uploading && styles.buttonDisabled]}
        onPress={handleImagePick}
        disabled={uploading || !isAuthenticated}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {avatarUrl ? 'Change Avatar' : 'Upload Avatar'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={checkAuth}
      >
        <Text style={styles.buttonText}>Check Auth Status</Text>
      </TouchableOpacity>

      {avatarUrl && (
        <View style={styles.urlContainer}>
          <Text style={styles.urlLabel}>Image URL:</Text>
          <Text style={styles.urlText} numberOfLines={2}>
            {avatarUrl}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  status: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
    backgroundColor: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  urlContainer: {
    width: '100%',
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  urlLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  urlText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
}); 