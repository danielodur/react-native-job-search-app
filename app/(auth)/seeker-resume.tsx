import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Switch,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Keyboard,
  Alert,
  ImageStyle,
  ViewStyle,
  StyleSheet,
  StyleProp,
  TextStyle,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import * as FileSystem from 'expo-file-system';
import { BlurView } from 'expo-blur';

// Types
interface WorkExperience {
  company: string;
  position: string;
  startDate: Date | null;
  endDate: Date | null;
  description: string;
  isCurrentJob: boolean;
}

type Language = {
  name: string;
  proficiency: 'Native' | 'Fluent' | 'Intermediate' | 'Beginner';
};

type Project = {
  title: string;
  description: string;
  technologies: string;
};

type Reference = {
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
};

interface PersonalInformation {
  fullName: string;
  dateOfBirth: Date | null;
  phoneNumber: string;
  email: string;
  gender: '' | 'male' | 'female';
  currentLocation: string;
  currentJobTitle: string;
  professionalBio: string;
  linkedinUrl: string;
  githubUrl: string;
  personalWebsite: string;
  projects: Project[];
  languages: Language[];
  references: Reference[];
  hasDisability: boolean;
  disabilityExplanation: string;
  profilePicture: string | null;
  workExperience: WorkExperience[];
  timeToReport: '' | 'Within a Week' | 'Within a Month' | 'Not sure';
  hometown: string;
}

const REQUIRED_FIELDS = {
  fullName: true,
  dateOfBirth: true,
  gender: true,
  location: true,
  hometown: true,
  currentJobTitle: true,
  bio: true,
};

// Add Uganda districts constant at the top
const UGANDA_DISTRICTS = [
  'Abim', 'Adjumani', 'Agago', 'Alebtong', 'Amolatar', 'Amudat', 'Amuria', 'Amuru', 'Apac', 'Arua',
  'Budaka', 'Bududa', 'Bugiri', 'Buhweju', 'Buikwe', 'Bukedea', 'Bukomansimbi', 'Bukwo', 'Bulambuli',
  'Buliisa', 'Bundibugyo', 'Bunyangabu', 'Bushenyi', 'Busia', 'Butaleja', 'Butambala', 'Butebo', 'Buvuma',
  'Buyende', 'Dokolo', 'Gomba', 'Gulu', 'Hoima', 'Ibanda', 'Iganga', 'Isingiro', 'Jinja', 'Kaabong',
  'Kabale', 'Kabarole', 'Kaberamaido', 'Kagadi', 'Kakumiro', 'Kalangala', 'Kaliro', 'Kalungu', 'Kampala',
  'Kamuli', 'Kamwenge', 'Kanungu', 'Kapchorwa', 'Kapelebyong', 'Karenga', 'Kasese', 'Katakwi', 'Kayunga',
  'Kazo', 'Kibaale', 'Kiboga', 'Kibuku', 'Kikuube', 'Kiruhura', 'Kiryandongo', 'Kisoro', 'Kitagwenda',
  'Kitgum', 'Koboko', 'Kole', 'Kotido', 'Kumi', 'Kwania', 'Kween', 'Kyankwanzi', 'Kyegegwa', 'Kyenjojo',
  'Kyotera', 'Lamwo', 'Lira', 'Luuka', 'Luwero', 'Lwengo', 'Lyantonde', 'Madi-Okollo', 'Manafwa',
  'Maracha', 'Masaka', 'Masindi', 'Mayuge', 'Mbale', 'Mbarara', 'Mitooma', 'Mityana', 'Moroto',
  'Moyo', 'Mpigi', 'Mubende', 'Mukono', 'Nabilatuk', 'Nakapiripirit', 'Nakaseke', 'Nakasongola',
  'Namayingo', 'Namisindwa', 'Namutumba', 'Napak', 'Nebbi', 'Ngora', 'Ntoroko', 'Ntungamo',
  'Nwoya', 'Obongi', 'Omoro', 'Otuke', 'Oyam', 'Pader', 'Pakwach', 'Pallisa', 'Rakai', 'Rubanda',
  'Rubirizi', 'Rukiga', 'Rukungiri', 'Rwampara', 'Sembabule', 'Serere', 'Sheema', 'Sironko',
  'Soroti', 'Tororo', 'Wakiso', 'Yumbe', 'Zombo'
];

// Define shadow styles with proper typing
const shadowStyle: ViewStyle = Platform.OS === 'ios' 
  ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }
  : {
      elevation: 4,
    };

// Define style types
interface CustomStyles {
  container: {
    base: ViewStyle;
  };
  text: {
    base: TextStyle;
  };
  input: {
    base: ViewStyle & { color?: string };
  };
  button: {
    base: ViewStyle;
  };
}

// Define component props
interface LocationButtonProps {
  onPress: () => void;
  location?: string;
}

interface VerifiedPhoneSectionProps {
  phoneNumber: string;
}

interface EmailInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  onClear?: () => void;
}

// Create base styles with proper typing
const baseStyles: CustomStyles = {
  container: StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1C1C1E',
      borderRadius: 10,
      padding: 15,
      marginBottom: 10,
    },
  }),
  text: StyleSheet.create({
    base: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  }),
  input: StyleSheet.create({
    base: {
      backgroundColor: '#1C1C1E',
      borderRadius: 10,
      padding: 15,
      color: '#fff',
    },
  }),
  button: StyleSheet.create({
    base: {
      backgroundColor: '#007AFF',
      borderRadius: 10,
      padding: 15,
      alignItems: 'center',
    },
  }),
};

