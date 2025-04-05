import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Modal,
  FlatList,
  SectionList,
  StatusBar as RNStatusBar,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import SocialMediaConfirmScreen from './components/SocialMediaConfirmScreen';
import { authService } from '../services/auth';
import SlidingPuzzleCaptcha from './components/SlidingPuzzleCaptcha';
import { AuthError } from '@supabase/supabase-js';
import WelcomeScreen from './WelcomeScreen';
import RecruiterScreen from './RecruiterScreen';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

interface Country {
  name: string;
  code: string;
  dial_code: string;
}

const countries: Country[] = [
  { name: 'Afghanistan', code: 'AF', dial_code: '+93' },
  { name: 'Albania', code: 'AL', dial_code: '+355' },
  { name: 'Algeria', code: 'DZ', dial_code: '+213' },
  { name: 'Andorra', code: 'AD', dial_code: '+376' },
  { name: 'Angola', code: 'AO', dial_code: '+244' },
  { name: 'Argentina', code: 'AR', dial_code: '+54' },
  { name: 'Armenia', code: 'AM', dial_code: '+374' },
  { name: 'Australia', code: 'AU', dial_code: '+61' },
  { name: 'Austria', code: 'AT', dial_code: '+43' },
  { name: 'Azerbaijan', code: 'AZ', dial_code: '+994' },
  { name: 'Bahrain', code: 'BH', dial_code: '+973' },
  { name: 'Bangladesh', code: 'BD', dial_code: '+880' },
  { name: 'Belarus', code: 'BY', dial_code: '+375' },
  { name: 'Belgium', code: 'BE', dial_code: '+32' },
  { name: 'Belize', code: 'BZ', dial_code: '+501' },
  { name: 'Benin', code: 'BJ', dial_code: '+229' },
  { name: 'Brazil', code: 'BR', dial_code: '+55' },
  { name: 'Bulgaria', code: 'BG', dial_code: '+359' },
  { name: 'Cambodia', code: 'KH', dial_code: '+855' },
  { name: 'Cameroon', code: 'CM', dial_code: '+237' },
  { name: 'Canada', code: 'CA', dial_code: '+1' },
  { name: 'China', code: 'CN', dial_code: '+86' },
  { name: 'Colombia', code: 'CO', dial_code: '+57' },
  { name: 'Costa Rica', code: 'CR', dial_code: '+506' },
  { name: 'Croatia', code: 'HR', dial_code: '+385' },
  { name: 'Cuba', code: 'CU', dial_code: '+53' },
  { name: 'Cyprus', code: 'CY', dial_code: '+357' },
  { name: 'Czech Republic', code: 'CZ', dial_code: '+420' },
  { name: 'Denmark', code: 'DK', dial_code: '+45' },
  { name: 'Egypt', code: 'EG', dial_code: '+20' },
  { name: 'Estonia', code: 'EE', dial_code: '+372' },
  { name: 'Ethiopia', code: 'ET', dial_code: '+251' },
  { name: 'Finland', code: 'FI', dial_code: '+358' },
  { name: 'France', code: 'FR', dial_code: '+33' },
  { name: 'Germany', code: 'DE', dial_code: '+49' },
  { name: 'Ghana', code: 'GH', dial_code: '+233' },
  { name: 'Greece', code: 'GR', dial_code: '+30' },
  { name: 'Hong Kong', code: 'HK', dial_code: '+852' },
  { name: 'Hungary', code: 'HU', dial_code: '+36' },
  { name: 'Iceland', code: 'IS', dial_code: '+354' },
  { name: 'India', code: 'IN', dial_code: '+91' },
  { name: 'Indonesia', code: 'ID', dial_code: '+62' },
  { name: 'Iran', code: 'IR', dial_code: '+98' },
  { name: 'Iraq', code: 'IQ', dial_code: '+964' },
  { name: 'Ireland', code: 'IE', dial_code: '+353' },
  { name: 'Israel', code: 'IL', dial_code: '+972' },
  { name: 'Italy', code: 'IT', dial_code: '+39' },
  { name: 'Jamaica', code: 'JM', dial_code: '+1' },
  { name: 'Japan', code: 'JP', dial_code: '+81' },
  { name: 'Jordan', code: 'JO', dial_code: '+962' },
  { name: 'Kazakhstan', code: 'KZ', dial_code: '+7' },
  { name: 'Kenya', code: 'KE', dial_code: '+254' },
  { name: 'Kuwait', code: 'KW', dial_code: '+965' },
  { name: 'Latvia', code: 'LV', dial_code: '+371' },
  { name: 'Lebanon', code: 'LB', dial_code: '+961' },
  { name: 'Libya', code: 'LY', dial_code: '+218' },
  { name: 'Lithuania', code: 'LT', dial_code: '+370' },
  { name: 'Luxembourg', code: 'LU', dial_code: '+352' },
  { name: 'Malaysia', code: 'MY', dial_code: '+60' },
  { name: 'Maldives', code: 'MV', dial_code: '+960' },
  { name: 'Mali', code: 'ML', dial_code: '+223' },
  { name: 'Malta', code: 'MT', dial_code: '+356' },
  { name: 'Mexico', code: 'MX', dial_code: '+52' },
  { name: 'Monaco', code: 'MC', dial_code: '+377' },
  { name: 'Mongolia', code: 'MN', dial_code: '+976' },
  { name: 'Morocco', code: 'MA', dial_code: '+212' },
  { name: 'Nepal', code: 'NP', dial_code: '+977' },
  { name: 'Netherlands', code: 'NL', dial_code: '+31' },
  { name: 'New Zealand', code: 'NZ', dial_code: '+64' },
  { name: 'Nigeria', code: 'NG', dial_code: '+234' },
  { name: 'North Korea', code: 'KP', dial_code: '+850' },
  { name: 'Norway', code: 'NO', dial_code: '+47' },
  { name: 'Oman', code: 'OM', dial_code: '+968' },
  { name: 'Pakistan', code: 'PK', dial_code: '+92' },
  { name: 'Panama', code: 'PA', dial_code: '+507' },
  { name: 'Paraguay', code: 'PY', dial_code: '+595' },
  { name: 'Peru', code: 'PE', dial_code: '+51' },
  { name: 'Philippines', code: 'PH', dial_code: '+63' },
  { name: 'Poland', code: 'PL', dial_code: '+48' },
  { name: 'Portugal', code: 'PT', dial_code: '+351' },
  { name: 'Qatar', code: 'QA', dial_code: '+974' },
  { name: 'Romania', code: 'RO', dial_code: '+40' },
  { name: 'Russia', code: 'RU', dial_code: '+7' },
  { name: 'Saudi Arabia', code: 'SA', dial_code: '+966' },
  { name: 'Senegal', code: 'SN', dial_code: '+221' },
  { name: 'Serbia', code: 'RS', dial_code: '+381' },
  { name: 'Singapore', code: 'SG', dial_code: '+65' },
  { name: 'Slovakia', code: 'SK', dial_code: '+421' },
  { name: 'Slovenia', code: 'SI', dial_code: '+386' },
  { name: 'Somalia', code: 'SO', dial_code: '+252' },
  { name: 'South Africa', code: 'ZA', dial_code: '+27' },
  { name: 'South Korea', code: 'KR', dial_code: '+82' },
  { name: 'Spain', code: 'ES', dial_code: '+34' },
  { name: 'Sri Lanka', code: 'LK', dial_code: '+94' },
  { name: 'Sudan', code: 'SD', dial_code: '+249' },
  { name: 'Sweden', code: 'SE', dial_code: '+46' },
  { name: 'Switzerland', code: 'CH', dial_code: '+41' },
  { name: 'Syria', code: 'SY', dial_code: '+963' },
  { name: 'Taiwan', code: 'TW', dial_code: '+886' },
  { name: 'Tanzania', code: 'TZ', dial_code: '+255' },
  { name: 'Thailand', code: 'TH', dial_code: '+66' },
  { name: 'Tunisia', code: 'TN', dial_code: '+216' },
  { name: 'Turkey', code: 'TR', dial_code: '+90' },
  { name: 'Uganda', code: 'UG', dial_code: '+256' },
  { name: 'Ukraine', code: 'UA', dial_code: '+380' },
  { name: 'United Arab Emirates', code: 'AE', dial_code: '+971' },
  { name: 'United Kingdom', code: 'GB', dial_code: '+44' },
  { name: 'United States', code: 'US', dial_code: '+1' },
  { name: 'Uruguay', code: 'UY', dial_code: '+598' },
  { name: 'Uzbekistan', code: 'UZ', dial_code: '+998' },
  { name: 'Venezuela', code: 'VE', dial_code: '+58' },
  { name: 'Vietnam', code: 'VN', dial_code: '+84' },
  { name: 'Yemen', code: 'YE', dial_code: '+967' },
  { name: 'Zimbabwe', code: 'ZW', dial_code: '+263' }
];

