import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  SafeAreaView,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface CreateProfileScreenProps {
  onClose: () => void;
  onComplete: (data: { nickname: string; avatarUrl?: string }) => void;
}

export default function CreateProfileScreen({ onClose, onComplete }: CreateProfileScreenProps) {
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const avatarOptionsAnim = useRef(new Animated.Value(0)).current;
  const bottomSheetAnim = useRef(new Animated.Value(0)).current;

  const isFormComplete = nickname.trim().length > 0;

  const showBottomSheet = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 8,
    }).start();
  };

  const hideBottomSheet = (anim: Animated.Value, onComplete?: () => void) => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(onComplete);
  };

  const handleCancel = () => {
    setShowCancelAlert(true);
    showBottomSheet(bottomSheetAnim);
  };

  const handleAvatarPress = () => {
    setShowAvatarOptions(true);
    showBottomSheet(avatarOptionsAnim);
  };

  const hideAvatarOptions = () => {
    hideBottomSheet(avatarOptionsAnim, () => setShowAvatarOptions(false));
  };

  const hideCancelAlert = () => {
    hideBottomSheet(bottomSheetAnim, () => setShowCancelAlert(false));
  };

  const handleComplete = () => {
    if (isFormComplete) {
      onComplete({ nickname, avatarUrl });
    }
  };

  const translateY = bottomSheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const translateYAvatar = avatarOptionsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  useEffect(() => {
    (async () => {
      // Request camera permissions
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      // Request photo library permissions
      const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();
  }, []);

  const takePicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setAvatarUrl(result.assets[0].uri);
        hideAvatarOptions();
      }
    } catch (error) {
      console.log('Error taking picture:', error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setAvatarUrl(result.assets[0].uri);
        hideAvatarOptions();
      }
    } catch (error) {
      console.log('Error picking image:', error);
    }
  };

  const generateRandomAvatar = async () => {
    try {
      setIsLoading(true);
      // List of different avatar styles from DiceBear
      const styles = [
        'adventurer',
        'adventurer-neutral',
        'avataaars',
        'big-ears',
        'big-smile',
        'bottts',
        'croodles',
        'fun-emoji',
        'lorelei',
        'micah',
        'miniavs',
        'personas',
        'pixel-art',
        'thumbs'
      ];
      
      // Generate random seed and style
      const randomSeed = Math.random().toString(36).substring(7);
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      
      // Create URL for DiceBear API
      const newAvatarUrl = `https://api.dicebear.com/7.x/${randomStyle}/png?seed=${randomSeed}&size=200&backgroundColor=transparent`;
      
      setAvatarUrl(newAvatarUrl);
      hideAvatarOptions();
    } catch (error) {
      console.error('Error generating avatar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.rootContainer}>
        <SafeAreaView style={styles.container}>
          <View style={styles.topBar}>
            <TouchableOpacity 
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleComplete}
              disabled={!isFormComplete}
              style={[
                styles.completeButton,
                isFormComplete && styles.completeButtonActive
              ]}
            >
              <Text style={[
                styles.completeText,
                isFormComplete && styles.completeTextActive
              ]}>
                Complete
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Create new Profile</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Avatar</Text>
            <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
              {avatarUrl ? (
                <Image 
                  source={{ uri: avatarUrl }} 
                  style={styles.avatarImage} 
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person-outline" size={32} color="#666" />
                </View>
              )}
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color="#666" 
                style={styles.chevron}
              />
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nickname</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter nickname"
                placeholderTextColor="#666"
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Avatar Options Bottom Sheet */}
          {showAvatarOptions && (
            <View style={styles.bottomSheetOverlay}>
              <TouchableOpacity 
                style={styles.overlay} 
                onPress={hideAvatarOptions}
                activeOpacity={1}
              />
              <Animated.View
                style={[
                  styles.bottomSheet,
                  {
                    transform: [{
                      translateY: avatarOptionsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [300, 0],
                      })
                    }]
                  }
                ]}
              >
                <View style={styles.avatarOptionsContainer}>
                  <TouchableOpacity 
                    style={styles.avatarOption}
                    onPress={takePicture}
                  >
                    <Text style={styles.avatarOptionText}>Take a picture</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.optionSeparator} />
                  
                  <TouchableOpacity 
                    style={styles.avatarOption}
                    onPress={pickImage}
                  >
                    <Text style={styles.avatarOptionText}>Select from album</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.optionSeparator} />
                  
                  <TouchableOpacity 
                    style={styles.avatarOption}
                    onPress={generateRandomAvatar}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator color="#fff" />
                        <Text style={[styles.avatarOptionText, { marginLeft: 8 }]}>
                          Generating...
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.avatarOptionText}>Random Avatar</Text>
                    )}
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={styles.cancelAvatarButton}
                  onPress={hideAvatarOptions}
                >
                  <Text style={styles.cancelAvatarText}>Cancel</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}

          {showCancelAlert && (
            <View style={styles.bottomSheetOverlay}>
              <TouchableOpacity 
                style={styles.overlay} 
                onPress={hideCancelAlert}
                activeOpacity={1}
              />
              <Animated.View
                style={[
                  styles.bottomSheet,
                  {
                    transform: [{
                      translateY: bottomSheetAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [300, 0],
                      })
                    }]
                  }
                ]}
              >
                <View style={styles.bottomSheetContent}>
                  <Text style={styles.bottomSheetTitle}>
                    Cancel editing, your new avatar and nickname will not be saved
                  </Text>
                  <TouchableOpacity 
                    style={styles.cancelEditButton} 
                    onPress={onClose}
                  >
                    <Text style={styles.cancelEditText}>Cancel Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.continueButton}
                    onPress={hideCancelAlert}
                  >
                    <Text style={styles.continueText}>Continue Editing</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          )}
        </SafeAreaView>
      </View>
    </>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#000',
    ...Platform.select({
      ios: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      android: {
        elevation: 999,
      },
    }),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 8,
    backgroundColor: '#000',
    borderBottomColor: '#1a1a1a',
    borderBottomWidth: 1,
  },
  cancelButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#000',
  },
  headerTitleText: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cancelText: {
    color: '#888',
    fontSize: 17,
    fontWeight: '400',
  },
  completeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: -8,
  },
  completeButtonActive: {
    opacity: 1,
  },
  completeText: {
    color: '#666',
    fontSize: 17,
    fontWeight: '600',
  },
  completeTextActive: {
    color: '#007AFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: SCREEN_HEIGHT * 0.08,
    backgroundColor: '#000',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#333',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: 8,
    marginRight: 8,
  },
  inputContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    color: '#fff',
    fontSize: 17,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  bottomSheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheet: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  bottomSheetContent: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 16,
  },
  bottomSheetTitle: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  cancelEditButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelEditText: {
    color: '#ff3b30',
    fontSize: 17,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  avatarOptionsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  avatarOption: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
  },
  avatarOptionText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '400',
  },
  optionSeparator: {
    height: 1,
    backgroundColor: '#222',
  },
  cancelAvatarButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelAvatarText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#333',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 