// Define all styles in one place at the top of the file
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 15,
    width: '82%',
    alignItems: 'center',
  },
  modalInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3C3C3E',
  },
  modalDescription: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  selectionIconContainer: {
    marginRight: 10,
  },
  selectionText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  fixedHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 20,
    backgroundColor: '#000',
  },
  welcomeText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 5,
  },
  usernameText: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  setupText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  mainSectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 25,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 15,
  },
  profilePictureContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
  },
  emptyProfilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  defaultProfileIcon: {
    width: 60,
    height: 60,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#333',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  verifiedIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedTextContainer: {
    flex: 1,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 16,
  },
  verifiedCheckContainer: {
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    marginBottom: 15,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#333',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  clearButtonContainer: {
    padding: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  modalCloseButton: {
    padding: 8,
  },
  districtItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3C3C3E',
  },
  districtText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#2C2C2E',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorMessage: {
    color: '#FF3B30',
    marginTop: 5,
  },
  inputSection: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    flex: 1,
  },
  clearButton: {
    padding: 10,
  },
  verifiedPhoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  phoneIconContainer: {
    marginRight: 10,
  },
  phoneNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  bioContainer: {
    marginBottom: 20,
  },
  characterCount: {
    color: '#666',
    textAlign: 'right',
    marginTop: 5,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 15,
    flex: 0.48,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#333',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  dateButtonText: {
    color: '#fff',
    marginLeft: 10,
  },
  districtList: {
    maxHeight: 300,
  },
  workExperienceContainer: {
    marginBottom: 24,
  },
  workExperienceCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#333',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  workExperienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  workExperienceTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  experienceDeleteButton: {
    padding: 5,
  },
  addExperienceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#666',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    opacity: 0.8,
  },
  addExperienceText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    backgroundColor: 'transparent',
  },
  modalDeleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requiredStar: {
    color: '#FF3B30',
    marginLeft: 5,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    marginBottom: 15,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#333',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 2,
    height: 50,
    borderWidth: 1,
    borderColor: '#333',
  },
  emailInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: '100%',
  },
  locationButtonContainer: {
    marginLeft: 8,
  },
  shadowedInput: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  genderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  genderButtonText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#2C2C2E', // Changed to dull grey
    borderRadius: 10,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#8E8E93', // Changed to dull grey
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#666', // Change to grey
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '100%',
  },
  deleteIcon: {
    color: '#666',
  },
  workExperienceInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    marginBottom: 15,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  projectInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    marginBottom: 15,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  characterCounter: {
    color: '#666',
    fontSize: 14,
    textAlign: 'right',
    marginTop: -10,
    marginBottom: 15,
  },
  languageContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  languageInput: {
    flex: 1,
    marginRight: 10,
  },
  proficiencyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 10,
  },
  proficiencyButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  proficiencyButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  proficiencyButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  availabilityButtons: {
    flexDirection: 'column',
    gap: 10,
  },
  availabilityButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 25, // More rounded corners for oval shape
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the text
    marginVertical: 6, // Add some vertical spacing between buttons
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  availabilityButtonSelected: {
    backgroundColor: '#E5E5EA', // Changed to bright light grey
    borderColor: '#E5E5EA',
  },
  availabilityButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  availabilityButtonTextSelected: {
    color: '#8E8E93', // Changed to dull grey
    fontWeight: '600',
  },
  referenceCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  disabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  disabilityText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  disabilityNote: {
    color: '#999',
    fontSize: 14,
    marginTop: 5,
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  disabilitySection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    margin: 8,
  },
  checkboxLabel: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 8,
  },
  disabilityExplanationContainer: {
    marginTop: 10,
  },
  disabilityExplanation: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    height: 100,
    textAlignVertical: 'top',
  },
  projectContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#666',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    opacity: 0.8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  referenceContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  experienceContainer: {
    marginBottom: 24,
  },
  modalExperienceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalExperienceTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalExperienceSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  modalDeleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profilePictureButton: {
    backgroundColor: '#2C2C2E', // Changed to dull grey
    borderRadius: 10,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePictureButtonText: {
    color: '#8E8E93', // Changed to dull grey
    fontSize: 16,
    fontWeight: '600',
  },
  genderButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInputField: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3C3C3E',
  },
  districtListItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3C3C3E',
  },
  districtListText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 15,
    width: '82%',
    alignItems: 'center',
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  datePickerCloseButton: {
    padding: 8,
    position: 'absolute',
    right: -10,
    top: -10,
    zIndex: 1,
  },
  datePicker: {
    backgroundColor: '#1C1C1E',
    width: '100%',
    height: 160, // Reduced height
    marginVertical: 8,
  },
  datePickerDoneButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  datePickerDoneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 10,
    flexDirection: 'row',
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

const LocationButton: React.FC<LocationButtonProps> = ({ onPress, location }) => (
  <TouchableOpacity style={styles.selectionButton} onPress={onPress}>
    <View style={styles.selectionIconContainer}>
      <Ionicons name="location" size={24} color="#007AFF" />
    </View>
    <Text style={styles.selectionText}>{location || 'Select Location'}</Text>
    <View style={styles.locationButtonContainer}>
      <Ionicons name="navigate" size={24} color="#007AFF" />
    </View>
  </TouchableOpacity>
);

// Define SaveButton props interface
interface SaveButtonProps {
  onPress: () => void;
  disabled: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({ onPress, disabled }) => (
  <TouchableOpacity
    style={[styles.submitButton, disabled && styles.submitButtonDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.submitButtonText}>Submit</Text>
  </TouchableOpacity>
);

interface ProfilePictureModalProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onChooseFromGallery: () => void;
  onGenerateAvatar: () => void;
}

const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  visible,
  onClose,
  onTakePhoto,
  onChooseFromGallery,
  onGenerateAvatar
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onClose}
  >
    <BlurView
      intensity={10}
      style={styles.modalOverlay}
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Profile Picture</Text>
        
        <TouchableOpacity
          style={styles.profilePictureButton}
          onPress={onTakePhoto}
        >
          <Text style={styles.profilePictureButtonText}>Take a Picture</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profilePictureButton}
          onPress={onChooseFromGallery}
        >
          <Text style={styles.profilePictureButtonText}>Choose from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profilePictureButton}
          onPress={onGenerateAvatar}
        >
          <Text style={styles.profilePictureButtonText}>Generate Random Avatar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  </Modal>
);