const getReadableErrorMessage = (error: AuthError | string) => {
  const errorMessages: { [key: string]: string } = {
    'Invalid From Number': 'This phone number is not supported for testing. Please use a valid test number.',
    'Invalid phone number format': 'Please enter a valid phone number.',
    'Phone number is required': 'Please enter a phone number.',
    'Too many attempts': 'Too many attempts. Please try again later.',
    'Invalid OTP': 'Invalid verification code. Please try again.',
  };

  const errorMessage = typeof error === 'string' ? error : error.message;

  if (errorMessage.includes('Invalid From Number')) {
    return errorMessages['Invalid From Number'];
  }
  
  for (const key in errorMessages) {
    if (errorMessage.includes(key)) {
      return errorMessages[key];
    }
  }
  
  return 'Something went wrong. Please try again.';
};

const prefix = Linking.createURL('/');

const linking = {
  prefixes: [prefix],
  config: {
    screens: {
      AuthCallback: 'auth/callback',
    },
  },
};

export default function HomeScreen() {
  const [showSocialConfirm, setShowSocialConfirm] = useState(false);
  const [selectedSocialMedia, setSelectedSocialMedia] = useState<'google' | 'facebook' | 'whatsapp' | null>(null);
  const [mockUserProfile, setMockUserProfile] = useState({
    id: '',
    name: '',
    email: '',
    photoUrl: '',
    provider: 'google'
  });
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCantReceiveModal, setShowCantReceiveModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find(country => country.code === 'UG') // Uganda as default
  );
  const [showSocialAcknowledgmentModal, setShowSocialAcknowledgmentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = React.useRef<TextInput>(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [showRecruiterScreen, setShowRecruiterScreen] = useState(false);
  const router = useRouter();
  const [isPhoneInputFocused, setIsPhoneInputFocused] = useState(false);
  const phoneInputRef = React.useRef<TextInput>(null);

  const validatePhoneNumber = (number: string) => {
    // Remove any spaces or special characters
    const cleanNumber = number.replace(/\D/g, '');
    
    // Basic validation rules
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

  const setErrorWithAlert = (errorMessage: string | null) => {
    setError(errorMessage);
    if (errorMessage) {
      setShowErrorModal(true);
    }
  };

  const handleNextPress = async () => {
    // Clear any existing errors
    setErrorWithAlert(null);

    // Validate phone number
    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      Alert.alert(
        'Please enter a valid phone number',
        '',
        [{ text: 'OK', style: 'default' }],
        { 
          userInterfaceStyle: 'dark',
          cancelable: false,
        }
      );
      return;
    }

    // Validate agreement checkbox
    if (!isAgreementChecked) {
      Alert.alert(
        'Please accept the terms and conditions to continue',
        '',
        [{ text: 'OK', style: 'default' }],
        { 
          userInterfaceStyle: 'dark',
          cancelable: false,
        }
      );
      return;
    }

    // List of valid test numbers with their country codes
    const validTestNumbers = [
      { countryCode: '+86', number: '15933376706' },
      { countryCode: '+86', number: '1806450421' }
    ];
    
    const formattedPhone = `${selectedCountry?.dial_code}${phoneNumber.replace(/\D/g, '')}`;
    
    // Check if the number matches any valid test number
    const isValidTestNumber = validTestNumbers.some(test => 
      `${test.countryCode}${test.number}` === formattedPhone ||
      `${test.countryCode}${test.number}` === `${selectedCountry?.dial_code}${phoneNumber}`
    );
    
    if (!isValidTestNumber) {
      Alert.alert(
        'For testing purposes, please use:\n\n• 8615933376706\n• 861806450421\n\nPlease make sure to select China (+86) as your country code.',
        '',
        [{ text: 'OK', style: 'default' }],
        { 
          userInterfaceStyle: 'dark',
          cancelable: false,
        }
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.signUpWithPhone(formattedPhone);
      
      if (response.error) {
        setErrorWithAlert(getReadableErrorMessage(response.error.message));
        return;
      }

      // If successful, show verification screen
      setShowVerificationScreen(true);
      setErrorWithAlert(null);
    } catch (err: any) {
      setErrorWithAlert(getReadableErrorMessage(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    // Clear any existing errors
    setErrorWithAlert(null);

    if (!verificationCode || verificationCode !== '123456') {
      setErrorWithAlert('Please enter the verification code: 123456');
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhone = `${selectedCountry?.dial_code}${phoneNumber}`;
      const response = await authService.verifyOTP(formattedPhone, verificationCode);
      
      if (response.error) {
        setErrorWithAlert(getReadableErrorMessage(response.error.message));
        return;
      }

      // Handle successful verification
      setErrorWithAlert(null);
      // Navigate to next screen or handle success
    } catch (err: any) {
      setErrorWithAlert(getReadableErrorMessage(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialMediaNavigation = async (socialType: 'google' | 'facebook' | 'whatsapp') => {
    if (socialType === 'whatsapp') {
      const mockData = {
        whatsapp: {
          id: 'w123',
          name: 'John Doe',
          email: 'john@example.com',
          photoUrl: 'https://example.com/john.jpg',
          provider: 'whatsapp'
        }
      };
      setSelectedSocialMedia(socialType);
      setMockUserProfile(mockData.whatsapp);
      setShowSocialConfirm(true);
    }
  };

  const handleSocialPress = (socialType: 'google' | 'facebook' | 'whatsapp') => {
    if (!isAgreementChecked) {
      setSelectedSocialMedia(socialType);
      setShowSocialAcknowledgmentModal(true);
    } else {
      router.push('/(seeker)/seeker-email');
    }
  };

  const handleAcknowledgmentAccept = () => {
    setIsAgreementChecked(true);
    setShowSocialAcknowledgmentModal(false);
    router.push('/(seeker)/seeker-email');
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    setSearchQuery('');
  };

  const sectionData = React.useMemo(() => {
    // Filter countries based on search query
    const filteredCountries = countries.filter(country => {
      const searchLower = searchQuery.toLowerCase().trim();
      const countryNameLower = country.name.toLowerCase();
      const dialCodeLower = country.dial_code.toLowerCase();
      
      if (searchLower === '') return true;
      return countryNameLower.startsWith(searchLower) || dialCodeLower.startsWith(searchLower);
    });

    // Group filtered countries by first letter
    const groups: { [key: string]: Country[] } = {};
    filteredCountries.forEach(country => {
      const firstLetter = country.name[0].toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(country);
    });
    
    return Object.entries(groups)
      .map(([letter, countries]) => ({
        title: letter,
        data: countries
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [searchQuery]); // Add searchQuery as dependency

  const ErrorModal = () => (
    <Modal
      visible={showErrorModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowErrorModal(false)}
    >
      <View style={styles.errorModalContainer}>
        <View style={styles.errorModalContent}>
          <Text style={styles.errorModalMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.errorModalButton}
            onPress={() => setShowErrorModal(false)}
          >
            <Text style={styles.errorModalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const handleNavigateToJobs = () => {
    setShowWelcomeScreen(false);
  };

  const handleNavigateToRecruiter = () => {
    setShowWelcomeScreen(false);
    setShowRecruiterScreen(true);
  };

  const handleBackToWelcome = () => {
    setShowRecruiterScreen(false);
    setShowWelcomeScreen(true);
  };

  if (showWelcomeScreen) {
    return (
      <WelcomeScreen 
        onNavigateToJobs={handleNavigateToJobs}
        onNavigateToRecruiter={handleNavigateToRecruiter}
      />
    );
  }

  if (showRecruiterScreen) {
    return (
      <RecruiterScreen onBack={handleBackToWelcome} />
    );
  }

  if (showSocialConfirm) {
    return (
      <SocialMediaConfirmScreen
        onClose={() => setShowSocialConfirm(false)}
        onPermit={() => {
          setShowSocialConfirm(false);
          // Handle authentication
        }}
        onReject={() => setShowSocialConfirm(false)}
        socialType={selectedSocialMedia || 'google'}
        userProfile={mockUserProfile}
      />
    );
  }

  if (showVerificationScreen) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.verificationContainer}>
          <TouchableOpacity 
            style={styles.verificationBackButton}
            onPress={() => setShowVerificationScreen(false)}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.verificationContent}>
            <Text style={styles.verificationTitle}>Enter Verification{'\n'}Code</Text>
            <Text style={styles.verificationSubtitle}>
              We've sent a verification code to {selectedCountry?.dial_code}{phoneNumber}
            </Text>

            <View style={styles.verificationInputContainer}>
              <View style={styles.codeInputContainer}>
                <TextInput
                  ref={inputRef}
                  style={styles.verificationInput}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                  }}
                  onFocus={() => {
                    setIsKeyboardVisible(true);
                  }}
                  onBlur={() => {
                    setIsKeyboardVisible(false);
                    Keyboard.dismiss();
                  }}
                />
                <TouchableOpacity 
                  style={styles.codeUnderlineContainer}
                  onPress={() => {
                    if (isKeyboardVisible) {
                      inputRef.current?.blur();
                      Keyboard.dismiss();
                    } else {
                      inputRef.current?.focus();
                    }
                  }}
                  activeOpacity={1}
                >
                  {[...Array(6)].map((_, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.codeUnderline,
                        verificationCode[index] ? styles.codeUnderlineFilled : null
                      ]}
                    >
                      <Text style={styles.codeDigit}>
                        {verificationCode[index] || ''}
                      </Text>
                    </View>
                  ))}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.verifyActionsContainer}>
              <View style={styles.verifyButtonContainer}>
                <TouchableOpacity 
                  style={[
                    styles.verifyButton,
                    verificationCode.length === 6 && styles.nextButtonActive,
                    isLoading && styles.nextButtonDisabled
                  ]}
                  onPress={() => {
                    inputRef.current?.blur();
                    handleVerifyCode();
                  }}
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={[
                      styles.verifyButtonText,
                      verificationCode.length === 6 && styles.nextButtonTextActive
                    ]}>
                      Verify
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cantReceiveCodeButton}
                  onPress={() => setShowCantReceiveModal(true)}
                >
                  <Text style={styles.cantReceiveCodeButtonText}>Can't receive code?</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.resendContainer}>
              <TouchableOpacity 
                style={styles.resendButton}
                onPress={handleNextPress}
                disabled={isLoading}
              >
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Can't Receive Code Modal */}
        <Modal
          visible={showCantReceiveModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCantReceiveModal(false)}
        >
          <TouchableOpacity 
            style={styles.cantReceiveModalContainer}
            activeOpacity={1}
            onPress={() => setShowCantReceiveModal(false)}
          >
            <View style={styles.cantReceiveModalWrapper}>
              <View style={styles.cantReceiveModalContent}>
                <Text style={styles.cantReceiveModalHeader}>
                  Can't receive code, you can:
                </Text>
                <View style={styles.modalDivider} />
                <TouchableOpacity 
                  style={styles.changePhoneButton}
                  onPress={() => {
                    setShowCantReceiveModal(false);
                    setShowVerificationScreen(false);
                  }}
                >
                  <Text style={styles.changePhoneButtonText}>Change phone number</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCantReceiveModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <TouchableOpacity 
        style={styles.countryPickerBackButton}
        onPress={() => setShowWelcomeScreen(true)}
      >
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.contentContainer}>
            <View style={styles.topSection}>
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Login / Sign Up</Text>
                <Text style={styles.subtitle}>
                  Please register if you are a new user.
                </Text>
              </View>

              <View style={styles.phoneContainer}>
                <TouchableOpacity 
                  style={styles.countryCodeContainer}
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowCountryPicker(true);
                  }}
                >
                  <Text style={styles.countryCode}>{selectedCountry?.dial_code}</Text>
                  <Ionicons name="chevron-down" size={20} color="#fff" />
                </TouchableOpacity>
                <View style={styles.phoneInputWrapper}>
                  <TextInput
                    ref={phoneInputRef}
                    style={[
                      styles.phoneInput,
                      isPhoneInputFocused && styles.phoneInputFocused
                    ]}
                    placeholder="Phone Number"
                    placeholderTextColor="#999"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    returnKeyType="done"
                    onFocus={() => {
                      setIsPhoneInputFocused(true);
                    }}
                    onBlur={() => {
                      setIsPhoneInputFocused(false);
                    }}
                    onSubmitEditing={() => {
                      Keyboard.dismiss();
                      phoneInputRef.current?.blur();
                    }}
                  />
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={() => {
                      setPhoneNumber('');
                      Keyboard.dismiss();
                      phoneInputRef.current?.blur();
                    }}
                  >
                    <Ionicons name="close" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.emailSection}>
                <Text style={styles.sectionTitle}>You can also use:</Text>
                <TouchableOpacity 
                  style={styles.emailButton}
                  onPress={() => handleSocialPress('google')}
                >
                  <Ionicons name="mail" size={32} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.middleSection}>
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  isAgreementChecked && styles.nextButtonActive,
                  isLoading && styles.nextButtonDisabled
                ]}
                disabled={!isAgreementChecked || isLoading}
                onPress={handleNextPress}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[
                    styles.nextButtonText,
                    isAgreementChecked && styles.nextButtonTextActive
                  ]}>Next</Text>
                )}
              </TouchableOpacity>

              <View style={styles.agreementContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setIsAgreementChecked(!isAgreementChecked)}
                >
                  <Ionicons
                    name={isAgreementChecked ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={isAgreementChecked ? '#007AFF' : '#666'}
                  />
                </TouchableOpacity>
                <View style={styles.agreementTextContainer}>
                  <Text style={styles.agreementText}>
                    I have read and agreed the{' '}
                  </Text>
                  <TouchableOpacity onPress={() => {/* Handle user agreement press */}}>
                    <Text style={styles.agreementLink}>JOB user's agreement</Text>
                  </TouchableOpacity>
                  <Text style={styles.agreementText}> and the </Text>
                  <TouchableOpacity onPress={() => {/* Handle privacy policy press */}}>
                    <Text style={styles.agreementLink}>privacy policy</Text>
                  </TouchableOpacity>
                  <Text style={styles.agreementText}>, and I allow JOB manage my account information</Text>
                </View>
              </View>
            </View>

            <View style={styles.bottomLinks}>
              <TouchableOpacity>
                <Text style={styles.linkText}>Hotline Service</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.linkText}>File a Complaint</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={false}
        statusBarTranslucent={false}
        onRequestClose={() => {
          setShowCountryPicker(false);
          setSearchQuery('');
        }}
      >
        <View style={styles.countryPickerMainContainer}>
          <View style={styles.countryPickerContainer}>
            <View style={styles.countryPickerHeader}>
              <TouchableOpacity 
                style={styles.countryPickerBackButton}
                onPress={() => {
                  setShowCountryPicker(false);
                  setSearchQuery('');
                }}
              >
                <Ionicons name="chevron-back" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.countryPickerTitle}>Select Country</Text>
            </View>
            
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search countries"
                  placeholderTextColor="#666"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                  }}
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <SectionList
              sections={sectionData}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => handleCountrySelect(item)}
                >
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryDialCode}>{item.dial_code}</Text>
                </TouchableOpacity>
              )}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{title}</Text>
                </View>
              )}
              stickySectionHeadersEnabled={true}
            />
          </View>
        </View>
      </Modal>
      <SlidingPuzzleCaptcha
        visible={showCaptcha}
        onClose={() => setShowCaptcha(false)}
        onSuccess={() => {
          setIsCaptchaVerified(true);
          setShowCaptcha(false);
        }}
      />
      {/* Social Media Acknowledgment Modal */}
      <Modal
        visible={showSocialAcknowledgmentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSocialAcknowledgmentModal(false)}
      >
        <View style={styles.acknowledgmentModalContainer}>
          <View style={styles.acknowledgmentModalContent}>
            <Text style={styles.acknowledgmentModalText}>
              I have read and agreed the{' '}
              <Text style={styles.acknowledgmentModalLink} onPress={() => {/* Handle agreement press */}}>
                JOB user's agreement
              </Text>
              {' '}and the{' '}
              <Text style={styles.acknowledgmentModalLink} onPress={() => {/* Handle privacy press */}}>
                privacy policy
              </Text>
              , and I allow JOB manage my account information
            </Text>
            <View style={styles.acknowledgmentModalButtons}>
              <TouchableOpacity 
                style={styles.acknowledgmentModalRejectButton}
                onPress={() => setShowSocialAcknowledgmentModal(false)}
              >
                <Text style={styles.acknowledgmentModalRejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.acknowledgmentModalAcceptButton}
                onPress={handleAcknowledgmentAccept}
              >
                <Text style={styles.acknowledgmentModalAcceptText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ErrorModal />
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
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  topSection: {
    marginBottom: 20,
  },
  headerContainer: {
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
    lineHeight: 22,
    marginBottom: 20,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  countryCode: {
    color: '#fff',
    fontSize: 16,
    marginRight: 5,
  },
  phoneInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: 24,
    padding: 0,
  },
  phoneInputFocused: {
    color: '#fff',
  },
  clearButton: {
    padding: 5,
    opacity: 0.8,
  },
  emailSection: {
    marginTop: 10,
  },
  sectionTitle: {
    color: '#666',
    fontSize: 16,
    marginBottom: 15,
  },
  emailButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    marginLeft: 30,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  nextButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  nextButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  nextButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextActive: {
    color: '#fff',
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 10,
    marginTop: 2,
  },
  agreementTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  agreementText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  agreementLink: {
    color: '#007AFF',
    fontSize: 14,
    lineHeight: 20,
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 5,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#000',
  },
  countryName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '400',
  },
  countryDialCode: {
    color: '#666',
    fontSize: 17,
    fontWeight: '400',
  },
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
  },
  linkText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  cantReceiveModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  cantReceiveModalWrapper: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  cantReceiveModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  cantReceiveModalHeader: {
    color: '#fff',
    fontSize: 16,
    padding: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#333',
    width: '100%',
  },
  changePhoneButton: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3a3a3a',
  },
  changePhoneButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    marginTop: 8,
    overflow: 'hidden',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    padding: 20,
  },
  countryPickerMainContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  countryPickerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  countryPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    height: Platform.OS === 'ios' ? 100 : 70,
    paddingHorizontal: 16,
  },
  countryPickerBackButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryPickerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginRight: 44, // To balance the back button width
  },
  searchContainer: {
    padding: 8,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    padding: 0,
    height: 24,
  },
  sectionHeader: {
    backgroundColor: '#1a1a1a',
    padding: 8,
    paddingLeft: 16,
  },
  sectionHeaderText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  acknowledgmentModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  acknowledgmentModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  acknowledgmentModalText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  acknowledgmentModalLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  acknowledgmentModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
  },
  acknowledgmentModalRejectButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  acknowledgmentModalAcceptButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  acknowledgmentModalRejectText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  acknowledgmentModalAcceptText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  errorModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 16,
    width: '80%',
    maxWidth: 280,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  errorModalMessage: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  errorModalButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    minWidth: 80,
  },
  errorModalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  verificationContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  verificationContent: {
    flex: 1,
    padding: 20,
    paddingTop: 100,
  },
  verificationBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 45 : 25,
    left: 16,
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  verificationTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 40,
  },
  verificationSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginTop: 10,
  },
  verificationInputContainer: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: 'center',
  },
  codeInputContainer: {
    width: '100%',
    position: 'relative',
  },
  verificationInput: {
    position: 'absolute',
    width: '100%',
    height: 60,
    opacity: 0,
    zIndex: 1,
  },
  codeUnderlineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  codeUnderline: {
    width: 40,
    height: 60,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeUnderlineFilled: {
    borderBottomColor: '#007AFF',
  },
  codeDigit: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '400',
  },
  verifyActionsContainer: {
    marginBottom: 20,
  },
  verifyButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  verifyButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  verifyButtonText: {
    color: '#666',
    fontSize: 17,
    fontWeight: '600',
  },
  cantReceiveCodeButton: {
    marginTop: 12,
    padding: 8,
  },
  cantReceiveCodeButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '400',
  },
  resendContainer: {
    marginTop: 'auto',
    marginBottom: 20,
    alignItems: 'center',
  },
  resendButton: {
    padding: 16,
  },
  resendText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '500',
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
});