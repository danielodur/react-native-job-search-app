import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  InputAccessoryView,
  Modal,
  SectionList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { countries } from '../utils/countries';

type Country = { name: string; code: string; dialCode: string; };

const groupedCountries = countries.reduce((acc: { [key: string]: Country[] }, country) => {
  const firstLetter = country.name[0].toUpperCase();
  if (!acc[firstLetter]) {
    acc[firstLetter] = [];
  }
  acc[firstLetter].push(country);
  return acc;
}, {});

const initialSections = Object.keys(groupedCountries)
  .sort()
  .map(letter => ({
    title: letter,
    data: groupedCountries[letter].sort((a, b) => a.name.localeCompare(b.name))
  }));

export default function SeekerPhoneLogin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputAccessoryViewID = 'phoneLoginInputAccessoryViewID';

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
    countries.find(country => country.code === 'UG')
  );
  const [isPhoneInputFocused, setIsPhoneInputFocused] = useState(false);
  const [filteredSections, setFilteredSections] = useState(initialSections);

  const handleBackPress = () => {
    if (phoneNumber || password) {
      Alert.alert(
        'Warning',
        'If you go back, your information will be lost. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Yes', 
            style: 'destructive', 
            onPress: () => router.back()
          }
        ],
        { userInterfaceStyle: 'dark' }
      );
    } else {
      router.back();
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    setSearchQuery('');
    setFilteredSections(initialSections);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text) {
      setFilteredSections(initialSections);
      return;
    }
    const lowerCaseText = text.toLowerCase();
    const filtered = initialSections.map(section => ({
      ...section,
      data: section.data.filter(country =>
        country.name.toLowerCase().includes(lowerCaseText) ||
        country.dialCode.includes(text)
      )
    })).filter(section => section.data.length > 0);
    setFilteredSections(filtered);
  };

  const handlePasswordLogin = async () => {
    if (!phoneNumber.trim() || !selectedCountry) {
      Alert.alert('Required Field', 'Please select country and enter phone number');
      return;
    }
    if (!password) {
      Alert.alert('Required Field', 'Please enter your password');
      return;
    }
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const formattedPhoneNumber = `${selectedCountry.dialCode}${cleanNumber}`;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        phone: formattedPhoneNumber,
        password: password,
      });

      if (error) {
        console.error("Password Login Error:", error.message);
        Alert.alert('Login Failed', error.message || 'Invalid credentials or network error.');
      } else if (data.session) {
        console.log("Password Login Successful");
        router.replace('/(seeker)/seeker-dashboard'); 
      } else {
         Alert.alert('Login Error', 'Could not log you in. Please try again.');
      }
    } catch (error) {
      console.error("Password Login Catch Error:", error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOtpLogin = async () => {
     if (!phoneNumber.trim() || !selectedCountry) {
      Alert.alert('Required Field', 'Please select country and enter phone number');
      return;
    }
     const cleanNumber = phoneNumber.replace(/\D/g, '');
     if (cleanNumber.length < 9 || cleanNumber.length > 15) {
         Alert.alert('Invalid Phone Number', 'Please enter a valid phone number.');
        return;
    }
     const formattedPhoneNumber = `${selectedCountry.dialCode}${cleanNumber}`;
     setIsLoading(true);
     try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhoneNumber,
      });
      if (error) {
         console.error("OTP Send Error:", error.message);
         Alert.alert('Login Error', `Could not send verification code. ${error.message.includes('User not found') ? 'Phone not registered.' : 'Please try again.'}`);
      } else {
         console.log("OTP Sent successfully, navigating to verification.");
         router.push({ 
          pathname: '/(auth)/seeker-phone-verification',
          params: { phoneNumber: cleanNumber, countryCode: selectedCountry.dialCode }
        });
      }
    } catch (error) {
      console.error("OTP Login Catch Error:", error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBackPress}
      >
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} 
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
          <View style={styles.innerContainer}> 
            <View style={styles.contentArea}> 
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Sign In</Text>
                <Text style={styles.subtitle}>Enter your phone number and password.</Text>
              </View>
              
              <View style={styles.phoneInputSection}>
                <TouchableOpacity 
                  style={styles.countryCodeContainer}
                  onPress={() => {
                    Keyboard.dismiss(); 
                    setShowCountryPicker(true);
                  }}
                >
                  <Text style={styles.countryCodeText}>{selectedCountry?.dialCode ?? 'Select'}</Text>
                  <Ionicons name="chevron-down" size={20} color="#fff" />
                </TouchableOpacity>
                <View style={styles.phoneInputWrapper}>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Phone Number"
                    placeholderTextColor="#999"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    returnKeyType="done"
                    onFocus={() => setIsPhoneInputFocused(true)}
                    onBlur={() => setIsPhoneInputFocused(false)}
                    inputAccessoryViewID={inputAccessoryViewID}
                  />
                  {phoneNumber.length > 0 && (
                    <TouchableOpacity 
                      style={styles.clearButton}
                      onPress={() => setPhoneNumber('')}
                    >
                      <Ionicons name="close-circle" size={20} color="#888" />
                    </TouchableOpacity>
                  )}                       
                </View>
              </View>

              <View style={styles.inputWrapper}> 
                 <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
                 <View style={styles.passwordContainer}>
                   <TextInput
                     style={styles.passwordInput}
                     placeholder="Enter password"
                     placeholderTextColor="#666"
                     value={password}
                     onChangeText={setPassword}
                     secureTextEntry={!showPassword}
                     returnKeyType="done"
                     onSubmitEditing={handlePasswordLogin}
                     inputAccessoryViewID={inputAccessoryViewID}
                   />
                   <TouchableOpacity
                     style={styles.eyeIcon}
                     onPress={() => setShowPassword(!showPassword)}
                   >
                     <Ionicons
                       name={showPassword ? 'eye-off' : 'eye'}
                       size={24}
                       color="#666"
                     />
                   </TouchableOpacity>
                 </View>
               </View>

              <TouchableOpacity 
                    style={styles.forgotPasswordButton} 
              >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

            </View>
            
            <View style={styles.fixedBottomContainer}>
              <TouchableOpacity
                style={[ styles.loginButton, isLoading && styles.loginButtonDisabled ]}
                onPress={handlePasswordLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.altLoginButton} onPress={handleOtpLogin}>
                 <Text style={styles.altLoginText}>Login with verification code instead</Text>
              </TouchableOpacity>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/(seeker)/SeekerHomeScreen' as any)}>
                  <Text style={styles.registerLink}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

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
                <Text style={styles.countryCodeValue}>{item.dialCode}</Text>
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
             <TouchableOpacity onPress={dismissKeyboard}>
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
  keyboardAvoidingContainer: { 
    flex: 1,
  },
   innerContainer: { 
    flex: 1,
    justifyContent: 'space-between',
  },
   contentArea: { 
    paddingHorizontal: 20, 
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 10,
    zIndex: 999,
    padding: 10,
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    marginBottom: 30,
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
  },
  phoneInputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20, 
    paddingLeft: 10,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingRight: 10,
    marginRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  countryCodeText: {
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
    paddingVertical: 15,
    paddingRight: 10,
    color: '#fff',
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
    marginLeft: 5,
  },
  inputWrapper: {
    marginBottom: 15,
  },
  label: { 
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  required: { 
    color: '#FF3B30',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    paddingLeft: 5,
    color: '#fff',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    paddingVertical: 10,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  fixedBottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 10,
    backgroundColor: '#000', 
    borderTopWidth: Platform.OS === 'android' ? 1 : 0,
    borderTopColor: '#1a1a1a',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  loginButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#555',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  altLoginButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  altLoginText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: { flex: 1, backgroundColor: '#000' },
  modalHeader: { height: Platform.OS === 'ios' ? 44 : 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, backgroundColor: '#000', borderBottomWidth: 1, borderBottomColor: '#1a1a1a', marginTop: Platform.OS === 'ios' ? 44 : 0 },
  modalBackButton: { position: 'absolute', left: 16, padding: 8, zIndex: 1 },
  modalTitle: { fontSize: 20, fontWeight: '600', color: '#fff', textAlign: 'center' },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#000' },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, height: 36, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 17, padding: 0 },
  countryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#333' },
  countryName: { color: '#fff', fontSize: 16 },
  countryCodeValue: { color: '#666', fontSize: 16 },
  sectionHeader: { backgroundColor: '#1a1a1a', padding: 10 },
  sectionHeaderText: { color: '#666', fontSize: 16, fontWeight: '600' },
  inputAccessory: { height: 44, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', backgroundColor: '#1a1a1a', borderTopWidth: 1, borderTopColor: '#333', paddingHorizontal: 16 },
  doneButton: { color: '#007AFF', fontSize: 17, fontWeight: '600' },
}); 