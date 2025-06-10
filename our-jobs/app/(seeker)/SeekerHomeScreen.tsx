import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import SeekerVerificationScreen from '../components/SeekerVerificationScreen';
import SeekerEmailRegister from '../(auth)/seeker-email-register';
import { countries } from '../utils/countries';

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
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [showEmailRegister, setShowEmailRegister] = useState(false);
  const [isPhoneInputFocused, setIsPhoneInputFocused] = useState(false);
  const phoneInputRef = React.useRef<TextInput>(null);
  const router = useRouter();
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const inputAccessoryViewID = 'phoneNumberInput';

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

  const handleNextPress = async () => {
    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      Alert.alert(
        'Please enter a valid phone number',
        '',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'dark' }
      );
      return;
    }

    if (!isAgreementChecked) {
      Alert.alert(
        'Please accept the terms and conditions to continue',
        '',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'dark' }
      );
      return;
    }

    const validTestNumbers = [
      { countryCode: '+86', number: '15933376706' },
      { countryCode: '+86', number: '1806450421' }
    ];
    
    const formattedPhone = `${selectedCountry?.dialCode}${phoneNumber.replace(/\D/g, '')}`;
    
    const isValidTestNumber = validTestNumbers.some(test => 
      `${test.countryCode}${test.number}` === formattedPhone ||
      `${test.countryCode}${test.number}` === `${selectedCountry?.dialCode}${phoneNumber}`
    );
    
    if (!isValidTestNumber) {
      Alert.alert(
        'For testing purposes, please use:\n\n• 8615933376706\n• 861806450421\n\nPlease make sure to select China (+86) as your country code.',
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
      setShowVerificationScreen(true);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    setSearchQuery('');
  };

  const handleEmailPress = () => {
    setShowAgreementModal(true);
  };

  const handleAgreementAccept = () => {
    setShowAgreementModal(false);
    setIsAgreementChecked(true);
    setShowEmailRegister(true);
  };

  const handleVerificationSuccess = () => {
    // Handle successful verification
    router.push('/(seeker)/seeker-dashboard' as any);
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

  if (showVerificationScreen) {
    return (
      <SeekerVerificationScreen
        phoneNumber={phoneNumber}
        countryCode={selectedCountry?.dialCode || ''}
        onBack={() => setShowVerificationScreen(false)}
        onVerificationSuccess={handleVerificationSuccess}
      />
    );
  }

  if (showEmailRegister) {
    return (
      <SeekerEmailRegister
        onBack={() => setShowEmailRegister(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
            <TouchableOpacity 
              style={styles.emailButton}
              onPress={handleEmailPress}
            >
              <Ionicons name="mail" size={32} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSection}>
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

      {/* Agreement Modal for Email Registration */}
      <Modal
        visible={showAgreementModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAgreementModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAgreementModal(false)}>
          <View style={styles.agreementModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.agreementModalContent}>
                <Text style={styles.agreementModalText}>
                  I have read and agreed the{' '}
                  <Text style={styles.agreementModalLink}>JOB user's agreement</Text>
                  {' '}and the{' '}
                  <Text style={styles.agreementModalLink}>privacy policy</Text>
                  , and I allow JOB manage my account information
                </Text>
                <View style={styles.agreementModalButtons}>
                  <TouchableOpacity
                    style={styles.agreementModalButton}
                    onPress={() => setShowAgreementModal(false)}
                  >
                    <Text style={styles.agreementModalButtonTextReject}>Reject</Text>
                  </TouchableOpacity>
                  <View style={styles.agreementModalButtonDivider} />
                  <TouchableOpacity
                    style={styles.agreementModalButton}
                    onPress={handleAgreementAccept}
                  >
                    <Text style={styles.agreementModalButtonTextAccept}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
    marginTop: 0,
    marginBottom: 0,
    paddingVertical: 25,
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
  },
  nextButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  nextButtonDisabled: {
    opacity: 0.7,
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
  agreementModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  agreementModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    width: '80%',
    overflow: 'hidden',
  },
  agreementModalText: {
    color: '#666',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    padding: 20,
  },
  agreementModalLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  agreementModalButtons: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
  },
  agreementModalButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  agreementModalButtonDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#333',
  },
  agreementModalButtonTextReject: {
    color: '#666',
    fontSize: 17,
  },
  agreementModalButtonTextAccept: {
    color: '#007AFF',
    fontSize: 17,
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