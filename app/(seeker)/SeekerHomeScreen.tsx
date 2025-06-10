import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  SectionList,
  InputAccessoryView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { countries } from '../utils/countries';
import { supabase } from '../lib/supabase';

type Country = {
  name: string;
  code: string;
  dialCode: string;
};

// Group countries by first letter
const groupedCountries = countries.reduce((acc: { [key: string]: Country[] }, country) => {
  const firstLetter = country.name[0].toUpperCase();
  if (!acc[firstLetter]) {
    acc[firstLetter] = [];
  }
  acc[firstLetter].push(country);
  return acc;
}, {});

const sections = Object.keys(groupedCountries)
  .sort()
  .map(letter => ({
    title: letter,
    data: groupedCountries[letter].sort((a, b) => a.name.localeCompare(b.name))
  }));

export default function SeekerHomeScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
    countries.find(country => country.code === 'UG')
  );
  const [isPhoneInputFocused, setIsPhoneInputFocused] = useState(false);
  const phoneInputRef = React.useRef<TextInput>(null);
  const router = useRouter();
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState('');
  const inputAccessoryViewID = 'phoneNumberInput';
  const [isLoading, setIsLoading] = useState(false);

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

  const checkPhoneNumberExists = async (phoneNumber: string, countryCode: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('phone')
        .eq('phone', `${countryCode}${phoneNumber}`)
        .single();

      if (error) {
        console.error('Error checking phone number:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking phone number:', error);
      return false;
    }
  };

  const handleNextPress = async () => {
    if (!phoneNumber || !selectedCountry?.dialCode) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    if (!isAgreementChecked) {
      Alert.alert('Error', 'Please accept the terms and conditions');
      return;
    }

    // Validate phone number format
    const phoneValidationError = validatePhoneNumber(phoneNumber);
    if (phoneValidationError) {
      Alert.alert('Invalid Phone Number', phoneValidationError);
      return;
    }

    // Format phone number to E.164 format (remove "+" and spaces)
    const formattedPhoneNumber = `${selectedCountry.dialCode}${phoneNumber.replace(/\D/g, '')}`.replace(/[\s+]/g, '');

    setIsLoading(true);
    try {
      // For test phone numbers, show loading for visual feedback then navigate
      if (formattedPhoneNumber === '8615933376706') {
        await new Promise(resolve => setTimeout(resolve, 800)); // Visual loading feedback
        router.replace({
          pathname: '/(auth)/seeker-phone-verification',
          params: {
            phoneNumber: phoneNumber.replace(/\D/g, ''),
            countryCode: selectedCountry.dialCode,
            isTestAccount: 'true'
          }
        });
        return;
      }

      // Send OTP for real phone numbers
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: formattedPhoneNumber,
      });

      if (otpError) {
        if (otpError.message.includes('not a valid phone number') || 
            otpError.message.includes('Invalid phone number format') ||
            otpError.message.includes('To\' number')) {
          Alert.alert(
            'Invalid Phone Number',
            'The phone number you entered is not valid. Please check the country code and number, then try again.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Verification Error',
            'We couldn\'t send a verification code to this number. Please check the number and try again.',
            [{ text: 'OK' }]
          );
        }
        return;
      }

      // Navigate to verification screen
      router.replace({
        pathname: '/(auth)/seeker-phone-verification',
        params: {
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          countryCode: selectedCountry.dialCode,
          isExistingUser: 'false'
        }
      });
    } catch (error: any) {
      console.error('Error in handleNextPress:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    setSearchQuery('');
  };

  const handleEmailRegister = () => {
    if (!isAgreementChecked) {
      setPendingNavigation('register');
      setShowAgreementModal(true);
      return;
    }
    router.push('/(auth)/seeker-email-register');
  };

  const handleEmailLogin = () => {
    if (!isAgreementChecked) {
      setPendingNavigation('login');
      setShowAgreementModal(true);
      return;
    }
    router.push('/(auth)/seeker-email-login');
  };

  const handleAccept = () => {
    setIsAgreementChecked(true);
    setShowAgreementModal(false);
    if (pendingNavigation === 'register') {
      router.push('/(auth)/seeker-email-register');
    } else if (pendingNavigation === 'login') {
      router.push('/(auth)/seeker-email-login');
    }
    setPendingNavigation('');
  };

  const handleReject = () => {
    setShowAgreementModal(false);
    setPendingNavigation('');
  };

  // Add country picker search functionality
  const [filteredSections, setFilteredSections] = useState(sections);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text) {
      setFilteredSections(sections);
      return;
    }

    const filtered = sections.map(section => ({
      title: section.title,
      data: section.data.filter(country =>
        country.name.toLowerCase().includes(text.toLowerCase()) ||
        country.dialCode.includes(text)
      )
    })).filter(section => section.data.length > 0);

    setFilteredSections(filtered);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar style="light" />
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>

      <View style={styles.mainContent}>
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
              <Text style={styles.countryCode}>{selectedCountry?.dialCode}</Text>
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
                onFocus={() => setIsPhoneInputFocused(true)}
                onBlur={() => setIsPhoneInputFocused(false)}
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                  phoneInputRef.current?.blur();
                }}
                inputAccessoryViewID={inputAccessoryViewID}
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
            <View style={styles.emailButtonsContainer}>
              <TouchableOpacity 
                style={styles.textButton}
                onPress={handleEmailRegister}
              >
                <Text style={styles.textButtonText}>Email Register</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.textButton}
                onPress={handleEmailLogin}
              >
                <Text style={styles.textButtonText}>Email Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              isAgreementChecked && !isLoading && styles.nextButtonActive,
              isLoading && styles.nextButtonLoading,
            ]}
            disabled={!isAgreementChecked || isLoading}
            onPress={handleNextPress}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
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
              <TouchableOpacity>
                <Text style={styles.agreementLink}>JOB user's agreement</Text>
              </TouchableOpacity>
              <Text style={styles.agreementText}> and the </Text>
              <TouchableOpacity>
                <Text style={styles.agreementLink}>privacy policy</Text>
              </TouchableOpacity>
              <Text style={styles.agreementText}>, and I allow JOB manage my account information</Text>
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
      </View>

      {/* Agreement Modal */}
      <Modal
        visible={showAgreementModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleReject}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              I have read and agreed to the{' '}
              <Text style={styles.link} onPress={() => {/* Handle agreement link */}}>
                JOB user's agreement
              </Text>
              {' '}and the{' '}
              <Text style={styles.link} onPress={() => {/* Handle privacy policy link */}}>
                privacy policy
              </Text>
              , and I allow JOB to manage my account information
            </Text>
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={handleReject}
              >
                <Text style={styles.modalButtonTextReject}>Reject</Text>
              </TouchableOpacity>
              <View style={styles.modalDivider} />
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={handleAccept}
              >
                <Text style={styles.modalButtonTextAccept}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalBackButton}
              onPress={() => {
                setShowCountryPicker(false);
                setSearchQuery('');
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Country</Text>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search countries"
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={handleSearch}
                autoCapitalize="none"
              />
            </View>
          </View>

          <SectionList
            sections={filteredSections}
            keyExtractor={(item, index) => item.code + index}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.countryItem}
                onPress={() => handleCountrySelect(item)}
              >
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.countryCode}>{item.dialCode}</Text>
              </TouchableOpacity>
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{title}</Text>
              </View>
            )}
            stickySectionHeadersEnabled
          />
        </SafeAreaView>
      </Modal>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={styles.inputAccessory}>
            <TouchableOpacity 
              onPress={() => {
                Keyboard.dismiss();
                phoneInputRef.current?.blur();
              }}
            >
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
  mainContent: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 10,
    zIndex: 999,
    padding: 10,
  },
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 60,
    backgroundColor: '#000',
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
    marginBottom: 25,
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
    marginTop: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  emailButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  textButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 16,
  },
  textButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 25,
  },
  nextButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 56,
    justifyContent: 'center',
  },
  nextButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  nextButtonLoading: {
    backgroundColor: '#0056b3',
    borderColor: '#0056b3',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    height: Platform.OS === 'ios' ? 44 : 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    marginTop: Platform.OS === 'ios' ? 44 : 0,
  },
  modalBackButton: {
    position: 'absolute',
    left: 16,
    padding: 8,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#000',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    height: 36,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 17,
    padding: 0,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  countryName: {
    color: '#fff',
    fontSize: 16,
  },
  sectionHeader: {
    backgroundColor: '#1a1a1a',
    padding: 10,
  },
  sectionHeaderText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    width: '90%',
    maxWidth: 340,
    overflow: 'hidden',
  },
  modalText: {
    color: '#666',
    fontSize: 16,
    lineHeight: 24,
    padding: 20,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonTextReject: {
    color: '#666',
    fontSize: 17,
    fontWeight: '400',
  },
  modalButtonTextAccept: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  modalDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#333',
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
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
}); 