const SeekerResume = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Initialize state with params
  const [personalInfo, setPersonalInfo] = useState<PersonalInformation>({
    fullName: params.fullName as string || '',
    dateOfBirth: null,
    phoneNumber: params.phoneNumber as string || '',
    email: params.email as string || '',
    gender: '',
    currentLocation: '',
    currentJobTitle: '',
    professionalBio: '',
    linkedinUrl: '',
    githubUrl: '',
    personalWebsite: '',
    projects: [],
    languages: [],
    references: [],
    hasDisability: false,
    disabilityExplanation: '',
    profilePicture: null,
    workExperience: [],
    timeToReport: '',
    hometown: '',
  });

  // Modal states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showMaritalModal, setShowMaritalModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showHomeTownModal, setShowHomeTownModal] = useState(false);
  const [showWorkLocationModal, setShowWorkLocationModal] = useState(false);
  const [showWorkExperienceModal, setShowWorkExperienceModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [showProfilePictureOptions, setShowProfilePictureOptions] = useState(false);
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Date picker state
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Add state for custom date picker modal
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // Add states for work experience dates
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [selectedExperienceIndex, setSelectedExperienceIndex] = useState<number | null>(null);
  const [bioLength, setBioLength] = useState(0);

  // Add state for work experience modal visibility
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Get first name for welcome message
  const firstName = React.useMemo(() => {
    if (!personalInfo.fullName) return 'User';
    return personalInfo.fullName.split(' ')[0];
  }, [personalInfo.fullName]);

  // Handle date change
  const handleDateChange = useCallback((event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setPersonalInfo(prev => ({
        ...prev,
        dateOfBirth: date
      }));
    }
  }, []);

  // Handle location selection
  const handleLocationSelect = useCallback(async () => {
    setIsLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Get address from coordinates
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (address) {
        const locationString = `${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.trim();
        setPersonalInfo(prev => ({
          ...prev,
          currentLocation: locationString
        }));
      }
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsLocationLoading(false);
      setShowLocationModal(false);
    }
  }, []);

  // Handle profile picture selection
  const handleProfilePictureSelect = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await handleProfilePictureUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image from gallery');
    }
    setShowProfilePictureOptions(false);
  }, []);

  // Update the validateMandatoryFields function
  const validateMandatoryFields = () => {
    const mandatoryFields = {
      fullName: personalInfo.fullName,
      email: personalInfo.email,
      gender: personalInfo.gender,
      dateOfBirth: personalInfo.dateOfBirth,
      currentLocation: personalInfo.currentLocation,
      currentJobTitle: personalInfo.currentJobTitle,
      professionalBio: personalInfo.professionalBio,
      languages: personalInfo.languages.length > 0 ? 'valid' : '', // Add languages validation
      timeToReport: personalInfo.timeToReport, // Add availability validation
    };

    const missingFields = Object.entries(mandatoryFields)
      .filter(([_, value]) => !value)
      .map(([key, _]) => {
        // Convert camelCase to readable format
        return key.replace(/([A-Z])/g, ' $1')
          .toLowerCase()
          .replace(/^./, str => str.toUpperCase());
      });

    if (missingFields.length > 0) {
      Alert.alert(
        "Missing Required Fields",
        `Please fill in the following fields to continue:\n\n${missingFields.map(field => `• ${field}`).join('\n')}`,
        [{ text: "OK" }]
      );
      return false;
    }

    // Validate email format
    if (!validateEmail(personalInfo.email)) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address",
        [{ text: "OK" }]
      );
      return false;
    }

    return true;
  };

  // Update the handleSubmit function
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    
    // Validate mandatory fields
    if (!validateMandatoryFields()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      // If no profile picture is selected, use the default icon URL
      const profilePictureUrl = personalInfo.profilePicture || 'https://api.dicebear.com/7.x/avataaars/png?seed=default&backgroundColor=b6e3f4';
      
      // Create the final personal info object with the profile picture
      const finalPersonalInfo = {
        ...personalInfo,
        profilePicture: profilePictureUrl
      };
      
      // Save to AsyncStorage
      await AsyncStorage.multiSet([
        ['fullName', finalPersonalInfo.fullName],
        ['phoneNumber', finalPersonalInfo.phoneNumber],
        ['email', finalPersonalInfo.email],
        ['profileData', JSON.stringify(finalPersonalInfo)]
      ]);

      // Update avatar in Supabase database if userId is available
      if (params.userId) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: profilePictureUrl })
          .eq('id', params.userId);
          
        if (updateError) throw updateError;
      }
      
      // Navigate to next screen
      router.replace('/seeker-dashboard');
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert(
        "Error",
        "Failed to save your information. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [personalInfo, isSubmitting, router, params.userId]);

  // Add email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Add age validation function
  const validateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Update date selection handler
  const handleDateSelect = (date: Date) => {
    setTempDate(date);
  };

  // Handle date confirmation
  const handleDateConfirm = () => {
    const age = validateAge(tempDate);
    setPersonalInfo(prev => ({ ...prev, dateOfBirth: tempDate }));
    setShowCustomDatePicker(false);
    
    if (age < 18) {
      setTimeout(() => {
        Alert.alert(
          "Age Restriction",
          "You must be at least 18 years old to register as a job seeker.",
          [{ 
            text: "OK",
            onPress: () => {
              setPersonalInfo(prev => ({ ...prev, dateOfBirth: null }));
              setTempDate(new Date());
            }
          }]
        );
      }, 500);
    }
  };

  // Handle work experience dates
  const handleStartDateSelect = (date: Date) => {
    if (selectedExperienceIndex !== null) {
      const newWorkExperience = [...personalInfo.workExperience];
      newWorkExperience[selectedExperienceIndex] = {
        ...newWorkExperience[selectedExperienceIndex],
        startDate: date
      };
      setPersonalInfo(prev => ({
        ...prev,
        workExperience: newWorkExperience
      }));
      setShowStartDatePicker(false);
    }
  };

  const handleEndDateSelect = (date: Date) => {
    if (selectedExperienceIndex !== null) {
      const newWorkExperience = [...personalInfo.workExperience];
      newWorkExperience[selectedExperienceIndex] = {
        ...newWorkExperience[selectedExperienceIndex],
        endDate: date
      };
      setPersonalInfo(prev => ({
        ...prev,
        workExperience: newWorkExperience
      }));
      setShowEndDatePicker(false);
    }
  };

  // Update date handling
  const currentYear = new Date().getFullYear();
  const maxDate = new Date(2025, 11, 31); // December 31, 2025

  // Function to add new work experience
  const addWorkExperience = () => {
    if (personalInfo.workExperience.length >= 3) {
      Alert.alert(
        "Maximum Limit Reached",
        "You can add up to 3 work experiences.",
        [{ text: "OK" }]
      );
      return;
    }

    // Check if the last experience is empty
    const lastExperience = personalInfo.workExperience[personalInfo.workExperience.length - 1];
    if (lastExperience && (!lastExperience.company || !lastExperience.position || !lastExperience.startDate || !lastExperience.endDate)) {
      Alert.alert(
        "Incomplete Work Experience",
        "Please fill in all the work experience details above before adding a new one.",
        [{ text: "OK" }]
      );
      return;
    }

    const newExperience: WorkExperience = {
      company: '',
      position: '',
      startDate: null,
      endDate: null,
      description: '',
      isCurrentJob: false,
    };

    setPersonalInfo(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, newExperience]
    }));
  };

  // Function to delete work experience
  const handleDeleteExperience = (index: number) => {
    Alert.alert(
      "Delete Work Experience",
      "Are you sure you want to delete this work experience? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => deleteWorkExperience(index),
          style: "destructive"
        }
      ]
    );
  };

  const deleteWorkExperience = (index: number) => {
    setPersonalInfo(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
    setShowDeleteConfirmation(false);
    setSelectedExperienceIndex(null); // Reset the selected index
  };

  // Update the handleTimeToReportChange function
  const handleTimeToReportChange = (value: PersonalInformation['timeToReport']) => {
    setPersonalInfo(prev => ({
      ...prev,
      timeToReport: value
    }));
  };

  // Add validation functions
  const isProjectValid = (project: Project) => {
    return project.title.trim() !== '' && 
           project.description.trim() !== '' && 
           project.technologies.trim() !== '';
  };

  const isLanguageValid = (language: Language) => {
    return language.name.trim() !== '' && 
           language.proficiency.trim() !== '';
  };

  const isReferenceValid = (reference: Reference) => {
    return reference.name.trim() !== '' && 
           reference.position.trim() !== '' && 
           reference.company.trim() !== '' && 
           reference.email.trim() !== '' && 
           reference.phone.trim() !== '';
  };

  const handleAddProject = () => {
    if (personalInfo.projects.length >= 3) {
      Alert.alert('Maximum Limit', 'You can add up to 3 projects only.');
      return;
    }

    if (personalInfo.projects.length > 0 && !isProjectValid(personalInfo.projects[personalInfo.projects.length - 1])) {
      Alert.alert('Incomplete Project', 'Please fill in all fields of the current project before adding a new one.');
      return;
    }

    setPersonalInfo(prev => ({
      ...prev,
      projects: [...prev.projects, { title: '', description: '', technologies: '' }]
    }));
  };

  const handleDeleteProject = (index: number) => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPersonalInfo(prev => ({
              ...prev,
              projects: prev.projects.filter((_, i) => i !== index)
            }));
          }
        }
      ]
    );
  };

  const handleAddLanguage = () => {
    if (personalInfo.languages.length >= 3) {
      Alert.alert('Maximum Limit', 'You can add up to 3 languages only.');
      return;
    }

    if (personalInfo.languages.length > 0 && !isLanguageValid(personalInfo.languages[personalInfo.languages.length - 1])) {
      Alert.alert('Incomplete Language', 'Please fill in all fields of the current language before adding a new one.');
      return;
    }

    setPersonalInfo(prev => ({
      ...prev,
      languages: [...prev.languages, { name: '', proficiency: 'Beginner' }]
    }));
  };

  const handleDeleteLanguage = (index: number) => {
    Alert.alert(
      'Delete Language',
      'Are you sure you want to delete this language?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPersonalInfo(prev => ({
              ...prev,
              languages: prev.languages.filter((_, i) => i !== index)
            }));
          }
        }
      ]
    );
  };

  const handleAddReference = () => {
    if (personalInfo.references.length >= 3) {
      Alert.alert('Maximum Limit', 'You can add up to 3 references only.');
      return;
    }

    if (personalInfo.references.length > 0 && !isReferenceValid(personalInfo.references[personalInfo.references.length - 1])) {
      Alert.alert('Incomplete Reference', 'Please fill in all fields of the current reference before adding a new one.');
      return;
    }

    setPersonalInfo(prev => ({
      ...prev,
      references: [...prev.references, { name: '', position: '', company: '', email: '', phone: '' }]
    }));
  };

  const handleDeleteReference = (index: number) => {
    Alert.alert(
      'Delete Reference',
      'Are you sure you want to delete this reference?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPersonalInfo(prev => ({
              ...prev,
              references: prev.references.filter((_, i) => i !== index)
            }));
          }
        }
      ]
    );
  };

  // Add handleReferenceChange function
  const handleReferenceChange = (index: number, field: keyof Reference, value: string) => {
    const newReferences = [...personalInfo.references];
    newReferences[index] = {
      ...newReferences[index],
      [field]: value
    };
    setPersonalInfo(prev => ({
      ...prev,
      references: newReferences
    }));
  };

  // Update work experience handlers
  const handleWorkExperienceChange = (index: number, field: keyof WorkExperience, value: any) => {
    const newWorkExperience = [...personalInfo.workExperience];
    newWorkExperience[index] = {
      ...newWorkExperience[index],
      [field]: value
    };
    setPersonalInfo(prev => ({
      ...prev,
      workExperience: newWorkExperience
    }));
  };

  // Update the delete confirmation modal trigger
  const handleDeleteConfirmation = (index: number) => {
    setSelectedExperienceIndex(index);
    setShowDeleteConfirmation(true);
  };

  // Add new function inside SeekerResume component before the return statement
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await handleProfilePictureUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
    setShowProfilePictureOptions(false);
  };

  const generateRandomAvatar = async () => {
    try {
      // Using Dicebear API for random avatar generation
      const randomSeed = Math.random().toString(36).substring(7);
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${randomSeed}&backgroundColor=b6e3f4`;
      
      // Download the avatar
      const { uri } = await FileSystem.downloadAsync(
        avatarUrl,
        FileSystem.documentDirectory + 'temp_avatar.png'
      );
      
      await handleProfilePictureUpload(uri);
    } catch (error) {
      console.error('Error generating avatar:', error);
      Alert.alert('Error', 'Failed to generate random avatar');
    }
    setShowProfilePictureOptions(false);
  };

  const handleProfilePictureUpload = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Generate unique filename
      const filename = `avatar_${Date.now()}.jpg`;
      const filePath = `avatars/${filename}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob);
        
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile picture in state and database
      setPersonalInfo(prev => ({
        ...prev,
        profilePicture: publicUrl
      }));
      
      // Update avatar in Supabase database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', params.userId);
        
      if (updateError) throw updateError;
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    }
  };

  // Main render
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen 
          options={{ 
            headerShown: false,
          }}
        />
        
        {/* Fixed Header */}
        <View style={styles.fixedHeader}>
          <Text style={styles.welcomeText}>Habari, <Text style={styles.usernameText}>{firstName}</Text></Text>
          <Text style={styles.setupText}>Please take 3-5 minutes to create your Profile and Resume</Text>
        </View>

        {/* Scrollable Content with KeyboardAvoidingView */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* MY PROFILE Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.mainSectionTitle}>MY PROFILE</Text>
              
              {/* Profile Picture */}
              <View style={styles.inputSection}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Profile Picture</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <View style={styles.profilePictureContainer}>
                  <TouchableOpacity onPress={() => setShowProfilePictureOptions(true)}>
                    {personalInfo.profilePicture ? (
                      <Image 
                        source={{ uri: personalInfo.profilePicture }}
                        style={styles.profilePicture}
                      />
                    ) : (
                      <View style={styles.emptyProfilePicture}>
                        <Ionicons name="person" size={70} color="#666" />
                      </View>
                    )}
                    <TouchableOpacity 
                      style={styles.cameraButton}
                      onPress={() => setShowProfilePictureOptions(true)}
                    >
                      <Ionicons name="camera" size={18} color="#666" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Full Name - Read Only */}
              <View style={styles.inputSection}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Full Name</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <View style={styles.verifiedContainer}>
                  <View style={styles.verifiedIconContainer}>
                    <Ionicons name="person" size={24} color="#007AFF" />
                  </View>
                  <View style={styles.verifiedTextContainer}>
                    <Text style={styles.verifiedText}>{personalInfo.fullName}</Text>
                  </View>
                  <View style={styles.verifiedCheckContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#32D74B" />
                  </View>
                </View>
              </View>

              {/* Verified Contact Info */}
              <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>
                  {personalInfo.phoneNumber ? 'Verified Phone Number' : 'Verified Email'}
                </Text>
                <View style={styles.verifiedContainer}>
                  <View style={styles.verifiedIconContainer}>
                    <Ionicons 
                      name={personalInfo.phoneNumber ? "call" : "mail"} 
                      size={24} 
                      color="#fff" 
                    />
                  </View>
                  <View style={styles.verifiedTextContainer}>
                    <Text style={styles.verifiedText}>
                      {personalInfo.phoneNumber || personalInfo.email}
                    </Text>
                  </View>
                  <View style={styles.verifiedCheckContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#32D74B" />
                  </View>
                </View>
              </View>

              {/* Email Field */}
              <View style={styles.inputSection}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Email</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <View style={styles.emailInputContainer}>
                  <View style={styles.verifiedIconContainer}>
                    <Ionicons name="mail" size={24} color="#007AFF" />
                  </View>
                  <TextInput
                    style={[styles.emailInput, { paddingLeft: 10 }]}
                    placeholder="Enter your email address"
                    placeholderTextColor="#999"
                    value={personalInfo.email}
                    onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, email: text }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!params.email}
                  />
                  {personalInfo.email && !params.email && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={() => setPersonalInfo(prev => ({ ...prev, email: '' }))}
                    >
                      <Ionicons name="close-circle" size={20} color="#666" />
                    </TouchableOpacity>
                  )}
                </View>
                {personalInfo.email && !validateEmail(personalInfo.email) && (
                  <Text style={styles.errorMessage}>Please enter a valid email address</Text>
                )}
              </View>

              {/* Gender */}
              <View style={styles.inputSection}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Gender</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <TouchableOpacity 
                  style={styles.selectionButton}
                  onPress={() => setShowGenderModal(true)}
                >
                  <View style={styles.selectionIconContainer}>
                    <Ionicons 
                      name={personalInfo.gender === 'male' ? 'male' : 'female'} 
                      size={24} 
                      color="#007AFF" 
                    />
                  </View>
                  <Text style={styles.selectionText}>
                    {personalInfo.gender ? personalInfo.gender.charAt(0).toUpperCase() + personalInfo.gender.slice(1) : 'Select Gender'}
                  </Text>
                  <Ionicons name="chevron-forward" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Date of Birth */}
              <View style={styles.inputSection}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Date of Birth</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <TouchableOpacity 
                  style={styles.selectionButton}
                  onPress={() => setShowCustomDatePicker(true)}
                >
                  <View style={styles.selectionIconContainer}>
                    <Ionicons name="calendar" size={24} color="#007AFF" />
                  </View>
                  <Text style={styles.selectionText}>
                    {personalInfo.dateOfBirth ? personalInfo.dateOfBirth.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Select Date'}
                  </Text>
                  <Ionicons name="chevron-forward" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Location */}
              <View style={styles.inputSection}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Location</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <TouchableOpacity 
                  style={styles.selectionButton}
                  onPress={() => setShowLocationModal(true)}
                >
                  <View style={styles.selectionIconContainer}>
                    <Ionicons name="location" size={24} color="#007AFF" />
                  </View>
                  <Text style={styles.selectionText}>
                    {personalInfo.currentLocation || 'Select Location'}
                  </Text>
                  <View style={styles.locationButtonContainer}>
                    <Ionicons name="navigate" size={24} color="#007AFF" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* MY RESUME Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.mainSectionTitle}>MY RESUME</Text>

              {/* Hometown */}
              <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Hometown</Text>
                <TouchableOpacity 
                  style={styles.selectionButton}
                  onPress={() => setShowDistrictPicker(true)}
                >
                  <View style={styles.selectionIconContainer}>
                    <Ionicons name="location" size={24} color="#007AFF" />
                  </View>
                  <Text style={styles.selectionText}>
                    {personalInfo.hometown || 'Select District'}
                  </Text>
                  <Ionicons name="chevron-forward" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Current Job Title */}
              <View style={styles.inputSection}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Current Job Title</Text>
                  {REQUIRED_FIELDS.currentJobTitle && <Text style={styles.requiredStar}>*</Text>}
                </View>
                <View style={styles.inputContainer}>
                  <View style={styles.verifiedIconContainer}>
                    <Ionicons name="briefcase" size={24} color="#007AFF" />
                  </View>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Enter your current job title"
                    placeholderTextColor="#999"
                    value={personalInfo.currentJobTitle}
                    onChangeText={(text) => {
                      setPersonalInfo(prev => ({ ...prev, currentJobTitle: text }));
                    }}
                    multiline={false}
                    numberOfLines={1}
                  />
                  <TouchableOpacity
                    style={styles.clearButtonContainer}
                    onPress={() => setPersonalInfo(prev => ({ ...prev, currentJobTitle: '' }))}
                  >
                    {personalInfo.currentJobTitle ? (
                      <Ionicons name="close-circle" size={20} color="#666" />
                    ) : null}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bio */}
              <View style={styles.inputSection}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Professional Bio</Text>
                  {REQUIRED_FIELDS.bio && <Text style={styles.requiredStar}>*</Text>}
                </View>
                <View style={styles.bioContainer}>
                  <View style={[styles.inputContainer, { alignItems: 'flex-start', padding: 10 }]}>
                    <View style={[styles.verifiedIconContainer, { marginTop: 5 }]}>
                      <Ionicons name="document-text" size={24} color="#007AFF" />
                    </View>
                    <TextInput
                      style={[styles.input, styles.textArea, { flex: 1, marginBottom: 0, marginLeft: 10 }]}
                      placeholder="Write a brief professional bio"
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={4}
                      maxLength={200}
                      value={personalInfo.professionalBio}
                      onChangeText={(text) => {
                        setBioLength(text.length);
                        setPersonalInfo(prev => ({ ...prev, professionalBio: text }));
                      }}
                    />
                  </View>
                  <Text style={styles.characterCount}>{bioLength}/200</Text>
                </View>
              </View>

              {/* Work Experience */}
              <View style={styles.inputSection}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="business" size={24} color="#007AFF" style={{ marginRight: 10 }} />
                  <Text style={styles.sectionTitle}>Work Experience</Text>
                </View>
                
                {personalInfo.workExperience.map((experience, index) => (
                  <View key={index} style={styles.workExperienceCard}>
                    <View style={styles.workExperienceHeader}>
                      <Text style={styles.workExperienceTitle}>Experience {index + 1}</Text>
                      <TouchableOpacity 
                        onPress={() => handleDeleteExperience(index)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteButtonText}>-</Text>
                      </TouchableOpacity>
                    </View>

                    <TextInput
                      style={styles.workExperienceInput}
                      placeholder="Company Name"
                      placeholderTextColor="#999"
                      value={experience.company}
                      onChangeText={(text) => handleWorkExperienceChange(index, 'company', text)}
                    />

                    <TextInput
                      style={styles.workExperienceInput}
                      placeholder="Position"
                      placeholderTextColor="#999"
                      value={experience.position}
                      onChangeText={(text) => handleWorkExperienceChange(index, 'position', text)}
                    />

                    <View style={styles.dateRangeContainer}>
                      <TouchableOpacity 
                        style={[styles.dateButton, styles.shadowedInput]}
                        onPress={() => {
                          setSelectedExperienceIndex(index);
                          setShowStartDatePicker(true);
                        }}
                      >
                        <Ionicons name="calendar" size={20} color="#007AFF" />
                        <Text style={styles.dateButtonText}>
                          {experience.startDate 
                            ? experience.startDate.toLocaleDateString()
                            : 'Start Date'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.dateButton, styles.shadowedInput]}
                        onPress={() => {
                          setSelectedExperienceIndex(index);
                          setShowEndDatePicker(true);
                        }}
                      >
                        <Ionicons name="calendar" size={20} color="#007AFF" />
                        <Text style={styles.dateButtonText}>
                          {experience.endDate 
                            ? experience.endDate.toLocaleDateString()
                            : 'End Date'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {personalInfo.workExperience.length < 3 && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={addWorkExperience}
                  >
                    <Text style={styles.addButtonText}>+ Add Work Experience</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Portfolio Links */}
              <View style={styles.inputSection}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="link" size={24} color="#007AFF" style={{ marginRight: 10 }} />
                  <Text style={styles.sectionTitle}>Portfolio Links</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="LinkedIn Profile URL"
                  placeholderTextColor="#999"
                  value={personalInfo.linkedinUrl}
                  onChangeText={(text) => setPersonalInfo(prev => ({
                    ...prev,
                    linkedinUrl: text
                  }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="GitHub Profile URL"
                  placeholderTextColor="#999"
                  value={personalInfo.githubUrl}
                  onChangeText={(text) => setPersonalInfo(prev => ({
                    ...prev,
                    githubUrl: text
                  }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Personal Website URL"
                  placeholderTextColor="#999"
                  value={personalInfo.personalWebsite}
                  onChangeText={(text) => setPersonalInfo(prev => ({
                    ...prev,
                    personalWebsite: text
                  }))}
                />
              </View>

              {/* Projects Section */}
              <View style={styles.inputSection}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="folder-open" size={24} color="#007AFF" style={{ marginRight: 10 }} />
                  <Text style={styles.sectionTitle}>Projects</Text>
                </View>
                {personalInfo.projects.map((project, index) => (
                  <View key={index} style={styles.projectContainer}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Project {index + 1}</Text>
                      <TouchableOpacity onPress={() => handleDeleteProject(index)} style={styles.deleteButton}>
                        <Text style={styles.deleteButtonText}>-</Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={styles.projectInput}
                      placeholder="Project Name"
                      placeholderTextColor="#999"
                      value={project.title}
                      onChangeText={(text) => {
                        const newProjects = [...personalInfo.projects];
                        newProjects[index].title = text;
                        setPersonalInfo(prev => ({ ...prev, projects: newProjects }));
                      }}
                    />
                    <TextInput
                      style={[styles.projectInput, styles.textArea]}
                      placeholder="Project Description"
                      placeholderTextColor="#999"
                      multiline
                      maxLength={100}
                      value={project.description}
                      onChangeText={(text) => {
                        const newProjects = [...personalInfo.projects];
                        newProjects[index].description = text;
                        setPersonalInfo(prev => ({ ...prev, projects: newProjects }));
                      }}
                    />
                    <Text style={styles.characterCounter}>{project.description.length}/100 characters</Text>
                  </View>
                ))}
                <TouchableOpacity onPress={handleAddProject} style={styles.addButton}>
                  <Text style={styles.addButtonText}>+ Add Project</Text>
                </TouchableOpacity>
              </View>

              {/* Languages Section */}
              <View style={styles.inputSection}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Languages</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                {personalInfo.languages.map((language, index) => (
                  <View key={index} style={styles.languageContainer}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Language {index + 1}</Text>
                      <TouchableOpacity onPress={() => handleDeleteLanguage(index)} style={styles.deleteButton}>
                        <Text style={styles.deleteButtonText}>-</Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={[styles.projectInput, styles.languageInput]}
                      placeholder="Language"
                      placeholderTextColor="#999"
                      value={language.name}
                      onChangeText={(text) => {
                        const newLanguages = [...personalInfo.languages];
                        newLanguages[index].name = text;
                        setPersonalInfo(prev => ({ ...prev, languages: newLanguages }));
                      }}
                    />
                    <View style={styles.proficiencyButtons}>
                      {['Native', 'Fluent', 'Intermediate', 'Beginner'].map((level) => (
                        <TouchableOpacity
                          key={level}
                          style={[
                            styles.proficiencyButton,
                            language.proficiency === level && styles.proficiencyButtonSelected
                          ]}
                          onPress={() => {
                            const newLanguages = [...personalInfo.languages];
                            newLanguages[index].proficiency = level as any;
                            setPersonalInfo(prev => ({ ...prev, languages: newLanguages }));
                          }}
                        >
                          <Text style={styles.proficiencyButtonText}>{level}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
                <TouchableOpacity onPress={handleAddLanguage} style={styles.addButton}>
                  <Text style={styles.addButtonText}>+ Add Language</Text>
                </TouchableOpacity>
              </View>

              {/* Availability Section */}
              <View style={styles.inputSection}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="time" size={24} color="#007AFF" style={{ marginRight: 10 }} />
                  <Text style={styles.sectionTitle}>Availability</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <View style={[styles.availabilityButtons, { marginTop: 15 }]}>
                  <TouchableOpacity
                    style={[
                      styles.availabilityButton,
                      personalInfo.timeToReport === 'Within a Week' && styles.availabilityButtonSelected
                    ]}
                    onPress={() => handleTimeToReportChange('Within a Week')}
                  >
                    <Text style={[
                      styles.availabilityButtonText,
                      personalInfo.timeToReport === 'Within a Week' && styles.availabilityButtonTextSelected
                    ]}>Within a Week</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.availabilityButton,
                      personalInfo.timeToReport === 'Within a Month' && styles.availabilityButtonSelected
                    ]}
                    onPress={() => handleTimeToReportChange('Within a Month')}
                  >
                    <Text style={[
                      styles.availabilityButtonText,
                      personalInfo.timeToReport === 'Within a Month' && styles.availabilityButtonTextSelected
                    ]}>Within a Month</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.availabilityButton,
                      personalInfo.timeToReport === 'Not sure' && styles.availabilityButtonSelected
                    ]}
                    onPress={() => handleTimeToReportChange('Not sure')}
                  >
                    <Text style={[
                      styles.availabilityButtonText,
                      personalInfo.timeToReport === 'Not sure' && styles.availabilityButtonTextSelected
                    ]}>Not sure</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* References Section */}
              <View style={styles.inputSection}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="people" size={24} color="#007AFF" style={{ marginRight: 10 }} />
                  <Text style={styles.sectionTitle}>References</Text>
                </View>
                {personalInfo.references.map((reference, index) => (
                  <View key={index} style={styles.referenceContainer}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Reference {index + 1}</Text>
                      <TouchableOpacity onPress={() => handleDeleteReference(index)} style={styles.deleteButton}>
                        <Text style={styles.deleteButtonText}>-</Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      value={reference.name}
                      onChangeText={(text) => handleReferenceChange(index, 'name', text)}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Position"
                      value={reference.position}
                      onChangeText={(text) => handleReferenceChange(index, 'position', text)}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Company"
                      value={reference.company}
                      onChangeText={(text) => handleReferenceChange(index, 'company', text)}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      value={reference.email}
                      onChangeText={(text) => handleReferenceChange(index, 'email', text)}
                      keyboardType="email-address"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Phone"
                      value={reference.phone}
                      onChangeText={(text) => handleReferenceChange(index, 'phone', text)}
                      keyboardType="phone-pad"
                    />
                  </View>
                ))}
                <TouchableOpacity onPress={handleAddReference} style={styles.addButton}>
                  <Text style={styles.addButtonText}>+ Add Reference</Text>
                </TouchableOpacity>
              </View>

              {/* Person with Disability Section */}
              <View style={styles.disabilitySection}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="accessibility" size={24} color="#007AFF" style={{ marginRight: 10 }} />
                  <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Person with Disability</Text>
                </View>
                <View style={styles.checkboxContainer}>
                  <Switch
                    value={personalInfo.hasDisability}
                    onValueChange={(value) => {
                      setPersonalInfo(prev => ({
                        ...prev,
                        hasDisability: value,
                        disabilityExplanation: value ? prev.disabilityExplanation : ''
                      }));
                    }}
                    trackColor={{ false: '#333', true: '#007AFF' }}
                    thumbColor={personalInfo.hasDisability ? '#fff' : '#fff'}
                  />
                  <Text style={styles.checkboxLabel}>Person with Disability</Text>
                </View>
                
                <Text style={styles.disabilityNote}>
                  JOBS will recommend positions based on your physical abilities, too.
                </Text>
                
                {personalInfo.hasDisability && (
                  <View style={styles.disabilityExplanationContainer}>
                    <TextInput
                      style={styles.disabilityExplanation}
                      multiline
                      placeholder="Please explain your situation"
                      value={personalInfo.disabilityExplanation}
                      onChangeText={(text) => {
                        if (text.length <= 200) {
                          setPersonalInfo(prev => ({
                            ...prev,
                            disabilityExplanation: text
                          }));
                        }
                      }}
                    />
                    <Text style={styles.characterCount}>
                      {personalInfo.disabilityExplanation.length}/200
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Custom Date Picker Modal */}
            <Modal
              visible={showCustomDatePicker}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowCustomDatePicker(false)}
            >
              <BlurView
                intensity={10}
                style={styles.blurContainer}
                tint="dark"
              />
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.datePickerHeader}>
                    <Text style={styles.modalTitle}>Select Date of Birth</Text>
                    <TouchableOpacity 
                      style={styles.datePickerCloseButton}
                      onPress={() => setShowCustomDatePicker(false)}
                    >
                      <Ionicons name="close" size={24} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.datePickerModalContent, { paddingHorizontal: 10 }]}>
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display="spinner"
                      onChange={(event, date) => date && handleDateSelect(date)}
                      maximumDate={new Date()}
                      textColor="#fff"
                      style={styles.datePicker}
                      themeVariant="dark"
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.profilePictureButton}
                    onPress={handleDateConfirm}
                  >
                    <Text style={styles.profilePictureButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Gender Modal */}
            <Modal
              visible={showGenderModal}
              animationType="fade"
              transparent={true}
              onRequestClose={() => setShowGenderModal(false)}
            >
              <BlurView
                intensity={10}
                style={styles.blurContainer}
                tint="dark"
              />
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Gender</Text>
                  
                  <TouchableOpacity
                    style={styles.profilePictureButton}
                    onPress={() => {
                      setPersonalInfo(prev => ({ ...prev, gender: 'male' }));
                      setShowGenderModal(false);
                    }}
                  >
                    <View style={styles.genderButtonContent}>
                      <Ionicons name="male" size={24} color="#8E8E93" />
                      <Text style={styles.profilePictureButtonText}>Male</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.profilePictureButton}
                    onPress={() => {
                      setPersonalInfo(prev => ({ ...prev, gender: 'female' }));
                      setShowGenderModal(false);
                    }}
                  >
                    <View style={styles.genderButtonContent}>
                      <Ionicons name="female" size={24} color="#8E8E93" />
                      <Text style={styles.profilePictureButtonText}>Female</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowGenderModal(false)}
                  >
                    <Text style={styles.closeButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Location Modal */}
            <Modal
              visible={showLocationModal}
              animationType="fade"
              transparent={true}
              onRequestClose={() => setShowLocationModal(false)}
            >
              <BlurView
                intensity={10}
                style={styles.blurContainer}
                tint="dark"
              />
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Enter Location</Text>
                  
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Type your location"
                    placeholderTextColor="#999"
                    value={personalInfo.currentLocation}
                    onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, currentLocation: text }))}
                  />

                  <Text style={styles.modalDescription}>- or -</Text>

                  <TouchableOpacity
                    style={styles.locationButton}
                    onPress={handleLocationSelect}
                    disabled={isLocationLoading}
                  >
                    {isLocationLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="navigate" size={20} color="#fff" />
                        <Text style={styles.locationButtonText}>Use Current Location</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.profilePictureButton}
                    onPress={() => setShowLocationModal(false)}
                  >
                    <Text style={styles.profilePictureButtonText}>Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowLocationModal(false)}
                  >
                    <Text style={styles.closeButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Profile Picture Options Modal */}
            <ProfilePictureModal
              visible={showProfilePictureOptions}
              onClose={() => setShowProfilePictureOptions(false)}
              onTakePhoto={handleTakePhoto}
              onChooseFromGallery={handleProfilePictureSelect}
              onGenerateAvatar={generateRandomAvatar}
            />

            {/* District Picker Modal */}
            <Modal
              visible={showDistrictPicker}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowDistrictPicker(false)}
            >
              <BlurView
                intensity={10}
                style={styles.blurContainer}
                tint="dark"
              />
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select District</Text>
                    <TouchableOpacity 
                      style={styles.modalCloseButton}
                      onPress={() => setShowDistrictPicker(false)}
                    >
                      <Ionicons name="close" size={24} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={styles.districtList}>
                    {UGANDA_DISTRICTS.map((district, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.districtListItem, { borderBottomColor: '#3C3C3E' }]}
                        onPress={() => {
                          setPersonalInfo(prev => ({ ...prev, hometown: district }));
                          setShowDistrictPicker(false);
                        }}
                      >
                        <Text style={[styles.districtListText, { color: '#8E8E93' }]}>{district}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>

            {/* Work Experience Date Pickers */}
            <Modal
              visible={showStartDatePicker}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowStartDatePicker(false)}
            >
              <View style={styles.datePickerModalOverlay}>
                <View style={styles.datePickerModalContent}>
                  <View style={styles.datePickerHeader}>
                    <Text style={styles.datePickerTitle}>Select Start Date</Text>
                    <TouchableOpacity 
                      style={styles.datePickerCloseButton}
                      onPress={() => setShowStartDatePicker(false)}
                    >
                      <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.datePickerModalContent, { paddingHorizontal: 10 }]}>
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display="spinner"
                      onChange={(event, date) => date && handleStartDateSelect(date)}
                      maximumDate={maxDate}
                      textColor="#fff"
                      style={styles.datePicker}
                      themeVariant="dark"
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.datePickerDoneButton}
                    onPress={() => {
                      const newWorkExperience = [...(personalInfo.workExperience || [])];
                      if (!newWorkExperience[0]) newWorkExperience[0] = {} as WorkExperience;
                      newWorkExperience[0].startDate = tempDate;
                      setPersonalInfo(prev => ({ ...prev, workExperience: newWorkExperience }));
                      setShowStartDatePicker(false);
                    }}
                  >
                    <Text style={styles.datePickerDoneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              visible={showEndDatePicker}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowEndDatePicker(false)}
            >
              <View style={styles.datePickerModalOverlay}>
                <View style={styles.datePickerModalContent}>
                  <View style={styles.datePickerHeader}>
                    <Text style={styles.datePickerTitle}>Select End Date</Text>
                    <TouchableOpacity 
                      style={styles.datePickerCloseButton}
                      onPress={() => setShowEndDatePicker(false)}
                    >
                      <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.datePickerModalContent, { paddingHorizontal: 10 }]}>
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display="spinner"
                      onChange={(event, date) => date && handleEndDateSelect(date)}
                      maximumDate={maxDate}
                      textColor="#fff"
                      style={styles.datePicker}
                      themeVariant="dark"
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.datePickerDoneButton}
                    onPress={() => {
                      const newWorkExperience = [...(personalInfo.workExperience || [])];
                      if (!newWorkExperience[0]) newWorkExperience[0] = {} as WorkExperience;
                      newWorkExperience[0].endDate = tempDate;
                      setPersonalInfo(prev => ({ ...prev, workExperience: newWorkExperience }));
                      setShowEndDatePicker(false);
                    }}
                  >
                    <Text style={styles.datePickerDoneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
              visible={showDeleteConfirmation}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowDeleteConfirmation(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Delete Experience?</Text>
                  <Text style={styles.modalText}>
                    Information will be lost permanently. Are you sure?
                  </Text>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalCancelButton]}
                      onPress={() => setShowDeleteConfirmation(false)}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalDeleteButton]}
                      onPress={() => selectedExperienceIndex !== null && deleteWorkExperience(selectedExperienceIndex)}
                    >
                      <Text style={styles.modalButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Fixed Footer */}
        <View style={styles.fixedFooter}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SeekerResume;